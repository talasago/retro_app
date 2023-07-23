from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse
from mangum import Mangum
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..schemas.user_schema import UserCreate
from ..repository.user_repository import UserRepository

app = FastAPI()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ユーザー登録のエンドポイント
@app.post('/api/v1/signup/', response_model=UserCreate)
async def signup_user(user: UserCreate, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user_repo.create_user(user_params=user)
    return JSONResponse(content={'message': 'ユーザー登録が成功しました。'})


handler = Mangum(app)
