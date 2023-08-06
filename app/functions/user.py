from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from mangum import Mangum
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..schemas.user_schema import UserCreate
from ..repository.user_repository import UserRepository
from ..helpers.password_helper import PasswordHelper

# 型アノテーションだけのimport。これで本番実行時はインポートされなくなり、処理速度が早くなるはず
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from ..models.user_model import UserModel

app = FastAPI()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ユーザー登録のエンドポイント
# FIXME:response_modelが間違ってる
@app.post('/api/v1/sign_up/', response_model=UserCreate)
def signup_user(user: UserCreate, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user_repo.create_user(user_params=user)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={'message': 'ユーザー登録が成功しました。'}
    )


# ログインのエンドポイント
# FIXME:response_model追加
@app.post('/api/v1/token/')
def sign_in(form_data: OAuth2PasswordRequestForm = Depends(),
            db: Session = Depends(get_db)):
    """トークン発行"""
    # NOTE:usernameとあるが、実際はemail。OAuthの仕様によりusernameという名前になっているらしい。
    authenticate(db, form_data.username, form_data.password)
    # TODO:トークン作成

    return JSONResponse(
        content={'message': 'ログインしました'}
    )


handler = Mangum(app)


# HACK:以下のコードはサービスクラス or ヘルパークラスに移動すること
# TODO:エラー時に平文パスワードが見えないようにする仕組みが必要
def authenticate(db: Session, email: str, password: str):
    """パスワード認証し、userを返却"""
    user_repo = UserRepository(db)
    user: UserModel = user_repo.get_user_by_email(email=email)
    # TODO:emailで検索した結果0件の場合の考慮が必要。get_user_by_email()内でErrorにするのか？それとも別案？

    if not PasswordHelper.is_password_matching(plain_pw=password,
                                               hashed_pw=user.hashed_password):
        # TODO:カスタムエラークラスにする
        raise HTTPException(status_code=401, detail='パスワード不一致')
    return user
