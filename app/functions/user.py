"""WebAPIのエントリポイント。プレゼンテーション層。"""

from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, Header, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm

from app.errors.retro_app_error import (
    RetroAppAuthenticationError,
    RetroAppColmunUniqueError,
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
    ClientErrorResponseBody,
    LogoutApiResponseBody,
    RefreshTokenApiResponseBody,
    SignInApiResponseBody,
    TokenApiResponseBody,
)
from app.schemas.user_schema import UserCreate

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
if TYPE_CHECKING:
    from app.repository.user_repository import UserRepository
    from app.services.auth_service import AuthService

router = APIRouter(tags=["user"], prefix="/api/v1")


@router.post(
    "/sign_up",
    summary="ユーザーを登録します。",
    response_model=SignInApiResponseBody,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_409_CONFLICT: {
            "model": ClientErrorResponseBody,
        }
    },
)
def signup_user(
    user_params: UserCreate, user_repo: "UserRepository" = Depends(get_user_repo)
):
    """ユーザー登録のAPIエンドポイント"""
    user: UserModel = UserModel(name=user_params.name, password=user_params.password)
    try:
        user_repo.save(user=user)
    except RetroAppColmunUniqueError as e:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=ClientErrorResponseBody(message=str(e)).model_dump(),
            headers={"WWW-Authenticate": "Bearer"},
        )

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content=SignInApiResponseBody().model_dump(),
    )


@router.post(
    "/token",
    summary="ログインしてトークンを発行します。",
    response_model=TokenApiResponseBody,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ClientErrorResponseBody,
        }
    },
)
def sign_in(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: "AuthService" = Depends(get_auth_service),
):
    """
    Request bodyのParameters(form_data):
      - grant_type: 使用していない
      - username: ユーザー名
      - password: ユーザーのパスワード
      - self.scopes: 使用していない
      - client_id: 使用していない
      - client_secret: 使用していない
    """

    try:
        user: "UserModel" = auth_service.authenticate(
            username=form_data.username, password=form_data.password
        )
    except (RetroAppAuthenticationError, RetroAppRecordNotFoundError):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=ClientErrorResponseBody(
                message="メールアドレスまたはパスワードが間違っています。"
            ).model_dump(),
            headers={"WWW-Authenticate": "Bearer"},
        )

    tokens = auth_service.create_tokens(user=user)

    res_body = TokenApiResponseBody(name=user.name, **tokens)
    return JSONResponse(status_code=status.HTTP_200_OK, content=res_body.model_dump())


@router.post(
    "/refresh_token",
    summary="リフレッシュトークンでトークンを再発行します。",
    response_model=RefreshTokenApiResponseBody,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ClientErrorResponseBody,
        }
    },
    description="※422を返すパターンは恐らくないはず。",
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
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=ClientErrorResponseBody(
                message="ユーザーが存在しません。"
            ).model_dump(),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except RetroAppAuthenticationError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=ClientErrorResponseBody(
                message="Tokenが間違っています。"
            ).model_dump(),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except RetroAppTokenExpiredError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=ClientErrorResponseBody(
                message="ログイン有効期間を過ぎています。再度ログインしてください。"
            ).model_dump(),
            headers={"WWW-Authenticate": "Bearer"},
        )

    tokens = auth_service.create_tokens(user=current_user)
    res_body = RefreshTokenApiResponseBody(**tokens)

    return JSONResponse(status_code=status.HTTP_200_OK, content=res_body.model_dump())


@router.post(
    "/logout",
    summary="ログアウトします。",
    response_model=LogoutApiResponseBody,
    status_code=status.HTTP_200_OK,
)
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
        content=LogoutApiResponseBody().model_dump(),
    )
