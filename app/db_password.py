import logging
import os
import time
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Final

import boto3
import botocore

from app.helpers.utils import is_ci_execution, is_local_execution

if TYPE_CHECKING:
    from mypy_boto3_ssm.client import SSMClient


logger = logging.getLogger()


class DbPasswordFactory:
    @staticmethod
    def create() -> "DbPassword":
        if is_local_execution() or is_ci_execution():
            return DbPasswordFromEnv()
        else:
            return DbPasswordFromSSM()


class DbPassword(ABC):
    MAX_RETRY: Final[int] = 2

    @abstractmethod
    def get_db_password(self) -> str:
        pass


class DbPasswordFromEnv(DbPassword):
    # ローカル環境 or CI用
    def get_db_password(self) -> str:
        return os.environ["POSTGRES_PASSWORD"]


class DbPasswordFromSSM(DbPassword):
    # 開発環境 or 本番環境用
    def get_db_password(self) -> str:
        # パスワードを環境変数の平文に設定したくないのでparameter storeから取得する
        ssm: "SSMClient" = boto3.client("ssm", region_name="ap-northeast-1")

        for i in range(self.MAX_RETRY):
            try:
                # TODO: 本番環境と開発環境でパラメータ名が違うので修正する必要あり
                # 環境変数でnameを切り替えるとか
                logger.info("try get parameter from ssm")
                response = ssm.get_parameter(
                    Name="postgres_database", WithDecryption=True
                )
                logger.info("success get parameter from ssm")
            except botocore.exceptions.ClientError as e:
                if (
                    e.response["Error"]["Code"] == "InternalServerError"
                ) and i < self.MAX_RETRY - 1:
                    logger.error("InternalServerError. retrying...")
                    time.sleep(1)
                    # FIXME: リトライ処理を書いていない

                else:
                    # 呼び出し元で何もエラーハンドリングしないことで、500エラーになる想定
                    logger.error("fail get parameter from ssm.")
                    logger.error(e)
                    raise

        return response["Parameter"]["Value"]

    # 将来、boto3使わずともlambda拡張でparameterstoreの値を取得できるかも。
    # 現在はARMサポートされてないらしい。
    # Lambda拡張にすることでコストが削減できるかもしれないのでメモ
    # https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html
    # https://dev.classmethod.jp/articles/lambda-get-paramater/
