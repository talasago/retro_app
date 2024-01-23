import os

import boto3
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.helpers.utils import is_local_execution, load_env_for_local

if is_local_execution():
    load_env_for_local()


def get_db_password() -> str:
    if is_local_execution():
        return os.environ["POSTGRES_PASSWORD"]

    # 平文で環境変数に設定したくないのでparameter storeから取得する
    ssm = boto3.client("ssm", region_name="ap-northeast-1")
    response = ssm.get_parameter(Name="postgres_database", WithDecryption=True)
    return response["Parameter"]["Value"]
    # ssmの操作とかを別ファイルに移動して責務を分解してももいいかもしれないが、他にssm使う予定もないこと、
    # このファイル単体でテストすることは無いので移動してない。

    # 将来、boto3使わずともlambda拡張でparameterstoreの値を取得できるかも。
    # 現在はARMサポートされてないらしい。
    # Lambda拡張にすることでコストが削減できるかもしれないのでメモ
    # https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html
    # https://dev.classmethod.jp/articles/lambda-get-paramater/


POSTGRES_PASSWORD = get_db_password()
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
