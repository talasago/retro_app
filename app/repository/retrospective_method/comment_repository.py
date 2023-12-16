from sqlalchemy.orm import Session

from app.models.retrospective_method.comment_model import CommentModel


class CommentRepository:
    def __init__(self, db: Session):
        self.__db: Session = db

    def save(self, comment: CommentModel) -> None:
        self.__db.add(comment)

        try:
            self.__db.commit()
        except Exception as e:
            self.__db.rollback()
            raise e

        self.__db.refresh(comment)
