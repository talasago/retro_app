from __future__ import annotations
import re
from typing import ClassVar
from pydantic import BaseModel, EmailStr, field_validator, SecretStr, Field


class UserSchema(BaseModel):
    """pydanticのモデルクラス"""

    email: EmailStr
    name: str = Field(max_length=50)

    # emailについて
    # NOTE:emailのバリデーションはコチラ
    # https://github.com/JoshData/python-email-validator/blob/5abaa7b4ce6677e5a2217db2e52202a760de3c24/email_validator/validate_email.py#
    # 最大文字列長とかもやってくれてそう。
    # TODO:ただ、メッセージの日本語化はこちら側で実装しないといけないかも

    # nameについて
    # WARNING: サロゲートペアとか絵文字とかのカウントは考慮してない。
    # FIXME: 制御文字は許可したくないかも
    # TODO:バックスラッシュと円記号は片方だけの許可でいい気がする

    @field_validator('name', mode='before')  # type: ignore
    @classmethod
    def name_strip(cls, name: str) -> str | None:
        # 半角スペースも全角スペースも削除する
        return None if name is None else name.strip().strip('　')

    class Config:
        orm_mode = True


class UserCreate(UserSchema):
    password: SecretStr
    PASSWARD_REGEX: ClassVar[str] = \
        r'^[0-9a-zA-Z!?_+*\'"`#$%&\-^\\@;:,./=~|[\](){}<>]{8,50}$'

    # NOTE:半角英数字記号をそれぞれ1種類以上含む8文字以上50文字じゃないと登録できないようにしようと考えたが、
    # それだとユーザー登録ハードルが高くなるのでやめた
    # もしやるとしても、フロント側で「そのパスワードは弱いですよ」みたいな警告レベルにする
    # \A(?=.*?[a-z])(?=.*?\d)(?=.*?[!-/:-@[-`{-~])[!-~]{8,50}\Z(?i)

    @field_validator('password')
    @classmethod
    def check_password_format(cls, password: SecretStr) -> str:
        reveal_password: str = password.get_secret_value()
        if not re.match(UserCreate.PASSWARD_REGEX, reveal_password):
            raise ValueError(
                'パスワードには半角の数字、記号、大文字英字、小文字英字を含んだ8文字以上の文字を入力してください。')
        return reveal_password
