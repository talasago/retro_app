"""Delete email from users table

Revision ID: d8af2ee706ec
Revises: 9e68d6d33c99
Create Date: 2024-07-07 20:55:30.170888

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'd8af2ee706ec'
down_revision = '9e68d6d33c99'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column("users", "email") # noqa: E501


def downgrade() -> None:
    op.add_column(
        "users", sa.Column("email", sa.VARCHAR(), nullable=False, unique=True)
    )  # noqa: E501
