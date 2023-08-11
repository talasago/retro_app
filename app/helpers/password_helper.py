from passlib.context import CryptContext


class PasswordHelper:
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

    @staticmethod
    def generate_hashed_password(plain_pw: str) -> str:
        return PasswordHelper.pwd_context.hash(plain_pw)

    @staticmethod
    def is_password_matching(plain_pw: str, hashed_pw: str) -> bool:
        return PasswordHelper.pwd_context.verify(plain_pw, hashed_pw)
