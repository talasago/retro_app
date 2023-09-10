from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import Engine
import os

# HACK:後で大文字にする
db_username = os.environ['POSTGRES_USER']
db_password = os.environ['POSTGRES_PASSWORD']
db_host = os.environ['POSTGRES_HOST']
db_name = os.environ['POSTGRES_DATABASE']

# TODO:本番環境の設定を別途検討する必要あり
# TODO:alembic.iniと共通化した方が良さそう。環境変数とかかなあ
DATABASE_URL: str = f'postgresql://{db_username}:{db_password}@{db_host}:5432/{db_name}'

engine: Engine = create_engine(DATABASE_URL)
SessionLocal: sessionmaker = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)
Base: any = declarative_base()
