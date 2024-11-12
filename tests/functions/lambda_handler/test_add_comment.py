import pytest
from sqlalchemy import select

from app.functions.lambda_handler.add_comment import lambda_handler
from app.models.retrospective_method.comment_model import CommentModel
from tests.test_helpers.create_test_user import create_test_user


@pytest.fixture(scope="session")
def sut(db):
    def _method(event: dict, context: dict):
        return lambda_handler(event, context, db=db)

    return _method


def test_lambda_handler(sut, db, user_repo):
    user = create_test_user(user_repo, name="test_lambda_handler")
    event = {
        "comment": "test comment test_lambda_handler",
        "retrospective_method_id": 56,
        "user_id": user.id,
    }
    sut(event, {})

    stmt = select(CommentModel).where(CommentModel.retrospective_method_id == 5)
    comment: CommentModel = db.execute(stmt).scalars().first()  # type: ignore
    print(comment)
