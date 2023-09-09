from factory import Factory, Sequence
from ..models.test_user_model import UserModel


class UserFactory(Factory):
    class Meta:
        model = UserModel


# TODO:クラス名は違うかもなあ
class CommonUserFactory(UserFactory):
    name: str = Sequence(lambda n: f'common user{n}')
    email: str = Sequence(lambda n: f'commmon_user{n}@email.com')
    password: str = 'common user'
