from unittest.mock import MagicMock, patch

import botocore
import pytest

from app.db_password import DbPasswordFromSSM


def test_get_db_password_retry():
    """テスト観点: aws側でエラーが発生した場合に、MAX_RETRY回数分リトライすること"""

    mock_ssm_client = MagicMock()

    mock_ssm_client.get_parameter.side_effect = botocore.exceptions.ClientError(
        {"Error": {"Message": "InternalServerError", "Code": "InternalServerError"}},
        "GetParameter",
    )

    with patch(
        "boto3.client",
        return_value=mock_ssm_client,
    ):
        with pytest.raises(botocore.exceptions.ClientError):
            db_password = DbPasswordFromSSM()
            db_password.get_db_password()

    assert mock_ssm_client.get_parameter.call_count == DbPasswordFromSSM.MAX_RETRY
