from __future__ import annotations
from pydantic import BaseModel, EmailStr, field_validator
from ..repository.user_repository import UserRepository
from ..database import SessionLocal


class UserSchema(BaseModel):
    """pydanticのモデルクラス"""

    # NOTE:emailのバリデーションはコチラ
    # https://github.com/JoshData/python-email-validator/blob/5abaa7b4ce6677e5a2217db2e52202a760de3c24/email_validator/validate_email.py#
    # 最大文字列長とかもやってくれてそう。
    # TODO:ただ、メッセージの日本語化はこちら側で実装しないといけないかも
    email: EmailStr
    name: str

    # ---TODO:以下バリデーションで実施したいことの雑なメモ----
    # 登録時のバリデーションたち
    # passwordの最低文字数とか大文字小文字含むとか
    # nullは許可しない
    # nameは50文字。でも50文字とどうやってカウントする？サロゲートペアとか。
    # nameは半角スペース or 全角スペースだけは不許可にする

    # passwordの最大文字数
    # uuidは存在していても、もう一度採番する
    # nameはどんな文字でも基本許可する。でも制御文字は許可したくない。
    # バックスラッシュと円記号は片方だけの許可でいい気がする

    # emailがすでに存在していたら、「入力されたメールアドレスは既に使用されています。別のメールアドレスを入力してください。」
    # nameがすでに存在したら、「入力された名前は既に使用されています。別の名前を入力してください。」
    # これらは別の順番のバリデーションで良い？それとも同時が良い？同時だと実装コストかかりそう。でもDBアクセスは1回で終わりそう。DBへの検索結果を変数とかに入れとく？
    # https://docs.pydantic.dev/latest/usage/validators/ この辺の内容をやると思う

    # REVIEW: ユーザー登録APIから、正しくバリデーションされるかどうかの確認はやった方が良い。動くか自信ない。
    @field_validator('email')  # type: ignore
    @classmethod
    def check_email_uniqueness(cls, email: str):
        # FIXME:新しくセッションをここで作るべきではない。API叩くときとここで2回セッション貼っている。API叩いた時のセッションをここでも使えるようにした方が絶対良い。
        user_repo = UserRepository(SessionLocal())
        if user_repo.is_email_exist(email=email):
            raise ValueError('入力されたメールアドレスは既に使用されています。別のメールアドレスを入力してください。')
        return email

    class Config:
        orm_mode = True


class UserCreate(UserSchema):
    password: str
