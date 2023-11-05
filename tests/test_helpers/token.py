from datetime import datetime, timedelta
from uuid import uuid4

from jose import jwt

from app.schemas.token_schema import TokenPayload, TokenType


def generate_test_token(
    token_type: TokenType,
    user_uuid=uuid4(),
    exp=datetime.utcnow() + timedelta(minutes=100),
) -> str:
    token_payload = TokenPayload(
        token_type=token_type, exp=exp, uid=str(user_uuid), jti=str(uuid4())
    )
    token: str = jwt.encode(
        claims=token_payload.model_dump(), key="secret_key", algorithm="HS256"
    )

    return token
