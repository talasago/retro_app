from app.schemas.translations.i18n_translate_wrapper import (
    I18nTranslateWrapper,
)


class TestI18nTranslateWrapper:
    def test_trans(self):
        # テスト観点：
        # ①複数のエラーがある場合でも翻訳されていること
        # ②不要な英語が含まれていないこと
        # ③msgがNoneの場合でもエラーにならないこと
        errors = [
            {
                "type": "value_error",
                "loc": ("email",),
                "msg": "value is not a valid email address: The email address is not valid. It must have exactly one @-sign.",
                "input": "invalid_email",
                "ctx": {
                    "reason": "The email address is not valid. It must have exactly one @-sign."
                },
            },
            {
                "type": "string_too_long",
                "loc": ("name",),
                "msg": "String should have at most 50 characters",
                "input": "fffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                "ctx": {"max_length": 50},
                "url": "https://errors.pydantic.dev/2.5/v/string_too_long",
            },
            {
                "type": "string_type",
                "loc": ("name",),
                "msg": "Input should be a valid string",
                "input": None,
                "url": "https://errors.pydantic.dev/2.5/v/string_type",
            },
        ]

        translated_errors = I18nTranslateWrapper.trans(errors)
        assert translated_errors[0]["msg"] == "有効なメールアドレスではありません。"
        assert translated_errors[1]["msg"] == "50 文字以下で入力してください。"
        assert translated_errors[2]["msg"] == "有効な文字を入力してください。"
