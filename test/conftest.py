# appディレクトリの実行パスを追加
# TODO:テストコードのファイル毎に書くのはめんどいので共通化したい気持ち
import sys
import os
app_path = os.path.join(os.path.dirname(__file__), '../')
sys.path.append(app_path)
print(app_path)


import pytest  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402
from app.database import SessionLocal  # noqa: E402


@pytest.fixture(scope="module")
def db() -> Session:
    """データベースセッションのフィクスチャ"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
