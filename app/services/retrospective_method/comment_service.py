from typing import TYPE_CHECKING, Final

from app.services.notification_service import NotificationService

if TYPE_CHECKING:
    from mypy_boto3_stepfunctions import SFNClient
    from mypy_boto3_stepfunctions.type_defs import (
        DescribeExecutionOutputTypeDef,
        StartExecutionOutputTypeDef,
    )

    from app.schemas.retrospective_method.comment_schema import CommentSchema


class CommentService:
    STATE_STATUS_CHECK_MAX_RETRY_TIMES: Final[int] = 15

    def __init__(self, sfn_client: "SFNClient", state_machine_arn: str):
        self.sfn_client = sfn_client
        self.state_machine_arn = state_machine_arn

    def add_comment_from_api(self, comment: "CommentSchema"):
        # FIXME: 複雑化しているので、private関数に切り出したい
        # 1. ステートマシンを起動
        # 2. 特定の条件に合致してたらlineを呼び出す

        start_execution_res: StartExecutionOutputTypeDef = (
            self.sfn_client.start_execution(
                stateMachineArn=self.state_machine_arn,
                input=comment.model_dump_json(),
            )
        )
        print("started execution")

        for _ in range(self.STATE_STATUS_CHECK_MAX_RETRY_TIMES):
            describe_execution_res: "DescribeExecutionOutputTypeDef" = (
                self.sfn_client.describe_execution(
                    executionArn=start_execution_res["executionArn"]
                )
            )
            state_status = describe_execution_res["status"]
            print(f"status: {state_status}")

            if state_status in ["SUCCEEDED"]:
                NotificationService().send_message_admin(
                    message=comment.model_dump_json()
                )

                break
            elif state_status in ["FAILED", "TIMED_OUT", "ABORTED"]:
                # TODO: エラー処理
                print("error")
                break
            # time.sleep(1)

        else:
            # TODO: エラー処理
            print("Max retries reached")

        print("execution finished")

# enumを使って、ステータスを管理する
