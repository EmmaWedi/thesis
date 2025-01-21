use actix_web::{HttpResponse, http::StatusCode};
use serde_json::{json, Value};

pub struct ApiResponse {
    pub code: u16,
    pub status: bool,
    pub message: String,
    pub data: Value,
}

impl ApiResponse {
    pub fn new(&self) -> HttpResponse {
        HttpResponse::build(StatusCode::from_u16(self.code).unwrap())
            .json(json!({
                "status": self.status,
                "message": self.message,
                "data": self.data,
            }))
    }
}