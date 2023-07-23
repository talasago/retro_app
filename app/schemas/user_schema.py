from pydantic import BaseModel, EmailStr


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
    # nameが存在するかチェック
    # emailがすでに存在するかチェック
    # passwordの最低文字数とか大文字小文字含むとか
    # nullは許可しない
    # nameは50文字。でも50文字とどうやってカウントする？サロゲートペアとか。
    # nameは半角スペース or 全角スペースだけは不許可にする

    # passwordの最大文字数
    # uuidは存在していても、もう一度採番する
    # nameはどんな文字でも基本許可する。でも制御文字は許可したくない。
    # バックスラッシュと円記号は片方だけの許可でいい気がする
    class Config:
        orm_mode = True


class UserCreate(UserSchema):
    password: str
