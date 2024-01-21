"""WebAPIのエントリポイント。プレゼンテーション層。"""
from typing import TYPE_CHECKING

from fastapi import Depends, FastAPI, status
from fastapi.responses import JSONResponse
from mangum import Mangum

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
from app.schemas.retrospective_method.comment_schema import CommentCreate

# from app.schemas.user_schema import UserCreate

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
if TYPE_CHECKING:
    from app.repository.retrospective_method.comment_repository import CommentRepository


app = FastAPI()
add_cors_middleware(app)


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

    comment: CommentModel = CommentModel(
        retrospective_method_id=retrospective_method_id,
        user_id=current_user.id,
        comment=comment_params.comment,
    )
    # TODO:重複エラーの時、4xx系を返すようにする
    comment_repo.save(comment)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content=ApiResponseBodyBase(message="コメント登録が完了しました。").model_dump(),
    )


handler = Mangum(app)
