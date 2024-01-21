from httpx import Response


def assert_cors_headers(response: Response) -> None:
    assert "access-control-allow-origin" in response.headers
    assert (
        response.headers["access-control-allow-origin"] == "http://127.0.0.1"
        or "http://localhost"
    )
