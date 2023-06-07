from peewee import PostgresqlDatabase, Model, TextField
import os

# PostgreSQLの接続情報
db = PostgresqlDatabase(
    os.environ['POSTGRES_DATABASE'],
    user=os.environ['POSTGRES_USER'],
    password=os.environ['POSTGRES_PASSWORD'],
    host=os.environ['POSTGRES_HOST'],
    port=5432
)


# モデルの定義
class Message(Model):
    message = TextField()

    class Meta:
        database = db
        table_name = 'messages'


def save_to_rdb(event, context):
    message = "hello world"

    db.connect()
    db.create_tables([Message], safe=True)

    # メッセージを保存
    Message.create(message=message)

    db.close()

    return {
        "statusCode": 200,
        "body": "Message saved to RDB"
    }
