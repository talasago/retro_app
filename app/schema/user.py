from pydantic import BaseModel


class User(BaseModel):
    """pydanticのモデルクラス"""
    # id: int
    # TODO:一旦strにする
    # uuid: str

    # TODO:あとでEmailStrに変更する
    email: str
    name: str
    # hashed_password: str

    # ---TODO:以下バリデーションで実施したいこと----
    # 登録時のバリデーションたち
    # nameが存在するかチェック
    # emailがすでに存在するかチェック
    # emailのフォーマット
    # passwordの最低文字数とか大文字小文字含むとか
    # nullは許可しない
    # nameは50文字。でも50文字とどうやってカウントする？サロゲートペアとか。
    # nameは半角スペース or 全角スペースだけは不許可にする

    # uuidは存在していても、もう一度採番する
    # nameはどんな文字でも基本許可する。でも制御文字は許可したくない。
    # バックスラッシュと円記号は片方だけの許可でいい気がする
    class Config:
        orm_mode = True


class UserCreate(User):
    password: str
