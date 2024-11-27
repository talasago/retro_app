# NOTE:CloudShellで実行してください

# IAMユーザー（管理者、GUI操作用）の作成とIAMグループへ追加
## ※GUIでパスワードを使用してログインするタイプのIAMユーザー
iam_group_name="administrator"
user_names=("") # TODO:配列でuser_nameを設定してください
user_initial_password='' # TODO:初期パスワードを設定してください

for user_name in "${user_names[@]}"; do
  aws iam create-user \
    --user-name ${user_name} \
    --tags "Key=Name,Value=${user_name}"

  aws iam add-user-to-group \
    --user-name ${user_name} \
    --group-name ${iam_group_name}

  aws iam create-login-profile \
    --user-name ${user_name} \
    --password ${user_initial_password} \
    --password-reset-required
    #※初回ログイン時にパスワード変更必須
done
# ------------------------------------------------

# IAMユーザー（管理者、CLI操作用）の作成とIAMグループへ追加
## ※CLIでアクセスキーを使用してログインするタイプのIAMユーザー
user_names=("") # TODO:配列でuser_nameを設定してください
iam_group_name="administrator"

for user_name in "${user_names[@]}"; do
  aws iam create-user \
    --user-name ${user_name} \
    --tags "Key=Name,Value=${user_name}"

  aws iam add-user-to-group \
    --user-name ${user_name} \
    --group-name ${iam_group_name}

# NOTE:アクセスキーの発行はここでは行わない。必要になったら発行する
done
