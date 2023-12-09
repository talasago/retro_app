from app.models.retrospective_method.comment_model import CommentModel
from app.models.user_model import UserModel


class TestCommentModel:
    class TestRelationForeignKey:
        def test_whether_user_id_exist(self, db):
            user_data: dict = {
                "name": "John Doe-comment",
                "email": "invalid_email-comment",
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
            db.commit()
            # breakpoint()
            # TODO assertを後ほど追加


# コメント登録時、usersに存在するidのみを登録できる(usersに存在しないuser_idの場合登録できない)
# usersのデータを削除時、紐づいているcommentを削除
