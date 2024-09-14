import copy

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic_core import ValidationError

from app.schemas.translations.i18n_translate_wrapper import I18nTranslateWrapper


async def exception_handler_validation_error(
    _: "Request", exc: ValidationError | RequestValidationError
) -> JSONResponse:
    errors: list = __sanitize_errors(exc.errors())  # type: ignore

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": I18nTranslateWrapper.trans(errors)},
    )


def __sanitize_errors(errors: list) -> list:
    # 影響はないと思うが、配列が呼び出し元に影響与えたくないためコピーする
    return_errors = copy.deepcopy(errors)

    for error in return_errors:
        if "ctx" in error and not isinstance(
            error.get("ctx", {}).get("error", ""), str
        ):
            # pydenticのカスタムバリデーションを使ったとき、
            # ctx.errorに"ValueError(hogehoge)"となるとJSONに変換できないため、strに変換する
            error["ctx"]["error"] = str(error["ctx"]["error"])

        if "input" in error and not isinstance(error.get("input", ""), str):
            # {}をAPIで渡すとなぜかFieldInfoがinputに入っているのでその対応
            # pydanticかfastapiの問題だと思うが...
            error["input"] = str(error["input"])

        if "loc" in error and (error.get("loc", "") == ("body", "password")):
            # パスワードをそのままレスポンスボディに含めないようにする
            error["input"] = "[MASKED]"
    return return_errors
