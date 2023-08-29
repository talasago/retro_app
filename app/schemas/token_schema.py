from enum import Enum
from pydantic import BaseModel
from datetime import datetime
from typing import Any


class TokenType(Enum):
    """TokenTypeのEnum。pydanticのクラスではない。"""
    access_token = 'access_token'
    refresh_token = 'refresh_token'


class TokenPayload(BaseModel):
    """Tokenの中身のモデルクラス(pydantic)"""

    token_type: TokenType | str  # decodeするときに必ずstrになる
    exp: int | datetime  # decodeするときに必ずintになる
    uid: str
    jti: str

    def model_dump(self) -> dict[str, Any]:
        """Override: jwt.encode()時に、Enumだとエラーになるためstrに変更"""
        dump: dict[str, Any] = super().model_dump()
        if isinstance(dump['token_type'], TokenType):
            dump['token_type'] = dump['token_type'].value

        return dump

    class Config:
        from_attributes = True
