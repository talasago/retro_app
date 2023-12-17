"""WebAPIのエントリポイント。プレゼンテーション層。"""
from typing import TYPE_CHECKING

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from mangum import Mangum

from app.errors.retro_app_error import (
    RetroAppAuthenticationError,
    RetroAppRecordNotFoundError,
    RetroAppTokenExpiredError,
)
from app.functions.dependencies import (
    get_auth_service,
    get_current_user,
    get_user_repo,
    oauth2_scheme,
)
from app.models.user_model import UserModel
from app.schemas.http_response_body_user_schema import (
    ApiResponseBodyBase,
    RefreshTokenApiResponseBody,
    SignInApiResponseBody,
    TokenApiResponseBody,
)
from app.schemas.translations.I18nTranslateWrapper import I18nTranslateWrapper
from app.schemas.user_schema import UserCreate

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
if TYPE_CHECKING:
    from fastapi import Request

    from app.repository.user_repository import UserRepository
    from app.services.auth_service import AuthService

app = FastAPI()
# TODO:originとMethodを可変にしたい。そして外だししたい。
# TODO:その他の設定は適切に設定したい。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 許可するフロントエンドのオリジン
    allow_credentials=True,  # 資格情報の共有の可否
    allow_methods=["*"],  # 許可するHTTPリクエストメソッド
    allow_headers=["*"],  # フロントエンドからの認可するHTTPヘッダー情報
    expose_headers=["*"],  # フロントエンドがアクセスできるHTTPヘッダー情報
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: "Request", exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": I18nTranslateWrapper.trans(exc.errors())},  # type: ignore
        #  type(exc.errors()) => listとなっていることを確認している
    )


@app.post(
    "/api/v1/sign_up",
    summary="ユーザーを登録します。",
    response_model=SignInApiResponseBody,
    status_code=status.HTTP_201_CREATED,
)
def signup_user(
    user_params: UserCreate, user_repo: "UserRepository" = Depends(get_user_repo)
):
    """ユーザー登録のAPIエンドポイント"""
    user: UserModel = UserModel(
        name=user_params.name, email=user_params.email, password=user_params.password
    )
    user_repo.save(user=user)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content=SignInApiResponseBody().model_dump(),
    )


# NOTE:OpenAPIのAuthorizeボタンが、/tokenにアクセスするため、/api/v1を付けていない。変える方法は調べていない
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/prefix/token")かなあ
@app.post("/token", summary="ログインしてトークンを発行します。", response_model=TokenApiResponseBody)
def sign_in(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: "AuthService" = Depends(get_auth_service),
):
    """
    Request bodyのParameters(form_data):
      - grant_type: 使用していない
      - username: このアプリではユーザーのメールアドレスとする。紛らわしいがユーザー名ではない。
        OAuthの仕様でメールアドレスがないため、仕方なくusernameに入れている。
      - password: ユーザーのパスワード
      - self.scopes: 使用していない
      - client_id: 使用していない
      - client_secret: 使用していない
    """

    try:
        user: "UserModel" = auth_service.authenticate(
            email=form_data.username, password=form_data.password
        )
    except (RetroAppAuthenticationError, RetroAppRecordNotFoundError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが間違っています。",
            headers={"WWW-Authenticate": "Bearer"},
        )

    tokens = auth_service.create_tokens(user=user)

    res_body = TokenApiResponseBody(name=user.name, **tokens)
    return JSONResponse(status_code=status.HTTP_200_OK, content=res_body.model_dump())


@app.post(
    "/refresh_token",
    summary="リフレッシュトークンでトークンを再発行します。",
    response_model=RefreshTokenApiResponseBody,
)
def refresh_token(
    auth_service: "AuthService" = Depends(get_auth_service),
    token: str = Depends(oauth2_scheme),
    Authorization: str = Header(  # noqa: N803
        description="OpenAPIで入力値を指定しても、リクエストヘッダーに含まれないため、cURL等で試してください",  # noqa: E501
        examples=["Bearer [ログインAPIのレスポンスのrefresh_token]"],
    ),
):
    # AuthorizationはOpenAPI上に表示するためのダミー引数
    """リフレッシュトークンでトークンを再取得"""
    try:
        current_user: "UserModel" = auth_service.get_current_user_from_refresh_token(
            refresh_token=token
        )
    except RetroAppRecordNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザーが存在しません。",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except RetroAppAuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str("Tokenが間違っています。"),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except RetroAppTokenExpiredError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str("ログイン有効期間を過ぎています。再度ログインしてください。"),
            headers={"WWW-Authenticate": "Bearer"},
        )

    tokens = auth_service.create_tokens(user=current_user)
    res_body = RefreshTokenApiResponseBody(**tokens)

    return JSONResponse(status_code=status.HTTP_200_OK, content=res_body.model_dump())


@app.post("/api/v1/logout", summary="ログアウトします。", response_model=ApiResponseBodyBase)
def logout(
    current_user: "UserModel" = Depends(get_current_user),
    auth_service: "AuthService" = Depends(get_auth_service),
):
    """ログアウトのエンドポイント。リフレッシュトークンを無効化する"""

    # NOTE:アクセストークンの無効化は、セキュリティ的に対応した方が良いかもしれないが、絶対必要な処理ではないため一旦対応しない。
    # アクセストークンを無効化するなら、アクセストークンのブロックリストを管理する必要がある。
    # ログアウト時と、リフレッシュトークン発行時にaccess_tokenの有効期限が切れていない場合にブロックリストに入れる必要あり。

    auth_service.delete_refresh_token(current_user)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=ApiResponseBodyBase(message="ログアウトしました").model_dump(),
    )


handler = Mangum(app)
