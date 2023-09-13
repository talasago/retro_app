from pydantic import BaseModel
from datetime import datetime


class TokenPayload(BaseModel):
    """Tokenの中身のモデルクラス(pydantic)"""

    token_type: str
    exp: int | datetime  # decodeするときに必ずintになる
    uid: str
    jti: str

    class Config:
        from_attributes = True
        frozen = True
