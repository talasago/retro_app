# appディレクトリの実行パスを追加
# TODO:テストコードのファイル毎に書くのはめんどいので共通化したい気持ち
import sys
import os
pj_root_path = os.path.join(os.path.dirname(__file__), '../')
sys.path.append(pj_root_path)


import pytest  # noqa: E402
from sqlalchemy.orm.session import Session  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from app.database import SessionLocal, Base  # noqa: E402
from sqlalchemy import create_engine, text  # noqa: E402
from app.repository.user_repository import UserRepository  # noqa: E402


@pytest.fixture(scope='session')
def db() -> Session:
    """データベースセッションのフィクスチャ。TBLを削除→作成→テスト実行→DB接続セッション削除としている"""

    # NOTE:TBL削除→TBL作成→→テスト実行できるようにすることで、テストデータを毎回削除する手間を減らしている。
    # ロジックはこちらのHPを参考にし
    # https://nikaera.com/archives/pytest-sqlalchemy-alembic/

    # TODO:環境変数とかにしたほうがいいかも
    TEST_SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:postgres_password@localhost:5432/postgres'
    engine = create_engine(TEST_SQLALCHEMY_DATABASE_URL)

    # テーブルの削除と作成
    Base.metadata.drop_all(bind=engine)
    with engine.connect() as connection:
        # マイグレートのバージョン管理しているテーブルも削除することで、マイグレートできる
        connection.execute(text('DROP TABLE IF EXISTS alembic_version;'))
    migrate()

    db = SessionLocal()
    try:
        yield db  # type: ignore
    finally:
        db.close()
        engine.dispose()


def migrate() -> None:
    # マイグレーションの実行
    alembic_cfg = Config('alembic.ini')
    command.upgrade(alembic_cfg, 'head')


@pytest.fixture(scope='session')
def user_repo(db: Session) -> UserRepository:
    return UserRepository(db)
