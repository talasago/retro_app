import pytest
from fastapi.testclient import TestClient
from httpx import Response

from app.functions.retrospective_method.comment import app as app_comment

# MEMO:clientもどこかで共通化した方が良いかもしれない
client_comment = TestClient(app_comment)


@pytest.fixture(scope="session")
def add_comment_api():
    def _method(
        comment_data: dict,
        access_token: str,
        retrospective_method_id=1,
        option: dict = {},
    ) -> Response:
        response = client_comment.post(
            f"/api/v1/retrospective_method/{retrospective_method_id}/comment",
            json=comment_data,
            headers={
                "accept": "application/json",
                "Authorization": f"Bearer {access_token}",
                "Origin": "http://localhost",
            },
        )
        assert response.status_code == 201
        return response

    return _method
