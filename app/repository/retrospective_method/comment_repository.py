from sqlalchemy.orm import Session

from app.models.retrospective_method.comment_model import CommentModel



class CommentRepository:
    def __init__(self, db: Session):
        self.__db: Session = db

    def save(self, comment: CommentModel) -> None:
        self.__db.add(comment)

        # TODO:その他のエラーの場合のエラーハンドリング。
        # 5xxを返したいね。
        self.__db.commit()

        self.__db.refresh(comment)
