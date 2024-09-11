from __future__ import annotations

from pydantic import Field

from app.schemas.base_model import BaseModel


class CommentSchema(BaseModel):
    """pydanticのモデルクラス"""

    # ...は必須という意味
    comment: str = Field(
        ..., max_length=100, description="コメントの内容", examples=["テストコメント"]
    )
    retrospective_method_id: int = Field(
        ...,
        ge=1,
        le=72,
        description="レトロスペクティブメソッドのID",
        examples=[1],
    )
    user_id: int = Field(..., description="ユーザーのID", examples=[1])


class CommentCreate(BaseModel):
    comment: str = Field(CommentSchema.model_fields["comment"])
