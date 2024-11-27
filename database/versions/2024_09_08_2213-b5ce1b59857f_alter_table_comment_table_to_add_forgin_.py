"""Alter table comment table to add forgin key and change primary key

Revision ID: b5ce1b59857f
Revises: d8af2ee706ec
Create Date: 2024-09-08 22:13:02.134496

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = 'b5ce1b59857f'
down_revision = 'd8af2ee706ec'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("comments_pkey", "comments", type_="primary")
    op.create_primary_key(
        "comments_pkey", "comments", ["id", "retrospective_method_id", "user_id"]
    )

    op.create_foreign_key(
        constraint_name="fk_user_id",
        source_table="comments",
        referent_table="users",
        local_cols=["user_id"],
        remote_cols=["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint(
        constraint_name="fk_user_id", table_name="comments", type_="foreignkey"
    )

    op.drop_constraint("pk_comments", "comments", type_="primary")
    op.create_primary_key("pk_comments", "comments", ["id"])
