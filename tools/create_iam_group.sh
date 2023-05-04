# NOTE:CloudShellで実行してください

# IAMグループ（管理者）の作成とポリシーアタッチ
iam_group_name="administrator"
iam_group_policy="arn:aws:iam::aws:policy/AdministratorAccess"

aws iam create-group \
  --group-name ${iam_group_name}

aws iam attach-group-policy \
  --group-name ${iam_group_name} \
  --policy-arn ${iam_group_policy}

# -----------------------------------------

# IAMグループ（読み取り）の作成とポリシーアタッチ
iam_group_name="readonly"
iam_group_policy="arn:aws:iam::aws:policy/ReadOnlyAccess"

aws iam create-group \
  --group-name ${iam_group_name}

aws iam attach-group-policy \
  --group-name ${iam_group_name} \
  --policy-arn ${iam_group_policy}
