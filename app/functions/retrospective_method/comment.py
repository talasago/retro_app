"""WebAPIのエントリポイント。プレゼンテーション層。"""

from typing import TYPE_CHECKING

from fastapi import Depends, FastAPI, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from mangum import Mangum
from pydantic_core import ValidationError

import app.functions.handlers as exception_handler
from app.functions.dependencies import (
    get_comment_repo,
    get_current_user,
)
from app.functions.middleware import add_cors_middleware
from app.models.retrospective_method.comment_model import CommentModel
from app.models.user_model import UserModel
from app.schemas.http_response_body_user_schema import (
    ApiResponseBodyBase,
)
from app.schemas.retrospective_method.comment_schema import CommentCreate, CommentSchema

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
if TYPE_CHECKING:
    from fastapi import Request

    from app.repository.retrospective_method.comment_repository import CommentRepository


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


# TODO : 後でやる openAPI response_model=ApiResponseBodyBase
@app.post(
    "/api/v1/retrospective_method/{retrospective_method_id}/comment",
    summary="レビューコメント登録します。",
)
def add_comment(
    retrospective_method_id: int,
    comment_params: CommentCreate,
    current_user: "UserModel" = Depends(get_current_user),
    comment_repo: "CommentRepository" = Depends(get_comment_repo),
):
    """コメント登録のエンドポイント。"""

    comment = CommentSchema(
        retrospective_method_id=retrospective_method_id,
        user_id=current_user.id,
        comment=comment_params.comment,
    )
    comment_repo.save(CommentModel(**comment.model_dump()))

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content=ApiResponseBodyBase(
            message="コメント登録が完了しました。"
        ).model_dump(),
    )


handler = Mangum(app)
