import pytest
from httpx import Response


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


@pytest.fixture(scope="session")
def delete_comment_api(test_client):
    def _method(
        access_token: str,
        comment_id: int,
        is_assert_response_code_2xx: bool = True,
        retrospective_method_id=1,
        option: dict = {},
    ) -> Response:
        response = test_client.delete(
            f"/api/v1/retrospective_method/{retrospective_method_id}/comment/{comment_id}",
            headers={
                "accept": "application/json",
                "Authorization": f"Bearer {access_token}",
                "Origin": "http://localhost",
            },
        )
        if is_assert_response_code_2xx:
            assert response.status_code == 200
        return response

    return _method
