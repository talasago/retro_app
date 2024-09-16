from typing import Callable

import pytest
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.models.retrospective_method.comment_model import CommentModel
from app.repository.retrospective_method.comment_repository import CommentRepository
from tests.conftest import create_test_user
from tests.factories.retrospective_method.comment_factory import CommentFactory


@pytest.fixture(scope="session")
def create_comment(db: Session):
    def _method(comment_model: CommentModel) -> CommentModel:
        comment_repo = CommentRepository(db)
        comment_repo.save(comment_model)
        return comment_model

    return _method


@pytest.mark.usefixtures("db")
class TestCommentRepository:
    class TestSave:
        # 現状Saveで更新するユースケースはないので、UPDATEのテストは省略
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
        @pytest.fixture(scope="class")
        def sut(self, db: Session) -> Callable:
            return CommentRepository(db).find

        @pytest.fixture(scope="class", autouse=True)
        def setup_create_comments(self, create_comment):
            create_comment(
                CommentFactory(
                    retrospective_method_id=10, comment="retrospective_method_id=10"
                )
            )
            create_comment(CommentFactory(retrospective_method_id=2))
            create_comment(CommentFactory(retrospective_method_id=3))
            create_comment(CommentFactory(retrospective_method_id=3))

        class TestWhenThereIsRetrospectiveMethodId:
            class TestWhenThereAreMatchingComments:
                def test_return_comments_by_retrospective_method_id(self, sut):
                    """retrospective_method_id に基づいてコメントを返すこと"""
                    conditions = {"retrospective_method_id": 3}
                    results = sut(conditions=conditions)

                    for result in results:
                        assert result.retrospective_method_id == 3

            class TestWhenThereIsNoMatchingComments:
                def test_return_empty_list(self, sut):
                    """条件に一致するコメントがない場合、空リストを返すこと"""
                    conditions = {"retrospective_method_id": 99999}
                    results = sut(conditions=conditions)

                    assert results == []

        class TestWhenNotConditions:
            @pytest.mark.parametrize("conditions", [None, {}])
            def test_return_all_comments_none_and_empty_dict(
                self, sut, conditions, db: Session
            ):
                """conditionsにNoneや{}が指定されていない場合、全てのコメントを返すこと"""

                results = sut(conditions=conditions)
                actual_comments = db.query(CommentModel).all()
                result_ids = {comment.id for comment in results}
                actual_comments_ids = {comment.id for comment in actual_comments}

                assert result_ids == actual_comments_ids

            def test_return_all_comments(self, sut, db: Session):
                """conditionsが指定されていない場合、全てのコメントを返すこと"""

                results = sut()
                actual_comments = db.query(CommentModel).all()
                result_ids = {comment.id for comment in results}
                actual_comments_ids = {comment.id for comment in actual_comments}

                assert result_ids == actual_comments_ids
