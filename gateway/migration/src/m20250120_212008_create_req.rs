use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Request::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Request::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Request::Ip).string().not_null())
                    .col(ColumnDef::new(Request::Body).string().not_null())
                    .col(ColumnDef::new(Request::Label).string().not_null())
                    .col(
                        ColumnDef::new(Request::Status)
                            .string()
                            .not_null()
                            .default(RequestStatus::Pending.as_str()),
                    )
                    .col(
                        ColumnDef::new(Request::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Request::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Request::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Request {
    Table,
    Id,
    Ip,
    Body,
    Label,
    Status,
    CreatedAt,
    UpdatedAt,
}

pub enum RequestStatus {
    Valid,
    Blocked,
    Pending,
}

impl RequestStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            RequestStatus::Valid => "valid",
            RequestStatus::Blocked => "blocked",
            RequestStatus::Pending => "pending",
        }
    }
}
