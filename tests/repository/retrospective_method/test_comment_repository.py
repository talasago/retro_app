import pytest
from passlib.context import CryptContext
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.models.retrospective_method.comment_model import CommentModel
from app.repository.retrospective_method.comment_repository import CommentRepository
from tests.conftest import create_test_user
from tests.factories.retrospective_method.comment_factory import CommentFactory

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@pytest.fixture
def create_comment(db: Session):
    def _method(comment_model: CommentModel) -> CommentModel:
        comment_repo = CommentRepository(db)
        comment_repo.save(comment_model)
        return comment_model

    return _method


@pytest.mark.usefixtures("db")
class TestCommentRepository:
    class TestSave:

        def test_create_comment(self, db: Session, create_comment, user_repo):
            user_id = create_test_user(user_repo).id
            comment: CommentModel = create_comment(CommentFactory(user_id=user_id))

            created_comment: CommentModel = db.query(CommentModel).filter_by(id=comment.id).one()  # type: ignore
            assert created_comment.retrospective_method_id == 1
            assert created_comment.user_id == user_id
            assert created_comment.comment == "This is a valid comment."

        class TestWhenCommitError:
            def test_expect_rollback(self, db: Session, mocker):
                """commit時にエラーが発生した場合、rollbackされることを確認する"""

                # commit時に強制的にエラーを発生させる
                mocker.patch.object(
                    db,
                    "commit",
                    side_effect=OperationalError(
                        "Simulated OperationalError", None, None  # type: ignore
                    ),
                )
                mocker.patch.object(
                    db, "rollback"
                )  # rollbackメソッドを呼び出されたか確認したいためモック

                comment = CommentFactory()
                comment_repo = CommentRepository(db)

                with pytest.raises(OperationalError):
                    comment_repo.save(comment)

                assert db.rollback.call_count == 1  # type: ignore
