from typing import TYPE_CHECKING

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic_core import ValidationError

from app.schemas.translations.i18n_translate_wrapper import I18nTranslateWrapper

if TYPE_CHECKING:
    from typing import Sequence

    from pydantic_core import ErrorDetails


async def exception_handler_validation_error(
    _: "Request", exc: ValidationError
) -> JSONResponse:
    errors: list[ErrorDetails] = exc.errors()

    for error in errors:
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

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": I18nTranslateWrapper.trans(errors)},  # type: ignore
        #  type(exc.errors()) => listとなっていることを確認している
    )


async def exception_handler_request_calidation_error(
    _: "Request", exc: RequestValidationError
) -> JSONResponse:
    errors: Sequence[dict] = exc.errors()

    for error in errors:
        if "ctx" in error and not isinstance(
            error.get("ctx", "").get("error", ""), str
        ):
            # pydenticのカスタムバリデーションを使ったとき、
            # ctx.errorに"ValueError(hogehoge)"となるとJSONに変換できないため、strに変換する
            error["ctx"]["error"] = str(error["ctx"]["error"])
        if "loc" in error and (error.get("loc", "") == ("body", "password")):
            # パスワードをそのままレスポンスボディに含めないようにする
            error["input"] = "[MASKED]"

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": I18nTranslateWrapper.trans(errors)},  # type: ignore
        #  type(exc.errors()) => listとなっていることを確認している
    )
