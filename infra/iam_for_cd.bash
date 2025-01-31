#!/bin/bash
# 起動条件：環境変数にAWS_PROFILEが設定されていること
# $ export AWS_PROFILE='[YOUR PROFILE NAME]'

usage() {
    echo "Usage: $0 arg1"
    echo "arg1:"
    echo "  create, stack create,"
    echo "  update, stack update."
    echo "  delete, stack delete."
}

if [[ $# != 1 ]]; then
  usage;
  exit 1;
fi

readonly TEMPLATE_FILE_NAME='iam_for_cd.yml'
readonly STACK_NAME='iam-for-cd'

case $1 in
  create)
    aws cloudformation create-stack --stack-name "${STACK_NAME}" --template-body "file://${TEMPLATE_FILE_NAME}"  --capabilities CAPABILITY_NAMED_IAM;;
  update)
    aws cloudformation update-stack --stack-name "${STACK_NAME}" --template-body "file://${TEMPLATE_FILE_NAME}"  --capabilities CAPABILITY_NAMED_IAM;;
  delete)
    aws cloudformation describe-stack-events --stack-name "${STACK_NAME}";;
  *)
    usage;
    exit 1;
esac
