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


class ApiCommonUserFactory(Factory):
    class Meta:
        model = dict

    name = "api common user"
    email = "api_common_user@example.com"
    username = name
    password = "Password&1"
