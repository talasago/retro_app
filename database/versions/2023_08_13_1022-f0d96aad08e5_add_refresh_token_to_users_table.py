"""Add refresh_token to users table

Revision ID: f0d96aad08e5
Revises: 2cea9d18d89f
Create Date: 2023-08-13 10:22:08.786330+09:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f0d96aad08e5'
down_revision = '2cea9d18d89f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('refresh_token', sa.VARCHAR(), autoincrement=False, nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'refresh_token')
