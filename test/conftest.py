# appディレクトリの実行パスを追加
# TODO:テストコードのファイル毎に書くのはめんどいので共通化したい気持ち
import sys
import os
pj_root_path = os.path.join(os.path.dirname(__file__), '../')
sys.path.append(pj_root_path)


import pytest  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from app.database import SessionLocal, Base  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402


# TODO:AutoUseをtrueにしたい
# TODO:関数名をdb_sessionにしたい
@pytest.fixture(scope='session')
def db() -> Session:
    """データベースセッションのフィクスチャ。TGLを削除→作成→テスト実行→DB接続セッション削除している"""

    # NOTE:TBL削除→TBL作成→→テスト実行できるようにすることで、テストデータを毎回削除する手間を減らしている。
    # ロジックはこちらのHPを参考にしたかった
    # https://nikaera.com/archives/pytest-sqlalchemy-alembic/
    # ホントはDBを消すべきなのだろうけど。`ERROR: cannot drop the currently open database`となって削除できない
    # 現状はTBLの削除で誤魔化している
    # https://www.postgresql.jp/document/7.3/reference/sql-dropdatabase.htmlを見ると
    # >対象とするデータベースに接続している場合、このコマンドを実行することができません。とあるので、
    # 時的に別のデータベースに接続し、テスト用のデータベースをドロップすれば行けるのかもしれない。
    # 時間かかりそうなので一旦後回し。

    # TODO:環境変数とかにしたほうがいいかも
    TEST_SQLALCHEMY_DATABASE_URL = 'postgresql://postgres:postgres_password@localhost:5432/postgres'
    engine = create_engine(TEST_SQLALCHEMY_DATABASE_URL)

    # テーブルの削除と作成
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # NOTE:これマイグレートしてる意味あるのかな。DB消してないから多分意味ない.
    migrate()

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        engine.dispose()


def migrate() -> None:
    # マイグレーションの実行
    alembic_cfg = Config('alembic.ini')
    command.upgrade(alembic_cfg, 'head')
