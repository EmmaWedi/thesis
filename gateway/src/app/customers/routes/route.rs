use actix_web::web;

use crate::app::customers::controller::controller::login;

pub fn route(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1/customers")
        .route("/login", web::post().to(login))
    );
}