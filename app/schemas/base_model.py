import os
import re
from typing import List

from pydantic import BaseModel as _BaseModel
from pydantic import ConfigDict
from pydantic_core import ValidationError
from pydantic_i18n import JsonLoader, PydanticI18n

file_dir = os.path.dirname(os.path.abspath(__file__))
tlans_path = os.path.join(file_dir, "translations/")
loader = JsonLoader(tlans_path)
tr = PydanticI18n(loader, default_locale="ja_JP")


class BaseModel(_BaseModel):
    model_config = ConfigDict(from_attributes=True)


class JaMassageValidationError(ValueError):
    """エラーメッセージを日本語に変換するための翻訳ラッパークラスにする"""

    def __init__(self, exception: ValidationError) -> None:
        self.exception = exception

    # クラスメソッドでもいい気がする
    def trans(self) -> List:
        translated_errors = tr.translate(self.exception.errors(), locale="ja_JP")
        # FIXME:配列0固定のまま
        if any(char.isalpha() for char in translated_errors[0]["msg"]):
            # 正規表現を使用してアルファベットを削除
            # 理由：「String should have at most {} characters」のようなエラーメッセージの場合
            # 「50 charactars文字以下で入力してください。」と不要な英語が残ってしまうため
            # 恐らくPydanticI18nのバグ
            # TODO:これはif文要らないかも
            translated_errors[0]["msg"] = re.sub(
                "[a-zA-Z]", "", translated_errors[0]["msg"]
            )
        return translated_errors
