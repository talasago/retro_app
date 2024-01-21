import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# TODO:環境変数ファイル読み込み共通化。helpersに移動しても良さそう
pj_root_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../")
env_file_path = os.path.join(pj_root_path, ".env.local")


if os.path.isfile(env_file_path):
    from dotenv import load_dotenv

    # MEMO:ローカル環境だけ読み込む。
    # CIはGithubActions上で環境変数を読み込み、dev/prodはserverless.yml空設定した値を読み込む。
    load_dotenv(env_file_path)


def add_cors_middleware(app: FastAPI):
    origins: list = os.environ["ORIGINS"].split(",")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=("DELETE", "GET", "OPTIONS", "POST", "PUT"),
        allow_headers=("Accept, Accept-Language, Content-Language, Content-Type"),
        # アクセスできるHTTPヘッダー情報
        expose_headers=["*"],
    )
