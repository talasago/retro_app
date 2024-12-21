"""WebAPIのエントリポイント。プレゼンテーション層。"""

from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse

from app.errors.retro_app_error import RetroAppRecordNotFoundError
from app.functions.dependencies import (
    get_comment_repo,
    get_current_user,
)
from app.models.retrospective_method.comment_model import CommentModel
from app.models.user_model import UserModel
from app.schemas.http_response_body_user_schema import (
    AddCommentApiResponseBody,
    ClientErrorResponseBody,
    DeleteCommentApiResponseBody,
    GetCommentApiResponseBody,
)
from app.schemas.retrospective_method.comment_schema import CommentCreate, CommentSchema

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
if TYPE_CHECKING:
    from app.repository.retrospective_method.comment_repository import CommentRepository

router = APIRouter(tags=["comment"], prefix="/api/v1/retrospective_method")


@router.post(
    "/{retrospective_method_id}/comment",
    summary="レビューコメントを登録します。",
    status_code=status.HTTP_201_CREATED,
    response_model=AddCommentApiResponseBody,
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
        content=AddCommentApiResponseBody().model_dump(),
    )


@router.get(
    "/{retrospective_method_id}/comment",
    summary="レビューコメントを取得します。",
    status_code=status.HTTP_200_OK,
    response_model=GetCommentApiResponseBody,
)
def get_comment(
    retrospective_method_id: int,
    comment_repo: "CommentRepository" = Depends(get_comment_repo),
):
    """コメント取得のエンドポイント。"""

    comments = comment_repo.find_all(
        conditions={"retrospective_method_id": retrospective_method_id},
        order_by_cols=[CommentModel.created_at],
    )

    result_comments: list[dict] = []
    for comment in comments:
        comment_dict = comment.to_dict()
        result_comments.append(comment_dict)

    return JSONResponse(
        content=GetCommentApiResponseBody(comments=result_comments).model_dump()
    )


@router.delete(
    "/{retrospective_method_id}/comment/{comment_id}",
    summary="レビューコメントを削除します。",
    status_code=status.HTTP_200_OK,
    response_model=DeleteCommentApiResponseBody,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": ClientErrorResponseBody,
        }
    },
)
def delete_comment(
    retrospective_method_id: int,
    comment_id: int,
    current_user: "UserModel" = Depends(get_current_user),
    comment_repo: "CommentRepository" = Depends(get_comment_repo),
):
    """コメント削除のエンドポイント。"""
    try:
        comment = comment_repo.find_one(
            conditions={
                "id": comment_id,
                "user_id": current_user.id,
                "retrospective_method_id": retrospective_method_id,
            }
        )
    except RetroAppRecordNotFoundError as e:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=ClientErrorResponseBody(message=e.message).model_dump(),
        )

    comment_repo.delete(comment)

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=DeleteCommentApiResponseBody().model_dump(),
    )
