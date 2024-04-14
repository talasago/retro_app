import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.helpers.utils import is_local_execution, load_env_for_local

if is_local_execution():
    load_env_for_local()


def add_cors_middleware(app: FastAPI):
    origins: list = os.environ["ORIGINS"].split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=("DELETE", "GET", "OPTIONS", "POST", "PUT"),
        allow_headers=("Accept", "Accept-Language", "Content-Language", "Content-Type", "Authorization", "accept"),
        # アクセスできるHTTPヘッダー情報
        expose_headers=["*"],
    )
