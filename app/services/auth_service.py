from fastapi import HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt


# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from ..models.user_model import UserModel
    from ..repository.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')

# JWT関連の設定
# FIXME:シークレットキーは機密情報なので、本番実行時には環境変数など別の場所に記載する。
SECRET_KEY = 'secret_key'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 10
REFRESH_TOKEN_EXPIRE_DAYS = 7


class AuthService:
    def __init__(self, user_repo: 'UserRepository') -> None:
        self.__user_repo: 'UserRepository' = user_repo

    def get_current_user(self, token: str) -> 'UserModel':
        """tokenからユーザーを取得"""
        # トークンをデコードしてペイロードを取得
        # TODO:例外処理
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)

        if payload['token_type'] not in ['refresh_token', 'access_token']:
            # TODO:カスタムエラークラスにする
            raise HTTPException(status_code=401, detail='トークンタイプ不一致')

        # DBからユーザーを取得
        user = self.__user_repo.find_by_uuid(payload['uid'])
        # TODO:ユーザーが0件だった時の考慮が必要

        return user

    def get_current_user_from_refresh_token(self, token: str) -> 'UserModel':
        """tokenからユーザーを取得"""
        # トークンをデコードしてペイロードを取得
        # TODO:例外処理
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)

        if payload['token_type'] not in ['refresh_token', 'access_token']:
            # TODO:カスタムエラークラスにする
            raise HTTPException(status_code=401, detail='トークンタイプ不一致')

        # DBからユーザーを取得
        user = self.__user_repo.find_by_uuid(payload['uid'])
        # TODO:ユーザーが0件だった時の考慮が必要

        # TODO:後で実装
        # リフレッシュトークンの場合、受け取ったものとDBに保存されているものが一致するか確認
        # if payload['token_type'] == 'refresh_token' and user.refresh_token != token:
        #    print(user.refresh_token, '¥n', token)
        #    raise HTTPException(status_code=401, detail='リフレッシュトークン不一致')
        return user
