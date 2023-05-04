# 変数の設定（SNSトピック／サブスクリプション）sns_topic_arn
readonly sns_topic_name="sns_topic_bill_alert"
readonly email_address="" #TODO: 追加してください

# 変数の設定（CloudWatchアラーム）
readonly alarm_name="bill_over_alert"
readonly billing_over_USD=7 # 閾値のドル価格を設定
readonly period=21600 # 判定期間を6時間に設定

# SNSトピックの作成しARNを変数へ格納
sns_topic_arn=$(aws sns create-topic \
  --region us-east-1 \
  --name ${sns_topic_name} \
  --tags "Key=Name,Value=${sns_topic_name}" |
  jq -r .TopicArn) \
  && echo ${sns_topic_arn}

# SNSサブスクリプションを作成
aws sns subscribe \
  --region us-east-1 \
  --topic-arn ${sns_topic_arn} \
  --protocol email \
  --notification-endpoint ${email_address}

# 手作業でメール認証
#   登録したEメールアドレスにメールが届く
#   - 件名 : AWS Notification - Subscription Confirmation
#   メール内の「Confirm subscription」をクリックし、
#   ブラウザで「Subscription confirmed!」と表示されること

# CloudWatchアラームの作成（請求アラーム）
aws cloudwatch put-metric-alarm \
  --region us-east-1 \
  --alarm-name ${alarm_name} \
  --alarm-actions ${sns_topic_arn} \
  --metric-name "EstimatedCharges" \
  --namespace "AWS/Billing" \
  --statistic "Maximum" \
  --dimensions "Name=Currency,Value=USD" \
  --period 21600 \
  --evaluation-periods 1 \
  --datapoints-to-alarm 1 \
  --threshold ${billing_over_USD} \
  --comparison-operator "GreaterThanThreshold" \
  --treat-missing-data "missing" \
  --tags "Key=Name,Value=${alarm_name}"
