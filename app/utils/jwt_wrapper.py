import jwt
import jwt.exceptions as jwt_exceptions


class JwtWrapper:
    # JWT関連の設定
    # FIXME:シークレットキーは機密情報なので、本番実行時には環境変数など別の場所に記載する。
    # アルゴリズムも環境変数化しておこう
    SECRET_KEY = "secret_key"
    ALGORITHM = "HS256"

    @classmethod
    def decode(cls, token: str) -> dict:
        try:
            decoded_token: dict = jwt.decode(
                jwt=token, key=cls.SECRET_KEY, algorithms=cls.ALGORITHM
            )
        except jwt_exceptions.ExpiredSignatureError as e:
            raise cls.ExpiredSignatureError(e)
        except jwt_exceptions.PyJWTError as e:
            raise cls.JwtError(e)

        return decoded_token

    @classmethod
    def encode(cls, payload: dict) -> str:
        return jwt.encode(payload=payload, key=cls.SECRET_KEY, algorithm=cls.ALGORITHM)

    class ExpiredSignatureError(Exception):
        pass

    class JwtError(Exception):
        pass
