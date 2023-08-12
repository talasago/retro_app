from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from mangum import Mangum
from sqlalchemy.orm import Session
from ..schemas.user_schema import UserCreate
from ..repository.user_repository import UserRepository
from ..helpers.password_helper import PasswordHelper
from jose import jwt
from datetime import datetime, timedelta
from uuid import uuid4
from .dependencies import get_current_user, get_db
# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from ..models.user_model import UserModel
    from uuid import UUID

app = FastAPI()


# ユーザー登録のエンドポイント
# FIXME:response_modelが間違ってる
@app.post('/api/v1/sign_up', response_model=UserCreate)
def signup_user(user: UserCreate, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user_repo.create_user(user_params=user)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={'message': 'ユーザー登録が成功しました。'}
    )


# ログインのエンドポイント
# FIXME:response_model追加
# NOTE:OpenAPIのAuthorizeボタンが、/tokenにアクセスするため、/api/v1を付けていない。変える方法は調べていない
@app.post('/token')
def sign_in(form_data: OAuth2PasswordRequestForm = Depends(),
            db: Session = Depends(get_db)):
    """ログインして、トークン発行する"""
    # NOTE:usernameとあるが、実際はemailを使用する。OAuthの仕様によりusernameという名前になっているらしい。
    user = authenticate(db, form_data.username, form_data.password)
    token = create_tokens(user.uuid)

    return JSONResponse(
        # FIXME:ステータスコードの指定忘れてた
        content={'message': 'ログインしました', 'name': user.name,  **token}
    )


# FIXME:response_model追加
@app.post('/refresh_token')
def refresh_token(current_user: 'UserModel' = Depends(get_current_user)):
    """リフレッシュトークンでトークンを再取得"""
    return create_tokens(current_user.uuid)


# ログアウトのエンドポイント
# TODO:非同期処理でも良いかもしれない
# FIXME:response_model追加
@app.post('/api/v1/logout')
def logout(current_user: 'UserModel' = Depends(get_current_user)):
    # TODO:リフレッシュトークンを無効化

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={'message': 'ログアウトしました'}
    )


handler = Mangum(app)


# HACK:以下のコードはサービスクラス or ヘルパークラスに移動すること
# TODO:エラー時に平文パスワードが見えないようにする仕組みが必要
def authenticate(db: Session, email: str, password: str) -> 'UserModel':
    """パスワード認証し、userを返却"""
    user_repo = UserRepository(db)
    user: 'UserModel' = user_repo.get_user_by_email(email=email)
    # TODO:emailで検索した結果0件の場合の考慮が必要。get_user_by_email()内でErrorにするのか？それとも別案？

    if not PasswordHelper.is_password_matching(plain_pw=password,
                                               hashed_pw=user.hashed_password):
        # TODO:カスタムエラークラスにする
        raise HTTPException(status_code=401, detail='パスワード不一致')
    return user


# JWT関連の設定
# FIXME:シークレットキーは機密情報なので、本番実行時には環境変数など別の場所に記載する。
SECRET_KEY = 'secret_key'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 10
REFRESH_TOKEN_EXPIRE_DAYS = 7


def create_tokens(user_uuid: 'UUID') -> dict:
    """アクセストークンとリフレッシュトークンを返す"""
    # REVIEW: リフレッシュトークンだけ更新するときもこのメソッドを通るのでよいのか？アクセストークンが変わりそうな気がするが

    # ペイロード作成
    # NOTE: uidには、uuidを使用する。
    # uuidを使用する：悪意の第三者がtokenを復号できた場合、uidにemailを設定すると個人情報が、
    # uidにidを指定するとユーザー数がわかってしまいセキュリティ上良くないため。
    access_payload = {
        'token_type': 'access_token',
        'exp': datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),  # noqa: E501
        'uid': str(user_uuid),
        'jti': str(uuid4())
    }
    refresh_payload = {
        'token_type': 'refresh_token',
        'exp': datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        'uid': str(user_uuid),
        'jti': str(uuid4())
    }

    access_token = jwt.encode(claims=access_payload,
                              key=SECRET_KEY, algorithm=ALGORITHM)
    refresh_token = jwt.encode(claims=refresh_payload,
                               key=SECRET_KEY, algorithm=ALGORITHM)

    # TODO: DBにリフレッシュトークンを保存

    return {'access_token': access_token, 'refresh_token': refresh_token,
            'token_type': 'bearer'}
