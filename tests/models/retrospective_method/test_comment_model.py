import pytest
from psycopg2 import errors as psycopg2_errors
from sqlalchemy.exc import IntegrityError

from app.models.retrospective_method.comment_model import CommentModel
from app.models.user_model import UserModel


class TestCommentModel:
    class TestRelationForeignKey:
        def test_whether_user_id_exist(self, db):
            user_data: dict = {
                "name": "John Doe-comment",
                "password": "Passw0rd#123",
            }
            user = UserModel(**user_data)
            db.add(user)
            db.commit()

            comment: CommentModel = CommentModel(
                retrospective_method_id=1, user_id=user.id, comment="test"
            )
            db.add(comment)
            db.commit()

            assert comment.user_id == comment.user.id

        def test_user_id_is_not_exist(self, db):
            comment: CommentModel = CommentModel(
                retrospective_method_id=1, user_id=9999, comment="test"
            )
            db.add(comment)

            with pytest.raises(IntegrityError) as e:
                db.commit()

            db.rollback()
            assert isinstance(e.value.orig, psycopg2_errors.ForeignKeyViolation)

        def test_delete_comment_when_delete_user(self, db):
            # TODO:user_dataのfixtureとか使ってもいいかも
            # あとbeforeみたいなので共通化したい
            user_data: dict = {
                "name": "John Doe-comment2",
                "password": "Passw0rd#123",
            }
            user = UserModel(**user_data)
            db.add(user)
            db.commit()

            comment: CommentModel = CommentModel(
                retrospective_method_id=1, user_id=user.id, comment="test"
            )
            db.add(comment)
            db.commit()
            db.delete(user)
            db.commit()

            assert db.query(CommentModel).filter_by(user_id=user.id).count() == 0
