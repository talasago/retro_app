from pydantic import Field

from .base_model import BaseModel


class ApiResponseBodyBase(BaseModel):
    message: str = Field(
        default="ユーザー登録が成功しました。",
        description="処理メッセージ",
        examples=["ユーザー登録が成功しました。"],
    )


class SignInApiResponseBody(BaseModel):
    message: str = Field(
        default="ユーザー登録が成功しました。",
        description="処理メッセージ",
        examples=["ユーザー登録が成功しました。"],
    )


class TokenApiResponseBody(BaseModel):
    message: str = Field(
        default="ログインしました",
        description="処理メッセージ",
        examples=["ログインしました"],
    )
    name: str = Field(description="ユーザー名", examples=["test_user"])
    token_type: str = Field(description="トークンタイプ", examples=["bearer"])
    access_token: str = Field(description="アクセストークン")
    refresh_token: str = Field(description="リフレッシュトークン")


class RefreshTokenApiResponseBody(BaseModel):
    message: str = Field(
        default="トークンを再発行しました。",
        description="処理メッセージ",
        examples=["トークンを再発行しました。"],
    )
    token_type: str = Field(description="トークンタイプ", examples=["test_user"])
    access_token: str = Field(description="アクセストークン")
    refresh_token: str = Field(description="リフレッシュトークン")


class AddCommentApiResponseBody(BaseModel):
    message: str = Field(
        default="コメントを登録しました。",
        description="処理メッセージ",
        examples=["コメントを登録しました。"],
    )
