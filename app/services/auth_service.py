from jose import jwt
from jose import exceptions as jwt_exceptions
from datetime import datetime, timedelta
from uuid import uuid4
from ..schemas.token_schema import TokenPayload, TokenType
from ..errors.retro_app_error import (RetroAppAuthenticationError,
                                      RetroAppRecordNotFoundError,
                                      RetroAppTokenExpiredError)

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from ..models.user_model import UserModel
    from ..repository.user_repository import UserRepository
    from uuid import UUID


# JWT関連の設定
# FIXME:シークレットキーは機密情報なので、本番実行時には環境変数など別の場所に記載する。
# アルゴリズムも環境変数化しておこう
SECRET_KEY = 'secret_key'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 10
REFRESH_TOKEN_EXPIRE_DAYS = 7


class AuthService:
    """認証に関わるビジネスロジックを司る"""

    def __init__(self, user_repo: 'UserRepository') -> None:
        self.__user_repo: 'UserRepository' = user_repo

    def get_current_user(
            self, token: str,
            expect_token_type=TokenType.ACCESS_TOKEN) -> 'UserModel':
        """tokenからユーザーを取得"""
        if expect_token_type not in TokenType.__members__.values():
            raise ValueError(f'Invalid expect_token_type: {expect_token_type}')

        try:
            decoded_token: dict = jwt.decode(token, SECRET_KEY,
                                             algorithms=ALGORITHM)
        except jwt_exceptions.ExpiredSignatureError as e:
            raise RetroAppTokenExpiredError(message=str(e))
        except jwt_exceptions.JWTError as e:
            raise RetroAppAuthenticationError(message=str(e))

        payload: TokenPayload = TokenPayload(**decoded_token)

        if payload.token_type != expect_token_type.value:
            raise RetroAppAuthenticationError('TokenTypeが一致しません。')

        # DBからユーザーを取得
        try:
            # ログインしててもしていなくても良い機能を作る時は、オプション引数追加して、そのフラグで例外を返すかどうか制御しても良さそうかも
            user = self.__user_repo.find_by('uuid', payload.uid)
        except RetroAppRecordNotFoundError as e:
            raise e

        return user

    def get_current_user_from_refresh_token(self,
                                            refresh_token: str) -> 'UserModel':
        """refresh_tokenからユーザーを取得"""

        if refresh_token is None:
            raise TypeError('refresh_token must be other than None')

        try:
            user: 'UserModel' = self.get_current_user(
                token=refresh_token,
                expect_token_type=TokenType.REFRESH_TOKEN)
        except (RetroAppRecordNotFoundError,
                RetroAppAuthenticationError,
                RetroAppTokenExpiredError) as e:
            raise e

        # リフレッシュトークンの場合、DBに保存されているリフレッシュトークンが一致するか確認する
        if user.refresh_token != refresh_token:
            raise RetroAppAuthenticationError(message='リフレッシュトークンが間違っています。')
        return user

    # TODO:エラー時に平文パスワードが見えないようにする仕組みが必要
    def authenticate(self, email: str, password: str) -> 'UserModel':
        """認証(emailとpasswordが一致するかどうか)し、認証できたuserを返す"""
        if email is None or password is None:
            raise TypeError('email and password must be other than None')

        try:
            user: 'UserModel' = self.__user_repo.find_by('email', value=email)
        except RetroAppRecordNotFoundError as e:
            raise e

        if not user.is_password_matching(plain_password=password):  # type: ignore
            raise RetroAppAuthenticationError(message='パスワードが一致しません。')
        return user

    def generate_tokens(self, user_uuid: 'UUID') -> dict[str, str]:
        """アクセストークンとリフレッシュトークンを返す"""
        if user_uuid is None:
            raise TypeError('user_uuid must be other than None')

        # ペイロード作成
        # NOTE: uidには、uuidを使用する。
        # uuidを使用する理由：悪意の第三者がtokenを復号できた場合を想定し、以下の懸念がありそれに対応するため。
        # uidにemailを設定したら => 個人情報が漏れてしまう
        # uidにidを指定したら => ユーザー数がわかってしまう

        access_payload = TokenPayload(
            token_type=TokenType.ACCESS_TOKEN,
            # FIXME:日本時間に変更する
            exp=datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            uid=str(user_uuid),
            jti=str(uuid4())
        )

        refresh_payload = TokenPayload(
            token_type=TokenType.REFRESH_TOKEN,
            exp=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
            uid=str(user_uuid),
            jti=str(uuid4())
        )

        access_token: str = jwt.encode(claims=access_payload.model_dump(),
                                       key=SECRET_KEY, algorithm=ALGORITHM)
        refresh_token: str = jwt.encode(claims=refresh_payload.model_dump(),
                                        key=SECRET_KEY, algorithm=ALGORITHM)

        # これをpydanticの型にしてもいいかも？レスポンスモデルで使用できるなら。
        return {'access_token': access_token, 'refresh_token': refresh_token,
                'token_type': 'bearer'}

    def save_refresh_token(self, user: 'UserModel', refresh_token: str) -> None:
        """リフレッシュトークンをusersテーブルに保存する"""
        user.refresh_token = refresh_token
        self.__user_repo.save(user)

    def delete_refresh_token(self, user: 'UserModel') -> None:
        user.refresh_token = None
        self.__user_repo.save(user)
