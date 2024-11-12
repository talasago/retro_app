import json

import boto3
import pytest
from moto import mock_aws

from app.schemas.retrospective_method.comment_schema import CommentSchema
from app.services.retrospective_method.comment_service import CommentService


class TestCommentService:
    @pytest.fixture(scope="session")
    def mock_sfn_client(self):
        with mock_aws():
            client = boto3.client("stepfunctions", region_name="ap-northeast-1")
            yield client

    @pytest.fixture(scope="session")
    def create_sfn(self, mock_sfn_client):
        def _method():
            # 本当はsls.ymlから取得したい
            state_machine_definition = {
                 "StartAt": "AddCommentState",
                    "States": {
                        "AddCommentState": {
                            "Type": "Task",
                            "Resource": "arn:aws:lambda:ap-northeast-1:000000000000:function:add_comment_function",
                            "End": True,
                    }
                },
            }

            response = mock_sfn_client.create_state_machine(
                name="AddCommentStateMachine",
                definition=json.dumps(state_machine_definition),
                roleArn="arn:aws:iam::000000000000:role/StateMachineRole",
            )
            return response
        return _method

    @pytest.fixture(scope="session")
    def sut(self, mock_sfn_client, create_sfn):
        return CommentService(mock_sfn_client, create_sfn()["stateMachineArn"])

    class TestAddCommentFromApi:
        # 仮のテスト
        def test_add_comment_from_api(self, sut):
            comment = CommentSchema(
                retrospective_method_id=1, user_id=1, comment="Test comment"
            )

            sut.add_comment_from_api(comment)

            # TODO:lineのためのメソッドを呼び出していることをテストしたいかも
            executions = sut.sfn_client.list_executions(
                stateMachineArn=sut.state_machine_arn
            )
            assert len(executions["executions"]) == 1
            assert executions["executions"][0]["status"] == "RUNNING"  # 仮のテスト
