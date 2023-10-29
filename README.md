# このリポジトリは何か
ふりかえりアプリ用

# 実行環境(バックエンド)
|  |  |
| - | - |
| Python | 3.10 |
| PostgreSQL |  |
| FastAPI | PythonのWebAPIフレームワーク |
| Mangum | FastAPIをLambdaで使いやすくする |
| SQLAlchemy | O/Rマッパー |
| alembic | DBのテーブル定義の変更履歴を管理 |
| pydantic | パラメタのバリデーション管理 + OpenAPIの定義用 |

# ディレクトリ構成
```
├── Pipfile => pythonのライブラリを管理
├── Pipfile.lock => pythonのライブラリを管理
├── app/ => デプロイするコード。
│   ├── database.py => databaseへの接続情報を管理
│   ├── errors/ => カスタムエラークラスを管理
│   ├── functions/ => Lambdaで実行されるエントリポイントとしてのコードを管理
│   ├── helpers/ => 共通化したコードを管理
│   ├── models/ => SQLAlchemy用のコードを管理。基本的に1テーブルに1ファイル作成する。
│   ├── repository/ => データベースへの更新処理や登録処理など、データベースとのやり取りを行うコード。
│   ├── schemas/ => pydantic用のコードを管理。基本的に1テーブルに1ファイル作成する(はず)。
│   └── services/ => ビジネスロジックを管理。
├── database/ => alembic用
│   └── versions => テーブル定義の変更履歴を管理
├── debug/ => 検証のための一時コード。デプロイしない。
├── docker-compose.yml => ローカル実行用
├── test/ => テストコード
│   ├── conftest.py => テスト実行時に必ず呼ばれる親ファイルみたいなもの
│   ├── feature/ => テストデータを管理
│   └── それ以外のディレクトリ => app/配下と同じレイヤーのテストを管理
└── tools/ => 便利なツール。デプロイしない。
```

# 設計方針(コーディング規約)
- エンドユーザーに返す可能性があるエラーメッセージは日本語、そうでない内部的なエラーメッセージは英語とする。

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
```bash
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
```bash
$ pip install --upgrade pip
$ pip install pipenv
$ pipenv sync
$ pipenv sync --dev
# Pipfileのライブラリがローカルにインストールされる
``` 
`Pipfile`に存在するライブラリを実行する際は、`pipenv run ${実行するライブラリ名}` または `pipenv shell`→`${実行するライブラリ名}`としてください。(どちらでも構いません)
このドキュメントでは、`Pipfile`に存在するライブラリを実行する際は`pipenv shell`が実行されている前提で記載しています。

#### PostgreSQLのドライバー
`$ pipenv sync`時にPostgresのドライバーが無くて怒られるかもしれない。その時は以下のコマンドを恐らく使えばいいはず。
```
# macの場合
$ brew install postgresql
```

### テスト実行
`export POSTGRES_DATABASE="postgres"; export POSTGRES_HOST="localhost"; export POSTGRES_PASSWORD="postgres_password"; export POSTGRES_USER="postgres"`を実行後、`$ pytest`を実行すると、pytestが実行されます。

### テーブル定義の反映
初回実行 または テーブルに変更があった(`database/versions`にファイルが追加・更新された)場合、ローカル環境にテーブル定義を反映させるために以下のコマンドを実行してください
```bash
$ alembic upgrade head
```

# Tips
## テーブルを新規で追加するときは
1. SQLAlchemyのモデルファイルを作成する
  - 例) `app/models/user.py`
2. alembicのマイグレーションファイルを作成する
  - `$ alembic revision --autogenerate -m "${メッセージ}"`
3. `database/versions/`配下に作成されたマイグレーションファイルを修正する
4. `alembic upgrade head`を実行すると、ローカルのDBにテーブル定義が反映される

## Lambda Functionのデプロイ方法
GithubAcions([deploy_lambda_function](https://github.com/talasago/retro_app_backend/actions/workflows/deploy_lambda_function.yml))を手動で起動すると、その時点でpushされているコードをLambdaにデプロイします。

※現時点でdevelopブランチのみ対応、mainブランチは今後対応予定  
※GithubActionsの手動起動方法は、[公式サイト](https://docs.github.com/ja/actions/using-workflows/manually-running-a-workflow)みてね  
※ロールの定義は[ココ](https://github.com/talasago/retro_app_backend/blob/develop/infra/iam_for_cd.yml)  
## LighisailのDBにテーブル定義の変更を加える(migrate)の方法
GithubAcions([migrate_database](https://github.com/talasago/retro_app_backend/actions/workflows/migate_database.yml))を手動で起動すると、その時点でpushされているコード(alembic関連)を、Lighisail上のPostgreSQLに反映します。  

※現時点でdevelopブランチのみ対応、mainブランチは今後対応予定  
※GithubActionsの手動起動方法は、[公式サイト](https://docs.github.com/ja/actions/using-workflows/manually-running-a-workflow)みてね  
※ロールの定義は[ココ](https://github.com/talasago/retro_app_backend/blob/develop/infra/iam_for_cd.yml)  

## Linter+Formatterの実行方法
```bash
$ pipenv run format_and_lint 
```

## 開発用のエディタ
- 何でも良いですが、VSCodeをお勧めします。
  - `.vscode/`にVSCode用の設定ファイルがあります。VSCodeを使用している場合は自動で適用されます。

## テスト戦略
随時追加予定
### 単体テスト
- pytestで実施
- services/とschemas/とmodels/に対して実行するテスト
  - DBに接続せずに実施できるため一番早い
  - services/はビジネスロジックだけをテストしたいため、DBとの接続はモック化してください
  - TODO:詳細を書く

### コンポーネント結合テスト
- pytestで実施
  - repository/とfunctions/に対して実行するテスト
    - DBアクセスが必要なのでやや遅い
    - ※DBアクセスは外部依存となるためコンポーネント結合テストに位置付け

### システム結合テスト
(TBD)AWSに接続してWebAPIを叩くテスト

### システムテスト
(TBD)画面上で実施するテスト
