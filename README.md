# このリポジトリは何か
ふりかえりアプリ用

# 実行環境(バックエンド)
- Python
  - 3.10(Lambdaやserverless frameworkとの兼ね合いで変更の可能性あり)
- PostgreSQL
- FastAPI
- Mangum
  - FastAPIをLambdaで使いやすくする
- SQLAlchemy
  - ORマッパー
- alembic
  - DBのテーブル定義の変更履歴を管理
- pydantic
  - パラメタのバリデーション管理

# ディレクトリ構成
後で書く。

# ローカル環境構築(バックエンド)

## DockerでpostgreSQLを起動
[公式ドキュメント](https://matsuand.github.io/docs.docker.jp.onthefly/desktop/)などを参考に`Docker Desktop`をダウンロードし、起動してください。
そして、以下のコマンドを実行すると、ローカルでPostgreSQLが動きます
```
$ docker-compose up
```
## Python
### pyenvのインストール
ローカルのPythonのバージョン管理とPythonを実行な仮想環境を作れるライブラリです。

恐らくこんなコマンドを居れれば良い。詳細はコチラのリンクから確認したし。
https://github.com/pyenv/pyenv#windows

以下は参考コマンド※windowsのWSL2で実行したコマンド
```
$ git clone https://github.com/pyenv/pyenv.git ~/.pyenv
$ cd ~/.pyenv && src/configure && make -C src

$ vi ~/.zprofile # PATHの設定。以下を追加。
$ export PYENV_ROOT="$HOME/.pyenv"
$ export PATH="$PYENV_ROOT/bin:$PATH"  
$ eval "$(pyenv init --path)"
$ eval "$(pyenv init -)"

$ sudo apt-get update; sudo apt-get install make build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

$ cd ${このリポジトリが存在するディレクトリに移動}
$ export PIPENV_VENV_IN_PROJECT=1
$ pyenv install 3.10.11
$ python --version
# 3.1.11となればOK!!
$ which python
# ${このリポジトリが存在するディレクトリ}配下が表示されればOK!!
```

### pipenv
```
$ pip install --upgrade pip
$ pip install pipenv
$ pipenv sync
# Pipfileのライブラリがローカルにインストールされる
``` 
`Pipfile`に存在するライブラリを実行する際は、`pipenv run ${実行するライブラリ名}` または `pipenv shell`→`${実行するライブラリ名}`としてください。

#### PostgreSQLのドライバー
`$ pipenv sync`時にPostgresのドライバーが無くて怒られるかもしれない。その時は以下のコマンドを恐らく使えばいいはず。
```
# macの場合
$ brew install postgresql
```

### テスト実行
`$ pipenv run pytest` または `$ pipenv shell`→`$ pytest`を実行すると、pytestが実行されます。

### テーブル定義の反映
初回実行 または テーブルに変更があった(`database/versions`にファイルが追加・更新された)場合、ローカル環境にテーブル定義を反映させるために以下のコマンドを実行してください
```
$ pipenv run alembic upgrade head` 
# または
$ pipenv shell
$ alembic upgrade head
```

# テーブルを新規で追加するときの方法
- TODO:詳細を書く
  - 先にSQLalchemyのモデルを作成した後に、almebicのマイグレーションファイルを作成したほうが良さそう
  