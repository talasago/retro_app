import os
import sys
from collections.abc import Generator

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text
from sqlalchemy.orm.session import Session

pj_root_path = os.path.join(os.path.dirname(__file__), "../")
sys.path.append(pj_root_path)

from app.database import Base, SessionLocal  # noqa: E402

# Base.metadataにテーブルを含めるために一時的にmodelをインポート。
# TODO:repositoryを作成したら、repositoryをインポートするように変更する
from app.models.retrospective_method.comment_model import (  # noqa: F401,E402
    CommentModel,
)
from app.repository.user_repository import UserRepository  # noqa: E402

pytest_plugins = [
    "test_helpers.functions.conftest_user_api",
    "test_helpers.functions.retrospective_method.conftest_comment_api",
    "test_helpers.functions.conftest_invalid_token",
]


@pytest.fixture(scope="session")
def db() -> Generator[Session, None, None]:
    """データベースセッションのフィクスチャ。TBLを削除→作成→テスト実行→DB接続セッション削除としている"""

    # NOTE:TBL削除→TBL作成→→テスト実行できるようにすることで、テストデータを毎回削除する手間を減らしている。
    # テスト実行後にテストデータを削除しない理由について、もしテスト実行後にテストデータを削除したら、
    # テストが落ちた時になぜ落ちたか、原因を判断するための材料が一つ減ってしまうため。
    # テスト実行前にデータを削除すると、テストが落ちた時にデータを見て原因を判断しやすくなる。

    # ロジックはこちらのHPを参考にした
    # https://nikaera.com/archives/pytest-sqlalchemy-alembic/

    # FIXME:test_user_functionなどで、このURLを見に行かずにdatabase.pyを見に行っているので、
    # DB接続セッションが無駄に2個使われてる。
    test_db_url = "postgresql://postgres:postgres_password@localhost:5432/postgres"
    engine = create_engine(test_db_url)

    # テーブルの削除と作成
    Base.metadata.drop_all(bind=engine)
    with engine.connect() as connection:
        # マイグレートのバージョン管理しているテーブルも削除することで、マイグレートできる
        connection.execute(text("DROP TABLE IF EXISTS alembic_version;"))
        connection.commit()
    migrate()

    db = SessionLocal()
    try:
        yield db  # type: ignore
    finally:
        db.close()
        engine.dispose()


def migrate() -> None:
    # マイグレーションの実行
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")


@pytest.fixture(scope="session")
def user_repo(db: Session) -> UserRepository:
    return UserRepository(db)
