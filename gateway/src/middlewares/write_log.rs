use actix_web::body::MessageBody;
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::middleware::Next;
use actix_web::Error;
use chrono::Utc;
use sea_orm::{DatabaseConnection, EntityTrait, Set};
use serde_json::Value;

pub async fn write_logs(
    mut req: ServiceRequest,
    next: Next<impl MessageBody>,
    db: DatabaseConnection,
) -> Result<ServiceResponse<impl MessageBody>, Error> {
    let ip = req
        .connection_info()
        .realip_remote_addr()
        .unwrap_or("Unknown")
        .to_string();
    let body = req.extract::<String>().await.unwrap_or_default();

    let body_value: Value = serde_json::from_str(&body).unwrap_or_else(|_| Value::String(body));

    let new_request = entity::request::ActiveModel {
        ip: Set(ip),
        body: Set(body_value),
        status: Set("pending".to_string()),
        created_at: Set(Utc::now().with_timezone(&chrono::FixedOffset::east_opt(0).unwrap())),
        updated_at: Set(Utc::now().with_timezone(&chrono::FixedOffset::east_opt(0).unwrap())),
        ..Default::default()
    };

    entity::request::Entity::insert(new_request)
        .exec(&db)
        .await
        .map_err(|err| {
            actix_web::error::ErrorInternalServerError(format!(
                "Failed to save request to database: {}",
                err
            ))
        })?;

    next.call(req).await
}
