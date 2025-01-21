use std::fmt::{Display, Formatter, Result as FmtResult};
use actix_http::StatusCode;
use actix_web::{dev, http, middleware::ErrorHandlerResponse, HttpResponse, ResponseError, Result};
use serde_json::{json, to_string_pretty};
use serde::Serialize;
use actix_http::body::{EitherBody, BoxBody};

#[derive(Debug, Serialize)]
pub struct Error {
    pub message: String,
    pub code: u32,
    pub status: u16,
}

impl Display for Error {
    fn fmt(&self, f: &mut Formatter) -> FmtResult {
        write!(f, "{}", to_string_pretty(self).unwrap())
    }
}

impl ResponseError for Error {
    fn error_response(&self) -> HttpResponse {
        let err_json = json!({ "code": self.code, "message": self.message });
        HttpResponse::build(StatusCode::from_u16(self.status).unwrap()).json(err_json)
    }
}

pub fn new_error(code: u32, message: &str, status: u16) -> Error {
    Error {
        message: message.to_string(),
        code,
        status,
    }
}

pub fn render_404<B>(mut res: dev::ServiceResponse<B>) -> Result<ErrorHandlerResponse<BoxBody>> {
    res.response_mut().headers_mut().insert(
        http::header::CONTENT_TYPE,
        http::header::HeaderValue::from_static("application/json"),
    );

    let new_res = res.map_body(|_, _| {
        EitherBody::left(BoxBody::new("{\"code\": 404, \"message\": \"Not Found\", \"status\": 2002 }"))
    });
    Ok(ErrorHandlerResponse::Response(new_res))
}

pub fn render_405<B>(mut res: dev::ServiceResponse<B>) -> Result<ErrorHandlerResponse<BoxBody>> {
    res.response_mut().headers_mut().insert(
        http::header::CONTENT_TYPE,
        http::header::HeaderValue::from_static("application/json"),
    );

    let new_res = res.map_body(|_, _| {
        EitherBody::left(BoxBody::new("{\"code\": 405, \"message\": \"Method Not Allowed\", \"status\": 2002}"))
    });
    Ok(ErrorHandlerResponse::Response(new_res))
}

pub fn render_500<B>(mut res: dev::ServiceResponse<B>) -> Result<ErrorHandlerResponse<BoxBody>> {
    res.response_mut().headers_mut().insert(
        http::header::CONTENT_TYPE,
        http::header::HeaderValue::from_static("application/json"),
    );

    let new_res = res.map_body(|_, _| {
        EitherBody::left(BoxBody::new("{\"code\": 500, \"message\": \"Internal Server Error\", \"status\": 2002}"))
    });
    Ok(ErrorHandlerResponse::Response(new_res))
}

pub fn render_400<B>(mut res: dev::ServiceResponse<B>) -> Result<ErrorHandlerResponse<BoxBody>> {
    res.response_mut().headers_mut().insert(
        http::header::CONTENT_TYPE,
        http::header::HeaderValue::from_static("application/json"),
    );

    let new_res = res.map_body(|_, _| {
        EitherBody::left(BoxBody::new("{\"code\": 400, \"message\": \"Bad Request\", \"status\": 2002}"))
    });
    Ok(ErrorHandlerResponse::Response(new_res))
}