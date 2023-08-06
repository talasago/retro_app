from app.helpers.password_helper import PasswordHelper as sut


class TestPasswordHelper:
    def test_generate_hashed_password(self):
        plain_password: str = 'Passw0rd#123'
        hashed_pw: str = sut.generate_hashed_password(plain_password)

        assert plain_password != hashed_pw

    def test_is_password_matching(self):
        plain_password: str = 'Passw0rd#123'
        hashed_pw: str = sut.generate_hashed_password(plain_password)

        # FIXME:ほんとは1メソッド1assertの方が良い。どこのテスト仕様でNGになったかが分かりやすくなるから
        assert sut.is_password_matching(
            plain_pw=plain_password, hashed_pw=hashed_pw)
        assert sut.is_password_matching(
            plain_pw='unmatching_password', hashed_pw=hashed_pw) is False

    # TODO:引数がstrじゃない時のテストを追加したい。その時はエラーにしたい。passlib側で実装されてるかもだが。
    # TestPasswordHelperのバリデーションはpydantic使った方が楽なのだろうか？
