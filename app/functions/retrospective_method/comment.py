"""WebAPIのエントリポイント。プレゼンテーション層。"""

from typing import TYPE_CHECKING

from fastapi import Depends, FastAPI, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from mangum import Mangum
from pydantic_core import ValidationError

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
from app.schemas.translations.i18n_translate_wrapper import I18nTranslateWrapper

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
if TYPE_CHECKING:
    from typing import Sequence

    from fastapi import Request
    from pydantic_core import ErrorDetails

    from app.repository.retrospective_method.comment_repository import CommentRepository


app = FastAPI()
add_cors_middleware(app)


# TODO: 共通化
@app.exception_handler(ValidationError)
async def validation_exception_handler(
    _: "Request", exc: ValidationError
) -> JSONResponse:
    errors: list[ErrorDetails] = exc.errors()

    for error in errors:
        if "ctx" in error and isinstance(
            error.get("ctx", {}).get("error", ""), ValueError
        ):
            # pydenticのカスタムバリデーションを使ったとき、
            # ctx.errorに"ValueError(hogehoge)"となるとJSONに変換できないため、strに変換する
            error["ctx"]["error"] = str(error["ctx"]["error"])

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": I18nTranslateWrapper.trans(errors)},  # type: ignore
        #  type(exc.errors()) => listとなっていることを確認している
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler2(
    request: "Request", exc: RequestValidationError
) -> JSONResponse:
    errors: Sequence[dict] = exc.errors()

    for error in errors:
        if "ctx" in error and isinstance(
            error.get("ctx", "").get("error", ""), ValueError
        ):
            # pydenticのカスタムバリデーションを使ったとき、
            # ctx.errorに"ValueError(hogehoge)"となるとJSONに変換できないため、strに変換する
            error["ctx"]["error"] = str(error["ctx"]["error"])
        if "loc" in error and (error.get("loc", "") == ("body", "password")):
            # ユーザーが入力したpasswordをマスク化する
            error["input"] = "[MASKED]"

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": I18nTranslateWrapper.trans(errors)},  # type: ignore
        #  type(exc.errors()) => listとなっていることを確認している
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
