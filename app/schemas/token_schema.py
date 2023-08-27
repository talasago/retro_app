from enum import Enum
from pydantic import BaseModel
from datetime import datetime


class TokenType(Enum):
    access_token = 'access_token'
    refresh_token = 'refresh_token'


class TokenPayload(BaseModel):
    """Tokenの中身のモデルクラス(pydantic)"""

    token_type: str  # TODO:クラスを指定する
    exp: int | datetime  # decodeするときに必ずintになる
    uid: str
    jti: str

    class Config:
        from_attributes = True
