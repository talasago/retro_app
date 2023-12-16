from __future__ import annotations

from app.schemas.base_model import BaseModel


class CommentSchema(BaseModel):
    """pydanticのモデルクラス"""

    # comment: str
    pass
    # retrospective_method_id: int
    # user_id: int


class CommentCreate(CommentSchema):
    comment: str
