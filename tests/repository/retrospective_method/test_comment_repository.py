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
            def test_expect_rollback(self, db: Session, mocker, create_comment):
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

                with pytest.raises(OperationalError):
                    create_comment(CommentFactory())

                assert db.rollback.call_count == 1  # type: ignore

    class TestFind:
        # テスト観点
        # - conditionsがNoneの場合、全てのコメントを取得する
        # - 検索条件、複数、単数
        # - 検索条件をdictで渡した場合と、個別で渡した場合の結果が同じであること
        # - 検索条件が見つからない場合，空リストを返す

        def test_find_comments_by_retrospective_method_id(
            self, db: Session, create_comment
        ):
            """retrospective_method_id に基づいてコメントを検索する。"""
            # Setup
            retrospective_method_id = 3
            comment1 = create_comment(
                CommentFactory(retrospective_method_id=retrospective_method_id)
            )
            comment2 = create_comment(
                CommentFactory(retrospective_method_id=retrospective_method_id)
            )
            create_comment(
                CommentFactory(retrospective_method_id=4)
            )  # This comment should not be found

            # Execute
            repo = CommentRepository(db)
            results = repo.find(
                conditions={"retrospective_method_id": retrospective_method_id}
            )

            # Verify
            assert len(results) == 2
            assert comment1 in results
            assert comment2 in results

        @pytest.mark.skip()
        def test_find_comments_by_user_id(self, db: Session, create_comment):
            """user_id に基づいてコメントを検索する。"""
            # Setup
            user_id = 1
            comment1 = create_comment(CommentFactory(user_id=user_id))
            comment2 = create_comment(CommentFactory(user_id=user_id))
            create_comment(
                CommentFactory(user_id=2)
            )  # This comment should not be found

            # Execute
            repo = CommentRepository(db)
            results = repo.find(user_id=user_id)

            # Verify
            assert len(results) == 2
            assert comment1 in results
            assert comment2 in results

        @pytest.mark.skip()
        def test_find_comments_by_keyword(self, db: Session, create_comment):
            """keyword に基づいてコメントを検索する。"""
            # Setup
            keyword = "test"
            comment1 = create_comment(CommentFactory(comment="This is a test comment."))
            comment2 = create_comment(CommentFactory(comment="Another test comment."))
            create_comment(
                CommentFactory(comment="This should not be found.")
            )  # This comment should not be found

            # Execute
            repo = CommentRepository(db)
            results = repo.find(keyword=keyword)

            # Verify
            assert len(results) == 2
            assert comment1 in results
            assert comment2 in results

        @pytest.mark.skip()
        def test_find_comments_by_multiple_conditions(
            self, db: Session, create_comment
        ):
            """複数の条件（retrospective_method_id、user_id、keyword）に基づいてコメントを検索する。"""
            # Setup
            retrospective_method_id = 1
            user_id = 1
            keyword = "test"
            comment1 = create_comment(
                CommentFactory(
                    retrospective_method_id=retrospective_method_id,
                    user_id=user_id,
                    comment="This is a test comment.",
                )
            )
            create_comment(
                CommentFactory(
                    retrospective_method_id=retrospective_method_id,
                    user_id=user_id,
                    comment="This should not be found.",
                )
            )  # This comment should not be found
            create_comment(
                CommentFactory(
                    retrospective_method_id=2,
                    user_id=user_id,
                    comment="This should not be found.",
                )
            )  # This comment should not be found
            create_comment(
                CommentFactory(
                    retrospective_method_id=retrospective_method_id,
                    user_id=2,
                    comment="This should not be found.",
                )
            )  # This comment should not be found

            # Execute
            repo = CommentRepository(db)
            results = repo.find(
                retrospective_method_id=retrospective_method_id,
                user_id=user_id,
                keyword=keyword,
            )

            # Verify
            assert len(results) == 1
            assert comment1 in results
