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
    # HACK:認証でどのようなエラーになったか、クラス名から判断できないため変更したい。
    # もともと、認証に関するエラーをすべてまとめられると思っていた。
    # しかし、同じ関数で違う認証に関するエラー(具体的にはトークンの有効期限切れとトークンタイプ不一致)を返すことがあり、
    # すべてまとめられなかった。すべてまとめられると思って実装したときの名残。

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class RetroAppTokenExpiredError(RetroAppBaseError):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


# TODO:HTTPステータスコードを含めたエラークラスを作ってもいいのでは。
