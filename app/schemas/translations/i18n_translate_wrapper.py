import os
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

        for error in translated_errors:
            if "email" in error.get("loc"):
                # NOTE: python-email-validatorをgrepして、様々なバリデーションメッセージがあると判明したが、
                # 1つ一つ対応するのは骨が折れるので対応しない
                error["msg"] = "有効なメールアドレスではありません。"
            error.pop("url", None)
        return translated_errors
