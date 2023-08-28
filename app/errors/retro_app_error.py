class RetroAppBaseError(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class RetroAppColmunUniqueError(RetroAppBaseError):
    def __init__(self, display_name: str):
        message: str = f'指定された{display_name}はすでに登録されています。'
        super().__init__(message)
        self.message = message


class RetroAppValueError(RetroAppBaseError):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class RetroAppRecordNotFoundError(RetroAppBaseError):
    def __init__(self, model_name: str):
        message: str = '条件に合致するレコードは存在しません。'
        super().__init__(message)
        self.message = message
        self.model_name = model_name


class RetroAppAuthenticationError(RetroAppBaseError):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


# TODO:HTTPステータスコードを含めたエラークラスを作ってもいいのでは。
