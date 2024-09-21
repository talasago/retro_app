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


class LogoutApiResponseBody(BaseModel):
    message: str = Field(
        default="ログアウトしました",
        description="処理メッセージ",
        examples=["ログアウトしました"],
    )


class AddCommentApiResponseBody(BaseModel):
    message: str = Field(
        default="コメントを登録しました。",
        description="処理メッセージ",
        examples=["コメントを登録しました。"],
    )


class GetCommentApiResponseBody(BaseModel):
    comments: list = Field(
        description="コメントデータ",
        examples=[
            {
                "comment_id": 1,
                "retrospective_method_id": 1,
                "user_id": 1,
                "comment": "comment",
                "created_at": "2021-01-01T00:00:00",
                "updated_at": "2021-01-01T00:00:00",
            }
        ],
    )


class UnauthorizedResponseBody(BaseModel):
    message: str = Field(
        description="処理メッセージ",
    )
