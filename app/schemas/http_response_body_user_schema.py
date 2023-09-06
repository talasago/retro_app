from pydantic import BaseModel, Field


class SignInApiResponseBody(BaseModel):
    message: str = Field(default='ユーザー登録が成功しました。',
                         description='処理メッセージ',
                         examples=['ユーザー登録が成功しました。'])
