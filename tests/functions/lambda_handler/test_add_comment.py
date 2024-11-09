import pytest
from sqlalchemy import select

from app.models.retrospective_method.comment_model import CommentModel


@pytest.fixture(scope="session")
def sut(add_comment_from_lambda_function):
    def _method(comment_data: dict, retrospective_method_id: int):
        return add_comment_from_lambda_function(
            comment_data=comment_data, retrospective_method_id=retrospective_method_id
        )

    return _method


def test_lambda_handler(sut, db):
    sut(comment_data={"comment": "test"}, retrospective_method_id=6)

    stmt = select(CommentModel).where(CommentModel.retrospective_method_id == 6)
    comment: CommentModel = db.execute(stmt).scalars().first()  # type: ignore
    print(comment)
