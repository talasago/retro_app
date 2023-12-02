import pytest
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.models.retrospective_method.comment_model import CommentModel
from app.repository.retrospective_method.comment_repository import CommentRepository

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@pytest.fixture
def create_comment():
    def _method(db: Session, **comment_params) -> CommentModel:
        comment_repo = CommentRepository(db)
        comment = CommentModel(**comment_params)
        comment_repo.save(comment)
        return comment

    return _method


@pytest.mark.usefixtures("db")
class TestCommentRepository:
    def test_create_comment(self, db: Session, create_comment):
        comment: CommentModel = create_comment(
            db=db, retrospective_method_id=1, user_id=1, comment="Test Comment"
        )

        created_comment: CommentModel = db.query(CommentModel).filter_by(id=comment.id).one()  # type: ignore
        assert created_comment.retrospective_method_id == 1
        assert created_comment.user_id == 1
        assert created_comment.comment == "Test Comment"
