#!/bin/bash
# 起動条件：環境変数にAWS_PROFILEが設定されていること
# $ export AWS_PROFILE='[YOUR PROFILE NAME]'

usage() {
    echo "Usage: $0 arg4"
    echo "arg4:"
    echo "  create, stack create,"
    echo "  update, stack update."
    echo "  delete, stack delete."
}

if [[ $# != 4 ]]; then
  usage;
  exit 1;
fi

readonly STACK_NAME='iam-for-cd'


# 変数の設定
export MIGRATE_ROLE_NAME="$1"
export DEPLOY_ROLE_NAME="$2"
export POLICY_NAME="$3"
readonly OUTPUT_FILE="./iam_for_cd_generated.yml"

# テンプレートファイルを読み込み、変数を置換して出力ファイルに書き込む
envsubst < './iam_for_cd.yml' > $OUTPUT_FILE


case $4 in
  create)
    aws cloudformation create-stack --stack-name "${STACK_NAME}" --template-body "file://${OUTPUT_FILE}"  --capabilities CAPABILITY_NAMED_IAM;;
  update)
    aws cloudformation update-stack --stack-name "${STACK_NAME}" --template-body "file://${OUTPUT_FILE}"  --capabilities CAPABILITY_NAMED_IAM;;
  delete)
    aws cloudformation describe-stack-events --stack-name "${STACK_NAME}";;
  *)
    usage;
    exit 1;
esac
