import pytest
from passlib.context import CryptContext
from sqlalchemy.exc import OperationalError
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
    class TestSave:
        def test_create_comment(self, db: Session, create_comment):
            comment: CommentModel = create_comment(
                db=db, retrospective_method_id=1, user_id=1, comment="Test Comment"
            )

            created_comment: CommentModel = db.query(CommentModel).filter_by(id=comment.id).one()  # type: ignore
            assert created_comment.retrospective_method_id == 1
            assert created_comment.user_id == 1
            assert created_comment.comment == "Test Comment"

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

                comment_data = {
                    "retrospective_method_id": 1,
                    "user_id": 1,
                    "comment": "Test Comment",
                }
                comment = CommentModel(**comment_data)
                comment_repo = CommentRepository(db)

                with pytest.raises(OperationalError):
                    comment_repo.save(comment)

                assert db.rollback.call_count == 1  # type: ignore
