from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel


class TokenType(Enum):
    """TokenTypeのEnum。pydanticのクラスではない。"""

    ACCESS_TOKEN = "access_token"
    REFRESH_TOKEN = "refresh_token"


class TokenPayload(BaseModel):
    """Tokenの中身のモデルクラス(pydantic)"""

    token_type: TokenType | str  # decodeするときに必ずstrになる
    exp: int | datetime  # decodeするときに必ずintになる
    uid: str
    jti: str

    def model_dump(self) -> dict[str, Any]:
        """Override: jwt.encode()時に、Enumだとエラーになるためstrに変更"""
        dump: dict[str, Any] = super().model_dump()
        if isinstance(dump["token_type"], TokenType):
            dump["token_type"] = dump["token_type"].value

        return dump

    class Config:
        from_attributes = True
        frozen = True
