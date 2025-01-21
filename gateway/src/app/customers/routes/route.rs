use actix_web::web;

use crate::app::customers::controller::controller::test_customer;

pub fn route(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1/customers")
        .route("/test", web::post().to(test_customer))
    );
}