from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# TODO:originとMethodを可変にしたい。
# TODO:その他の設定は適切に設定したい。
def add_cors_middleware(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
