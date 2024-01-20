from httpx import Response


def assert_cors_headers(response: Response) -> None:
    assert response.headers["access-control-allow-origin"] == "*"
