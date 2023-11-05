from factory import Factory, Sequence

from app.models.user_model import UserModel


class TestUserFactory(Factory):
    name = Sequence(lambda n: f"common user{n}")
    email = Sequence(lambda n: f"commmon_user{n}@email.com")
    password: str = "common user"

    class Meta:
        model = UserModel

    # 型ヒントのために記載
    def __new__(cls, *args, **kwargs) -> UserModel:
        return super().__new__(*args, **kwargs)
