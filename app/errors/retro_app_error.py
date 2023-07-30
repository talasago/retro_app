class RetroAppBaseError(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class RetroAppColmunUniqueError(RetroAppBaseError):
    def __init__(self, display_name: str):
        message: str = f'指定された{display_name}はすでに登録されています。'
        super().__init__(message)
        self.message = message

# TODO:HTTPステータスコードを含めたエラークラスを作ってもいいのでは。
