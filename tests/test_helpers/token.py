from datetime import datetime, timedelta
from uuid import uuid4

from app.schemas.token_schema import TokenPayload, TokenType
from app.utils.jwt_wrapper import JwtWrapper


def generate_test_token(
    token_type: TokenType,
    user_uuid=uuid4(),
    exp=datetime.utcnow() + timedelta(minutes=100),
) -> str:
    token_payload = TokenPayload(
        token_type=token_type, exp=exp, uid=str(user_uuid), jti=str(uuid4())
    )
    token: str = JwtWrapper.encode(payload=token_payload.model_dump())

    return token
