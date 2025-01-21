use actix_web::HttpResponse;

pub async fn test_customer() -> HttpResponse {
    HttpResponse::Ok().body("Received request from customer")
}