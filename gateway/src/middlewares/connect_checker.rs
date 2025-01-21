use actix_http::Payload;
use actix_web::body::{BoxBody, MessageBody};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::middleware::Next;
use actix_web::web::Bytes;
use actix_web::{Error, HttpResponse};
use futures_util::stream;
use reqwest::Client;
use std::pin::Pin;

pub async fn req_detection(
    mut req: ServiceRequest,
    next: Next<impl MessageBody + 'static>,
) -> Result<ServiceResponse<BoxBody>, Error> {
    let client = Client::new();
    let detect_url = "http://127.0.0.1:8000/detect/";

    let body_bytes = req.extract::<Bytes>().await.map_err(|err| {
        actix_web::error::ErrorInternalServerError(format!(
            "Failed to extract request body: {}",
            err
        ))
    })?;

    let response = client
        .post(detect_url)
        .body(body_bytes.clone())
        .send()
        .await;

    match response {
        Ok(resp) => {
            if resp.status().is_success() {
                let payload_stream = stream::once(async move {
                    Ok::<Bytes, actix_web::error::PayloadError>(body_bytes.clone())
                });
                let pinned_stream: Pin<
                    Box<
                        dyn futures_util::Stream<
                            Item = Result<Bytes, actix_web::error::PayloadError>,
                        >,
                    >,
                > = Box::pin(payload_stream);
                req.set_payload(Payload::from(pinned_stream));
                let next_response = next.call(req).await?;
                Ok(next_response.map_into_boxed_body())
            } else {
                Ok(req.into_response(
                    HttpResponse::Forbidden()
                        .body("Blocked: SQL Injection detected")
                        .map_into_boxed_body(),
                ))
            }
        }
        Err(_) => Ok(req.into_response(
            HttpResponse::InternalServerError()
                .body("Error contacting detection engine")
                .map_into_boxed_body(),
        )),
    }
}
