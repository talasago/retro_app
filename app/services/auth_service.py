from datetime import datetime, timedelta
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from app.errors.retro_app_error import (
    RetroAppAuthenticationError,
    RetroAppTokenExpiredError,
)
from app.schemas.token_schema import TokenPayload, TokenType
from app.utils.jwt_wrapper import JwtWrapper

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
if TYPE_CHECKING:
    from app.models.user_model import UserModel
    from app.repository.user_repository import UserRepository


ACCESS_TOKEN_EXPIRE_MINUTES = 10
REFRESH_TOKEN_EXPIRE_DAYS = 7


class AuthService:
    """認証に関わるビジネスロジックを司る"""

    def __init__(self, user_repo: "UserRepository") -> None:
        self.__user_repo: "UserRepository" = user_repo

    def get_current_user(
        self, token: str, expect_token_type=TokenType.ACCESS_TOKEN
    ) -> "UserModel":
        """tokenからユーザーを取得"""
        if expect_token_type not in TokenType.__members__.values():
            raise ValueError(f"Invalid expect_token_type: {expect_token_type}")

        decoded_token: dict = self.__decode(token)
        payload: TokenPayload = TokenPayload(**decoded_token)

        self.__validate_payload(payload, expect_token_type)
        # ログインしててもしていなくても良い機能を作る時は、オプション引数追加して、そのフラグで例外を返すかどうか制御しても良さそうかも
        return self.__user_repo.find_by("uuid", payload.uid)  # type: ignore

    def get_current_user_from_refresh_token(self, refresh_token: str) -> "UserModel":
        """refresh_tokenからユーザーを取得"""

        if refresh_token is None:
            raise TypeError("refresh_token must be other than None")

        user: "UserModel" = self.get_current_user(
            token=refresh_token, expect_token_type=TokenType.REFRESH_TOKEN
        )

        # リフレッシュトークンの場合、DBに保存されているリフレッシュトークンが一致するか確認する
        if user.refresh_token != refresh_token:
            raise RetroAppAuthenticationError(
                message="リフレッシュトークンが間違っています。"
            )
        return user

    # TODO:エラー時に平文パスワードが見えないようにする仕組みが必要
    def authenticate(self, email: str, password: str) -> "UserModel":
        """認証(emailとpasswordが一致するかどうか)し、認証できたuserを返す"""
        if email is None or password is None:
            raise TypeError("email and password must be other than None")

        user: "UserModel" = self.__user_repo.find_by("email", value=email)  # type: ignore

        if not user.is_password_matching(plain_password=password):  # type: ignore
            raise RetroAppAuthenticationError(message="パスワードが一致しません。")
        return user

    def create_tokens(self, user: "UserModel") -> dict[str, str]:
        """
        アクセストークンとリフレッシュトークンを返す。また、リフレッシュトークンをDBに保存する。
        """

        if user is None:
            raise TypeError("user must be other than None")

        # ペイロード作成
        # NOTE: uidには、uuidを使用する。
        # uuidを使用する理由：悪意の第三者がtokenを復号できた場合を想定し、以下の懸念がありそれに対応するため。
        # uidにemailを設定したら => 個人情報が漏れてしまう
        # uidにidを指定したら => ユーザー数がわかってしまう

        access_payload = TokenPayload(
            token_type=TokenType.ACCESS_TOKEN,
            # FIXME:日本時間に変更する
            exp=datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            uid=str(user.uuid),
            jti=str(uuid4()),
        )

        refresh_payload = TokenPayload(
            token_type=TokenType.REFRESH_TOKEN,
            exp=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
            uid=str(user.uuid),
            jti=str(uuid4()),
        )

        access_token: str = JwtWrapper.encode(payload=access_payload.model_dump())
        refresh_token: str = JwtWrapper.encode(payload=refresh_payload.model_dump())

        # リフレッシュトークンをusersテーブルに保存する
        user.refresh_token = refresh_token
        self.__user_repo.save(user)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    def delete_refresh_token(self, user: "UserModel") -> None:
        user.refresh_token = None
        self.__user_repo.save(user)

    def __decode(self, token: str) -> dict:
        try:
            decoded_token: dict = JwtWrapper.decode(token)
        except JwtWrapper.ExpiredSignatureError as e:
            raise RetroAppTokenExpiredError(message=str(e))
        except JwtWrapper.JwtError as e:
            raise RetroAppAuthenticationError(message=str(e))

        return decoded_token

    def __validate_payload(
        self, payload: TokenPayload, expect_token_type: TokenType
    ) -> None:
        if payload.token_type != expect_token_type.value:
            raise RetroAppAuthenticationError("TokenTypeが一致しません。")

        try:
            UUID(payload.uid)
        except ValueError:
            raise RetroAppAuthenticationError("uuidの形式が正しくありません。")
