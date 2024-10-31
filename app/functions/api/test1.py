import time
from typing import TYPE_CHECKING

import boto3
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from mangum import Mangum

app = FastAPI()

if TYPE_CHECKING:
    from mypy_boto3_stepfunctions import SFNClient

@app.post("/test")
def test():
    client: "SFNClient" = boto3.client("stepfunctions")
    stateMachineArn = "arn:aws:states:ap-northeast-1:926198032577:execution:MyStateMachine:1735f57b-f6a8-42dd-b25e-e9e0300f0c19"

    client.start_execution(
        # TODO:arnの取得方法を検討する。環境変数？
        stateMachineArn=stateMachineArn,
        name="HelloWorld-StateMachine",
        input='{"key1": "value1", "key2": "value2", "key3": "value3"}',
    )

    while True:
        response = client.describe_execution(executionArn=stateMachineArn)
        sfn_status = response["status"]
        # TODO:statusは要確認
        if sfn_status in ["SUCCEEDED", "FAILED", "TIMED_OUT", "ABORTED"]:
            break
        time.sleep(1)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"message": "test", "create_data": "data"},
    )


handler = Mangum(app)
