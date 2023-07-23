from pydantic import BaseModel


class UserSchema(BaseModel):
    """pydanticのモデルクラス"""

    # TODO:あとでEmailStrに変更する
    email: str
    name: str

    # ---TODO:以下バリデーションで実施したいことの雑なメモ----
    # 登録時のバリデーションたち
    # nameが存在するかチェック
    # emailがすでに存在するかチェック
    # emailのフォーマット
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
