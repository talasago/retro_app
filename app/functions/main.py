from typing import TYPE_CHECKING

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from mangum import Mangum
from pydantic import ValidationError

import app.functions.handlers as exception_handler
from app.functions.middleware import add_cors_middleware
from app.functions.retrospective_method.comment import router as comment_router
from app.functions.user import router as user_router

if TYPE_CHECKING:
    from fastapi import Request


app = FastAPI()
add_cors_middleware(app)


# MEMO: CommentCreateではなく、CommentSchemaでバリデーションエラーになった時はこちら
# CommentCreateがCommentSchemaを継承してないため。
# add_commentの引数指定のCommentCreateを入れていても、
# パスパラのretrospective_idをCommentCreateに自動で設定できないため、継承していない
@app.exception_handler(ValidationError)
async def exception_handler_validation_error(request: "Request", exc: ValidationError):
    return await exception_handler.exception_handler_validation_error(request, exc)


@app.exception_handler(RequestValidationError)
async def exception_handler_request_calidation_error(
    request: "Request", exc: RequestValidationError
) -> JSONResponse:
    return await exception_handler.exception_handler_validation_error(request, exc)


app.include_router(comment_router)
app.include_router(user_router)

handler = Mangum(app)
