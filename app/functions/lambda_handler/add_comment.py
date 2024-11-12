from typing import TYPE_CHECKING

from app.errors.retro_app_error import (
    RetroAppAuthenticationError,
    RetroAppRecordNotFoundError,
    RetroAppTokenExpiredError,
)
from app.functions.dependencies import get_db
from app.models.retrospective_method.comment_model import CommentModel
from app.repository.retrospective_method.comment_repository import CommentRepository
from app.repository.user_repository import UserRepository
from app.schemas.retrospective_method.comment_schema import CommentSchema
from app.services.auth_service import AuthService

if TYPE_CHECKING:
    from app.models.user_model import UserModel


def lambda_handler(event, context, db=next(get_db())):
    print(f"Received data: {event}")
    print(f"Received data context: {context}")
    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    current_user = get_current_user(token=event['token'], auth_service=auth_service)
    comment = CommentSchema(**event['comment'])
    comment_repo = CommentRepository(db)

    comment_repo.save(CommentModel(**comment.model_dump()))


# send_task_failureでエラーメッセージとかを返す？？
# 返すときに、エラークラス名とエラーメッセージ名を返すか。
# そうすれば呼び出し元で認証エラーかどうか、どの認証エラーメッセージをかえすかを判定できて、HTTPレスポンスに含められる

def get_current_user(token: str, auth_service: AuthService) -> "UserModel":
    try:
        user = auth_service.get_current_user(token)
    except RetroAppAuthenticationError:
        # Tokenが間違っています。
        pass
    except RetroAppRecordNotFoundError:
        # ユーザーが存在しません。
        pass
    except RetroAppTokenExpiredError:
        # ログイン有効期間を過ぎています。再度ログインしてください。
        pass

    return user
