import os

import jwt
import jwt.exceptions as jwt_exceptions


class JwtWrapper:
    # JWT関連の設定
    SECRET_KEY = os.environ["SECRET_KEY"]
    ALGORITHM = os.environ["ALGORITHM"]

    @classmethod
    def decode(cls, token: str) -> dict:
        try:
            decoded_token: dict = jwt.decode(
                jwt=token, key=cls.SECRET_KEY, algorithms=[cls.ALGORITHM]
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
