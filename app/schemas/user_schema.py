from __future__ import annotations

import re
from typing import ClassVar

from pydantic import Field, SecretStr, field_validator

from .base_model import BaseModel


class UserSchema(BaseModel):
    """pydanticのモデルクラス"""

    name: str = Field(
        max_length=50, description="ユーザーの名前", examples=["Test User"]
    )

    # nameについて
    # WARNING: サロゲートペアとか絵文字とかのカウントは考慮してない。
    # FIXME: 制御文字は許可したくないかも
    # TODO:バックスラッシュと円記号は片方だけの許可でいい気がする

    @field_validator("name", mode="before")  # type: ignore
    @classmethod
    def name_strip(cls, name: str) -> str | None:
        # 半角スペースも全角スペースも削除する
        return None if name is None else name.strip().strip("　")


class UserCreate(UserSchema):
    PASSWARD_REGEX: ClassVar[str] = (
        r'^[0-9a-zA-Z!?_+*\'"`#$%&\-^\\@;:,.\/=~|[\](){}<>]{8,50}$'
    )
    password: SecretStr = Field(
        description=f"ユーザーのパスワード。regex_prttern: {PASSWARD_REGEX}",
        examples=["password"],
    )

    # NOTE:半角英数字記号をそれぞれ1種類以上含む8文字以上50文字じゃないと登録できないようにしようと考えたが、
    # それだとユーザー登録ハードルが高くなるのでやめた
    # もしやるとしても、フロント側で「そのパスワードは弱いですよ」みたいな警告レベルにする
    # \A(?=.*?[a-z])(?=.*?\d)(?=.*?[!-/:-@[-`{-~])[!-~]{8,50}\Z(?i)

    @field_validator("password")
    @classmethod
    def check_password_format(cls, password: SecretStr) -> str:
        reveal_password: str = password.get_secret_value()
        if not re.match(cls.PASSWARD_REGEX, reveal_password):
            raise ValueError("パスワードには8文字以上の文字を入力してください。")
        return reveal_password
