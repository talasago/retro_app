import os
from copy import deepcopy
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
        original_errors: list["ErrorDict"] = tr.translate(errors, locale=DEFAULT_LOCALE)
        translated_errors: list[dict] = deepcopy(original_errors)  # 一応deepcopyしてる

        for error in translated_errors:
            error.pop("url", None)

            if "email" in error.get("loc", ""):
                # NOTE: python-email-validatorをgrepして、様々なバリデーションメッセージがあると判明したが、
                # 1つ一つ対応するのは骨が折れるので対応しない
                error["msg"] = "有効なメールアドレスではありません。"

        return translated_errors
