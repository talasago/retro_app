from fastapi import HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from datetime import datetime, timedelta
from uuid import uuid4
from ..helpers.password_helper import PasswordHelper

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from ..models.user_model import UserModel
    from ..repository.user_repository import UserRepository
    from uuid import UUID


# JWT関連の設定
# FIXME:シークレットキーは機密情報なので、本番実行時には環境変数など別の場所に記載する。
SECRET_KEY = 'secret_key'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 10
REFRESH_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')


class AuthService:
    def __init__(self, user_repo: 'UserRepository') -> None:
        self.__user_repo: 'UserRepository' = user_repo

    def get_current_user(self, token: str,
                         expect_token_type='access_token') -> 'UserModel':
        """access_tokenからユーザーを取得"""
        # トークンをデコードしてペイロードを取得
        # TODO:例外処理
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)

        if payload['token_type'] != expect_token_type:
            # TODO:カスタムエラークラスにする
            raise HTTPException(status_code=401, detail='トークンタイプ不一致')

        # DBからユーザーを取得
        user = self.__user_repo.find_by('uuid', payload['uid'])
        # TODO:ユーザーが0件だった時の考慮が必要

        return user

    def get_current_user_from_refresh_token(self, token: str) -> 'UserModel':
        """refresh_tokenからユーザーを取得"""

        user: 'UserModel' = self.get_current_user(
            token=token, expect_token_type='refresh_token')

        # TODO:後で実装
        # リフレッシュトークンの場合、受け取ったものとDBに保存されているものが一致するか確認
        # if payload['token_type'] == 'refresh_token' and user.refresh_token != token:
        #    print(user.refresh_token, '¥n', token)
        #    raise HTTPException(status_code=401, detail='リフレッシュトークン不一致')
        return user

    # TODO:エラー時に平文パスワードが見えないようにする仕組みが必要
    def authenticate(self, email: str, password: str) -> 'UserModel':
        """パスワード認証し、userを返す"""

        user: 'UserModel' = self.__user_repo.find_by('email', value=email)
        # TODO:emailで検索した結果0件の場合の考慮が必要。get_user_by_email()内でErrorにするのか？それとも別案？

        if not PasswordHelper.is_password_matching(plain_pw=password,
                                                   hashed_pw=user.hashed_password):
            # TODO:カスタムエラークラスにする
            raise HTTPException(status_code=401, detail='パスワード不一致')
        return user

    def generate_tokens(self, user_uuid: 'UUID') -> dict[str, str]:
        """アクセストークンとリフレッシュトークンを返す"""
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
            'exp': datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),  # noqa E501
            'uid': str(user_uuid),
            'jti': str(uuid4())
        }

        access_token: str = jwt.encode(claims=access_payload,
                                       key=SECRET_KEY, algorithm=ALGORITHM)
        refresh_token: str = jwt.encode(claims=refresh_payload,
                                        key=SECRET_KEY, algorithm=ALGORITHM)

        return {'access_token': access_token, 'refresh_token': refresh_token,
                'token_type': 'bearer'}

    def save_refresh_token(self, user: 'UserModel', refresh_token: str) -> None:
        """リフレッシュトークンをusersテーブルに保存する"""
        user.refresh_token = refresh_token
        self.__user_repo.update_user(user)
