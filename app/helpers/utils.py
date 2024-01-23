import os

pj_root_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../")
env_file_path = os.path.join(pj_root_path, ".env.local")


def is_local_execution() -> bool:
    return os.path.isfile(env_file_path)


def load_env_for_local() -> None:
    from dotenv import load_dotenv

    # MEMO:ローカル環境だけ読み込む。
    # CIはGithubActions上で環境変数を読み込み、dev/prodはserverless.yml空設定した値を読み込む。
    load_dotenv(env_file_path)
