"""WebAPIのエントリポイント。プレゼンテーション層。"""

from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse

from app.functions.dependencies import (
    get_comment_repo,
    get_current_user,
)
from app.models.retrospective_method.comment_model import CommentModel
from app.models.user_model import UserModel
from app.schemas.http_response_body_user_schema import (
    ApiResponseBodyBase,
)
from app.schemas.retrospective_method.comment_schema import CommentCreate, CommentSchema

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
if TYPE_CHECKING:
    from app.repository.retrospective_method.comment_repository import CommentRepository

router = APIRouter()

# TODO : 後でやる openAPI response_model=ApiResponseBodyBase
@router.post(
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

    # ここでエラー発生時に、RequestValidationErrorを発生させれば良かっただけかもしれない...
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
