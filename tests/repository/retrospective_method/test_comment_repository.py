from typing import Callable

import pytest
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session
from sqlalchemy.sql import func, select

from app.errors.retro_app_error import RetroAppRecordNotFoundError
from app.models.retrospective_method.comment_model import CommentModel
from app.models.user_model import UserModel
from app.repository.retrospective_method.comment_repository import CommentRepository
from tests.conftest import create_test_user
from tests.factories.retrospective_method.comment_factory import CommentFactory


@pytest.fixture(scope="session")
def create_comment(comment_repo: CommentRepository):
    def _method(comment_model: CommentModel) -> CommentModel:
        comment_repo.save(comment_model)
        return comment_model

    return _method


@pytest.fixture(scope="session")
def setup_test_user(user_repo) -> UserModel:
    return create_test_user(user_repo)


@pytest.fixture(scope="session", autouse=True)
def setup_create_comments(create_comment, setup_test_user):
    create_comment(
        CommentFactory(
            retrospective_method_id=10,
            comment="retrospective_method_id=10",
            user_id=setup_test_user.id,
        )
    )
    create_comment(CommentFactory(retrospective_method_id=2))
    create_comment(CommentFactory(retrospective_method_id=3))
    create_comment(CommentFactory(retrospective_method_id=3))


@pytest.fixture(scope="session")
def comment_repo(db: Session) -> CommentRepository:
    return CommentRepository(db)


@pytest.mark.usefixtures("db")
class TestCommentRepository:
    class TestSave:
        # 現状Saveで更新するユースケースはないので、UPDATEのテストは省略
        def test_create_comment(self, db: Session, create_comment, setup_test_user):
            comment: CommentModel = create_comment(
                CommentFactory(user_id=setup_test_user.id)
            )

            created_comment: CommentModel = db.query(CommentModel).filter_by(id=comment.id).one()  # type: ignore
            assert created_comment.retrospective_method_id == 1
            assert created_comment.user_id == setup_test_user.id
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

    class TestFindAll:
        @pytest.fixture(scope="class")
        def sut(self, comment_repo: CommentRepository) -> Callable:
            return comment_repo.find_all

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
            def test_return_all_comments_empty_dict(self, sut, db: Session):
                """conditionsが{}の場合、全てのコメントを返すこと"""

                results = sut(conditions={})
                actual_comments = db.query(CommentModel).all()
                result_ids = {comment.id for comment in results}
                actual_comments_ids = {comment.id for comment in actual_comments}

                assert result_ids == actual_comments_ids

            def test_return_all_comments_empty_paramater(self, sut, db: Session):
                """conditionsが指定されていない場合、全てのコメントを返すこと"""

                results = sut()
                actual_comments = db.query(CommentModel).all()
                result_ids = {comment.id for comment in results}
                actual_comments_ids = {comment.id for comment in actual_comments}

                assert result_ids == actual_comments_ids

            class TestWhenInvalidConditions:
                @pytest.mark.parametrize(
                    "conditions", [1, "invalid_conditions", None, []]
                )
                def test_raise_type_error(self, sut, conditions):
                    """conditionsがdict以外の場合、TypeErrorをraiseすること"""

                    with pytest.raises(TypeError):
                        sut(conditions=conditions)

        class TestWhenOrderCols:
            def test_return_comments_ordered_by_created_at(self, sut, db: Session):
                """引数で与えられた昇順に並び替えられたコメントを返すこと"""
                conditions = {"retrospective_method_id": 3}
                order_by = (CommentModel.created_at.asc(), CommentModel.id.asc())
                results = sut(conditions=conditions, order_by_cols=order_by)

                actual_comments = (
                    db.query(CommentModel)
                    .filter_by(retrospective_method_id=3)
                    .order_by(CommentModel.created_at.asc(), CommentModel.id.asc())
                    .all()
                )

                for result, actual_comment in zip(results, actual_comments):
                    assert result.id == actual_comment.id

        class TestWhenNothingOrderCols:
            def test_return_comments_ordered_by_created_at(self, sut, db: Session):
                """エラーなくコメントを返すこと"""
                conditions = {"retrospective_method_id": 3}
                results = sut(conditions=conditions)

                actual_comments = (
                    db.query(CommentModel).filter_by(retrospective_method_id=3).all()
                )

                for result, actual_comment in zip(results, actual_comments):
                    assert result.id == actual_comment.id

    class TestFindOne:
        @pytest.fixture(scope="class")
        def sut(self, comment_repo: CommentRepository) -> Callable:
            return comment_repo.find_one

        class TestWhenInvalidConditions:
            @pytest.mark.parametrize("conditions", [1, "invalid_conditions", None, []])
            def test_raise_type_error(self, sut, conditions):
                with pytest.raises(TypeError):
                    sut(conditions=conditions)

        class TestWhenEmptyConditions:
            @pytest.mark.parametrize(
                "invoke", [lambda sut: sut(), lambda sut: sut(conditions={})]
            )
            def test_raise_value_error(self, sut, invoke):
                with pytest.raises(ValueError):
                    invoke(sut)

        class TestWhenThereAreMatchingComments:
            def test_return_comment_by_conditions(
                self, sut, comment_repo: CommentRepository
            ):
                comments = comment_repo.find_all()

                conditions = {
                    "id": comments[0].id,
                    "retrospective_method_id": comments[0].retrospective_method_id,
                    "user_id": comments[0].user_id,
                }
                result: CommentModel = sut(conditions=conditions)

                assert result.id == conditions["id"]
                assert (
                    result.retrospective_method_id
                    == conditions["retrospective_method_id"]
                )
                assert result.user_id == conditions["user_id"]

        class TestWhenThereIsNotMatchingComments:
            def test_raise_error(self, sut):
                conditions = {"retrospective_method_id": 99999}
                with pytest.raises(RetroAppRecordNotFoundError) as e:
                    sut(conditions=conditions)

                assert str(e.value) == "指定されたコメントは存在しません。"

    class TestDelete:
        @pytest.fixture(scope="class")
        def sut(self, comment_repo: CommentRepository) -> Callable:
            return comment_repo.delete

        @pytest.fixture(scope="class")
        def setup_test_comment_for_delete(self, create_comment):
            def _method() -> CommentModel:
                return create_comment(
                    CommentFactory(
                        retrospective_method_id=55, user_id=1, comment="delete comment"
                    )
                )

            return _method

        def test_delete_comment(self, sut, db: Session, setup_test_comment_for_delete):
            comment: CommentModel = setup_test_comment_for_delete()
            stmt = (
                select(func.count())
                .select_from(CommentModel)
                .filter(CommentModel.comment == comment.comment)
            )
            assert db.execute(stmt).scalar() == 1

            sut(comment)

            assert db.execute(stmt).scalar() == 0

        class TestWhenCommitError:
            def test_expect_rollback(
                self, db: Session, mocker, sut, setup_test_comment_for_delete
            ):
                """commit時にエラーが発生した場合、rollbackされることを確認する"""
                comment: CommentModel = setup_test_comment_for_delete()
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
                    sut(comment=comment)

                assert db.rollback.call_count == 1  # type: ignore
