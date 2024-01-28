import os

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.helpers.utils import is_local_execution, load_env_for_local

# from .db_password import DbPasswordFactory

if is_local_execution():
    load_env_for_local()

# POSTGRES_PASSWORD = DbPasswordFactory.create().get_db_password()
POSTGRES_PASSWORD = os.environ["POSTGRES_PASSWORD"]
POSTGRES_USER = os.environ["POSTGRES_USER"]
POSTGRES_HOST = os.environ["POSTGRES_HOST"]
POSTGRES_DATABASE = os.environ["POSTGRES_DATABASE"]

# TODO:本番環境の設定を別途検討する必要あり
# TODO:alembic.iniと共通化した方が良さそう。環境変数とかかなあ
DATABASE_URL: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:5432/{POSTGRES_DATABASE}"

engine: Engine = create_engine(DATABASE_URL)
SessionLocal: sessionmaker = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)
Base = declarative_base()
