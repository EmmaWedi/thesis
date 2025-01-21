use std::pin::Pin;

use actix_web::body::MessageBody;
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::middleware::Next;
use actix_web::{Error, HttpMessage};
use chrono::Utc;
use sea_orm::{DatabaseConnection, EntityTrait, Set};
use serde_json::Value;
use futures_util::stream;
use actix_http::Payload;
use actix_web::web::Bytes;

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

    let body_value: Value = serde_json::from_str(&body).unwrap_or_else(|_| Value::String(body.clone()));

    let data = entity::request::ActiveModel {
        ip: Set(ip),
        body: Set(body_value),
        status: Set("pending".to_string()),
        created_at: Set(Utc::now().with_timezone(&chrono::FixedOffset::east_opt(0).unwrap())),
        updated_at: Set(Utc::now().with_timezone(&chrono::FixedOffset::east_opt(0).unwrap())),
        ..Default::default()
    };

    let save_req = entity::request::Entity::insert(data)
        .exec(&db)
        .await
        .map_err(|err| {
            actix_web::error::ErrorInternalServerError(format!(
                "Failed to save request to database: {}",
                err
            ))
        })?;

    req.extensions_mut().insert(save_req.last_insert_id);

    let payload_stream = stream::once(async move {
        Ok::<Bytes, actix_web::error::PayloadError>(Bytes::from(body))
    });
    let pinned_stream: Pin<
        Box<
            dyn futures_util::Stream<
                Item = Result<Bytes, actix_web::error::PayloadError>,
            >,
        >,
    > = Box::pin(payload_stream);
    req.set_payload(Payload::from(pinned_stream));

    next.call(req).await
}
