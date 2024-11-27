from __future__ import annotations

from pydantic import Field, field_validator

from app.schemas.base_model import BaseModel


class CommentCreate(BaseModel):
    """commentAPIのりクエストモデル"""

    ## CommentSchemaのcommentと同じにしたいだけなのだが、いい方法がない。
    comment: str = Field(
        ..., max_length=100, description="コメントの内容", examples=["テストコメント"]
    )

    @field_validator("comment", mode="before")
    @classmethod
    def no_len_0_char(cls, v):
        if isinstance(v, str) and v.strip() == "":
            raise ValueError("必須項目です。")
        return v


class CommentSchema(CommentCreate):
    """pydanticのモデルクラス"""

    # ...は必須という意味
    retrospective_method_id: int = Field(
        ...,
        ge=1,
        le=72,
        description="レトロスペクティブメソッドのID",
        examples=[1],
    )
    user_id: int = Field(..., description="ユーザーのID", examples=[1])
