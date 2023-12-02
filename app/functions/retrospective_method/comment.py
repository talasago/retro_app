"""WebAPIのエントリポイント。プレゼンテーション層。"""
from typing import TYPE_CHECKING

from fastapi import Depends, FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum

from app.functions.dependencies import (
    get_auth_service,
    get_current_user,
)
from app.models.retrospective_method.comment_model import CommentModel
from app.models.user_model import UserModel
from app.schemas.http_response_body_user_schema import (
    ApiResponseBodyBase,
)
from app.schemas.retrospective_method.comment_schema import CommentCreate

# from app.schemas.user_schema import UserCreate

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
if TYPE_CHECKING:
    from app.services.auth_service import AuthService

app = FastAPI()
# TODO:originとMethodを可変にしたい。そして外だししたい。
# TODO:その他の設定は適切に設定したい。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 許可するフロントエンドのオリジン
    allow_credentials=True,  # 資格情報の共有の可否
    allow_methods=["*"],  # 許可するHTTPリクエストメソッド
    allow_headers=["*"],  # フロントエンドからの認可するHTTPヘッダー情報
    expose_headers=["*"],  # フロントエンドがアクセスできるHTTPヘッダー情報
)


# TODO : 後でやる openAPI response_model=ApiResponseBodyBase
@app.post(
    "/api/v1/retrospective_method/{retrospective_method_id}/comment",
    summary="レビューコメント登録します。",
)
def add_comment(
    retrospective_method_id: int,
    comment_params: CommentCreate,
    current_user: "UserModel" = Depends(get_current_user),
    auth_service: "AuthService" = Depends(get_auth_service),
):
    """コメント登録のエンドポイント。"""

    # retrospective_method_idとcurrent_user.idとコメントを基に、CommentModelのインスタンスを生成する
    # CommentRepository(commentモデルのインスタンス)
    # breakpoint()
    comment: CommentModel = CommentModel(
        retrospective_method_id=retrospective_method_id,
        user_id=current_user.id,
        comment=comment_params.comment,
    )
    # TODO:重複エラーの時、4xx系を返すようにする
    # comment_repo.save(comment=comment)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content=ApiResponseBodyBase(message="コメント登録が完了しました。").model_dump(),
    )


handler = Mangum(app)
