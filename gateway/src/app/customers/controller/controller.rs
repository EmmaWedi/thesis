use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Customer {
   statement: String,
}

pub async fn login(payload: web::Json<Customer>) -> HttpResponse {
    HttpResponse::Ok().json(payload.into_inner())
}