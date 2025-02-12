from typing import TYPE_CHECKING

from factories.user_factory import TestUserFactory

if TYPE_CHECKING:
    from app.models.user_model import UserModel
    from app.repository.user_repository import UserRepository


def create_test_user(
    user_repo: "UserRepository",
    password: str | None = None,
    name: str | None = None,
) -> "UserModel":
    test_user_param: dict = {}

    test_user_param.setdefault("password", password) if password else None
    test_user_param.setdefault("name", name) if name else None
    test_user: "UserModel" = TestUserFactory(**test_user_param)
    user_repo.save(test_user)

    return test_user
