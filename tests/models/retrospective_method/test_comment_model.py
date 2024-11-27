import pytest
from psycopg2 import errors as psycopg2_errors
from sqlalchemy.exc import IntegrityError

from app.models.retrospective_method.comment_model import CommentModel
from tests.factories.retrospective_method.comment_factory import CommentFactory
from tests.test_helpers.create_test_user import create_test_user


class TestCommentModel:
    class TestRelationForeignKey:

        def test_whether_user_id_exist(self, db, common_test_user_model):
            comment: CommentModel = CommentFactory(user_id=common_test_user_model.id)
            db.add(comment)
            db.commit()

            assert comment.user_id == comment.user.id

        def test_user_id_is_not_exist(self, db):
            comment: CommentModel = CommentFactory(user_id=9999)
            db.add(comment)

            with pytest.raises(IntegrityError) as e:
                db.commit()

            db.rollback()
            assert isinstance(e.value.orig, psycopg2_errors.ForeignKeyViolation)

        def test_delete_comment_when_delete_user(self, db, user_repo):
            test_user = create_test_user(user_repo)
            comment: CommentModel = CommentFactory(user_id=test_user.id)
            db.add(comment)
            db.commit()
            db.delete(test_user)
            db.commit()

            assert db.query(CommentModel).filter_by(user_id=test_user.id).count() == 0
