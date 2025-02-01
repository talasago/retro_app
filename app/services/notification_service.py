from app.clients.line_api_client import LineApiClient


class NotificationService:
    @staticmethod
    def send_message_admin(message: str) -> None:
        client = LineApiClient()
        client.send_text_message(LineApiClient.get_admin_userid(), message=message)
