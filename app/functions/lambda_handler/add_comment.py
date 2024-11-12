from app.functions.dependencies import get_db
from app.models.retrospective_method.comment_model import CommentModel
from app.repository.retrospective_method.comment_repository import CommentRepository
from app.schemas.retrospective_method.comment_schema import CommentSchema


def lambda_handler(event, _context, db=get_db()):
    print(f"Received data: {event}")
    comment = CommentSchema(**event)
    comment_repo = CommentRepository(db)

    comment_repo.save(CommentModel(**comment.model_dump()))
