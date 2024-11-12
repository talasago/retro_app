"""WebAPIのエントリポイント。プレゼンテーション層。"""

import os
from typing import TYPE_CHECKING

import boto3
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse

from app.functions.dependencies import (
    get_comment_repo,
    get_current_user,
)
from app.models.user_model import UserModel
from app.schemas.http_response_body_user_schema import (
    AddCommentApiResponseBody,
    GetCommentApiResponseBody,
)
from app.schemas.retrospective_method.comment_schema import CommentCreate, CommentSchema
from app.services.retrospective_method.comment_service import CommentService

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
if TYPE_CHECKING:
    from mypy_boto3_stepfunctions import SFNClient

    from app.repository.retrospective_method.comment_repository import CommentRepository

router = APIRouter(tags=["comment"], prefix="/api/v1/retrospective_method")

STATE_MACHINE_ARN = os.environ["STATE_MACHINE_ARN"]


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
    sfn_client: "SFNClient" = Depends(lambda: boto3.client("stepfunctions")),
):
    """コメント登録のエンドポイント。"""

    # ここでエラー発生時に、RequestValidationErrorを発生させれば良かっただけかもしれない...
    comment = CommentSchema(
        retrospective_method_id=retrospective_method_id,
        user_id=current_user.id,
        comment=comment_params.comment,
    )
    comment_service = CommentService(sfn_client, STATE_MACHINE_ARN)
    comment_service.add_comment_from_api(comment)

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

    comments = comment_repo.find(
        conditions={"retrospective_method_id": retrospective_method_id}
    )

    result_comments: list[dict] = []
    for comment in comments:
        comment_dict = comment.to_dict()
        result_comments.append(comment_dict)

    return JSONResponse(
        content=GetCommentApiResponseBody(comments=result_comments).model_dump()
    )
