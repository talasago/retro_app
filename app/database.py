from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import Engine

# TODO:本番環境の設定を別途検討する必要あり
# TODO:alembic.iniと共通化した方が良さそう。環境変数とかかなあ
SQLALCHEMY_DATABASE_URL: str = 'postgresql://postgres:postgres_password@localhost:5432/postgres'

engine: Engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal: sessionmaker = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)
Base: any = declarative_base()
