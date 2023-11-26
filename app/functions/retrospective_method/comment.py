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
from app.models.user_model import UserModel
from app.schemas.http_response_body_user_schema import (
    ApiResponseBodyBase,
)

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
    current_user: "UserModel" = Depends(get_current_user),
    auth_service: "AuthService" = Depends(get_auth_service),
):
    """コメント登録のエンドポイント。"""
    # リクエストボディのコメントを受け取る
    # retrospective_method_idとcurrent_user.idとコメントを基に、Commentモデルのインスタンスを生成する
    # CommentRepository(commentモデルのインスタンス)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content=ApiResponseBodyBase(message="コメント登録が完了しました。").model_dump(),
    )


handler = Mangum(app)
