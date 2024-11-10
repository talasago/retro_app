import json
from unittest.mock import MagicMock

import boto3
import pytest
from moto import mock_aws
from mypy_boto3_stepfunctions import SFNClient

from app.schemas.retrospective_method.comment_schema import CommentSchema
from app.services.retrospective_method.comment_service import CommentService


class TestCommentService:
    @pytest.fixture(scope="session")
    def mock_sfn_client(self):
        with mock_aws():
            client = boto3.client("stepfunctions", region_name="ap-northeast-1")
            yield client

    @pytest.fixture(scope="session")
    def create_sfn(self, mock_sfn_client: SFNClient):
        def _method():
            # FIXME:本当はsls.ymlから取得したい
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

    @pytest.fixture(scope="class")
    def sut(self, mock_sfn_client, create_sfn):
        return CommentService(mock_sfn_client, create_sfn()["stateMachineArn"])

    class TestAddCommentFromApi:
        @pytest.fixture()
        def mock_send_message_admin(self, mocker):
            # テストの度に毎回Line通知が行われるのを防ぐため
            return mocker.patch(
                "app.services.notification_service.NotificationService.send_message_admin"
            )

        @pytest.fixture()
        def mock_describe_execution(self, mocker, sut):
            # statusを設定するため
            def _method(status: str):
                return mocker.patch.object(
                    sut.sfn_client,
                    "describe_execution",
                    return_value={
                        "status": status,
                    },
                )

            return _method

        # ステートマシンが終了したとき
        def test_add_comment_from_api(
            self,
            sut: CommentService,
            mock_send_message_admin: MagicMock,
            mock_describe_execution: MagicMock,
        ):
            comment = CommentSchema(
                retrospective_method_id=1, user_id=1, comment="Test comment"
            )
            mock_describe_execution_sucessed = mock_describe_execution(
                status="SUCCEEDED"
            )

            sut.add_comment_from_api(comment)

            mock_send_message_admin.assert_called_once_with(
                message=comment.model_dump_json()
            )
            mock_describe_execution_sucessed.assert_called_once()

        # ステートマシンがfailedの場合のテストが必要
