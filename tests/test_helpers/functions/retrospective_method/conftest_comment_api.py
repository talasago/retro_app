import pytest
from httpx import Response

from app.functions.lambda_handler.add_comment import lambda_handler
from app.schemas.retrospective_method.comment_schema import CommentSchema
from tests.test_helpers.create_test_user import create_test_user

# @pytest.fixture(autouse=True)
# def create_sfn(mock_sfn_client: "SFNClient") -> None:
#     # serverless.ymlに記載しているので、そこから取得するよう、serverless_localstackを使ってもいいかも
#     # 今は2重管理になってる
#     iam_client: "IAMClient" = boto3.client("iam", endpoint_url="http://localhost:4566")
#
#     role_arn = ""
#     try:
#         res_create_role: "CreateRoleResponseTypeDef" = iam_client.create_role(
#             RoleName="AddCommentStateMachineRole",
#             AssumeRolePolicyDocument='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"states.amazonaws.com"},"Action":"sts:AssumeRole"}]}',
#         )
#         role_arn = res_create_role["Role"]["Arn"]
#     except iam_client.exceptions.EntityAlreadyExistsException:
#         role_arn = iam_client.get_role(RoleName="AddCommentStateMachineRole")["Role"]["Arn"]
#
#     mock_sfn_client.create_state_machine(
#         name="AddCommentStateMachine",
#         definition=json.dumps(
#             {
#                 "StartAt": "SendLineMessage",
#                 "States": {
#                     "AddCommentState": {
#                         "End": True,
#                         "Parameters": {
#                             "FunctionName": "" # lambdaをlocalstackにデプロイする必要がある。ちょっと手間なので対応しない。
#                             # FIXME:apiテストと考えると対応した方が本来は良い。
#                         },
#                         "Resource": "arn:aws:states:::lambda:invoke",
#                         "Type": "Task",
#                     }
#                 },
#             }
#         ),
#         roleArn=role_arn,
#     )
#
# @pytest.fixture(scope="function")
# def mock_sfn_client(mocker) -> "SFNClient":
#     mock_client: "SFNClient" = boto3.client(
#         "stepfunctions",
#         endpoint_url="http://localhost:4566",
#         region_name="ap-northeast-1",
#     )
#     mocker.patch("app.functions.retrospective_method.comment.sfn_client", mock_client)
#     return mock_client
# 各関数の引数のテストをしたい


@pytest.fixture(scope="session")
def add_comment_api(test_client):
    def _method(
        access_token: str,
        comment_data: dict = {},
        is_assert_response_code_2xx: bool = True,
        retrospective_method_id=1,
        option: dict = {},
    ) -> Response:
        response = test_client.post(
            f"/api/v1/retrospective_method/{retrospective_method_id}/comment",
            json=comment_data,
            headers={
                "accept": "application/json",
                "Authorization": f"Bearer {access_token}",
                "Origin": "http://localhost",
            },
        )
        if is_assert_response_code_2xx:
            assert response.status_code == 201
        return response

    return _method


@pytest.fixture(scope="session")
def add_comment_from_lambda_function(user_repo, db):
    def _method(
        comment_data: dict = {},
        retrospective_method_id=1,
    ) -> None:
        #  HACK:毎回ユーザーを作成するので速度が遅くなってるかも。
        test_user = create_test_user(user_repo=user_repo)

        comment: dict = CommentSchema(
            user_id=test_user.id,
            retrospective_method_id=retrospective_method_id,
            **comment_data,
        ).model_dump()
        lambda_handler(event=comment, context=None, db=db)

    return _method


@pytest.fixture(scope="session")
def get_comment_api(test_client):
    def _method(
        access_token: str | None = None,
        is_assert_response_code_2xx: bool = True,
        retrospective_method_id=1,
        option: dict = {},
    ) -> Response:
        headers = {
            "accept": "application/json",
            "Origin": "http://localhost",
        }
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"

        response = test_client.get(
            f"/api/v1/retrospective_method/{retrospective_method_id}/comment",
            headers=headers,
        )

        if is_assert_response_code_2xx:
            assert response.status_code == 200
        return response

    return _method
