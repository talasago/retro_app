from factory import Factory

from app.models.retrospective_method.comment_model import CommentModel


class CommentFactory(Factory):
    retrospective_method_id = 1
    comment = "This is a valid comment."
    user_id = 1

    class Meta:
        model = CommentModel

    # 型ヒントのために記載
    def __new__(cls, *args, **kwargs) -> CommentModel:
        return super().__new__(*args, **kwargs)
