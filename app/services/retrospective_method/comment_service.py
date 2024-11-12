import json
from time import sleep
from typing import TYPE_CHECKING, Final

from app.errors.retro_app_error import (
    RetroAppStateMachineExecutionError,
    RetroAppStateMachineMaxRetriesReachedError,
)
from app.services.notification_service import NotificationService

if TYPE_CHECKING:
    from mypy_boto3_stepfunctions import SFNClient
    from mypy_boto3_stepfunctions.literals import ExecutionStatusType
    from mypy_boto3_stepfunctions.type_defs import (
        DescribeExecutionOutputTypeDef,
        StartExecutionOutputTypeDef,
    )

    from app.schemas.retrospective_method.comment_schema import CommentSchema


class CommentService:
    STATE_STATUS_CHECK_MAX_RETRY_TIMES: Final[int] = 15
    DEFALT_SLEEP_TIME: Final[int] = 1

    def __init__(self, sfn_client: "SFNClient", state_machine_arn: str):
        self.sfn_client = sfn_client
        self.state_machine_arn = state_machine_arn

    def add_comment_from_api(
        self, comment: "CommentSchema", token: str,  sleep_time=DEFALT_SLEEP_TIME
    ):

        input = json.dumps({
            "comment": comment.model_dump(),
            "token": token,
        })
        start_execution_res = self.__start_state_machine_execution(input=input)

        for _ in range(self.STATE_STATUS_CHECK_MAX_RETRY_TIMES):
            state_status = self.__get_state_status(
                execution_arn=start_execution_res["executionArn"]
            )
            if state_status in ["SUCCEEDED"]:
                NotificationService().send_message_admin(
                    message=comment.model_dump_json()
                )
                break
            elif state_status in ["FAILED", "TIMED_OUT", "ABORTED"]:
                raise RetroAppStateMachineExecutionError(
                    message=f"Unexpected state machine status: {state_status}"
                )
            sleep(sleep_time)

        else:
            raise RetroAppStateMachineMaxRetriesReachedError(
                message="Max retries reached"
            )

        print("execution finished")

    def __start_state_machine_execution(
        self, input: str
    ) -> "StartExecutionOutputTypeDef":
        return self.sfn_client.start_execution(
            stateMachineArn=self.state_machine_arn,
            input=input,
        )

    def __get_state_status(self, execution_arn: str) -> "ExecutionStatusType":
        describe_execution_res: "DescribeExecutionOutputTypeDef" = (
            self.sfn_client.describe_execution(executionArn=execution_arn)
        )
        state_status: "ExecutionStatusType" = describe_execution_res["status"]
        print(f"status: {state_status}")
        return state_status
