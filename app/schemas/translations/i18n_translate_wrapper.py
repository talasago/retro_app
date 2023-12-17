import os
import re
from typing import TYPE_CHECKING, Final, List

from pydantic_i18n import JsonLoader, PydanticI18n

if TYPE_CHECKING:
    from pydantic.error_wrappers import ErrorDict

DEFAULT_LOCALE: Final[str] = "ja_JP"
tlans_path = os.path.dirname(os.path.abspath(__file__))
loader = JsonLoader(tlans_path)
tr = PydanticI18n(loader, default_locale=DEFAULT_LOCALE)


class I18nTranslateWrapper:
    """エラーメッセージを日本語に変換するための翻訳ラッパークラス"""

    @classmethod
    def trans(cls, errors: list["ErrorDict"]) -> List:
        translated_errors = tr.translate(errors, locale=DEFAULT_LOCALE)

        # 正規表現を使用してアルファベットを削除
        # 理由：「String should have at most {} characters」のようなエラーメッセージの場合
        # 「50 charactars文字以下で入力してください。」と不要な英語が残ってしまうため
        # 恐らくPydanticI18nのバグ
        for error in translated_errors:
            error["msg"] = re.sub("[a-zA-Z]", "", error["msg"])

        return translated_errors
