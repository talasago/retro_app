# parameter storeの用途
環境変数、DBパスワードを保存しています。

DBパスワードを取得する際は、boto3経由でアクセスしています。


## スループットとかコストとか
スタンダードスループット(TPS40)だったらAPI無料
https://aws.amazon.com/jp/systems-manager/pricing/

毎秒40リクエストはしないだろうし困らないだろうと判断。

### もしスタンダードスループットを超えてアクセスすることが頻発する阿合。

まず、Lambdaのウォームスタートを考慮して、DBパスワード変数をグローバル変数にしてみてもいいかもしれません。
https://dev.classmethod.jp/articles/aws-lambda-cache-parameters-fetched-from-parameter-store-as-global-variables/
https://qiita.com/shinsaka/items/9a49e478317c54dd1c9a

もしそれでもだめそうなら、スループットの上限に変更も考えてもいいかもしれません。仮にスループットを変更しても0.5USDだけで済む気がする。多分。1万回もつかわないだろうと思います。
