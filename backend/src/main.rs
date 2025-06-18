use actix_web::{App, HttpResponse, HttpServer, Responder, web};
use serde::Serialize;
use sqlx::SqlitePool;

#[derive(Serialize)]
struct MyJsonResponse {
    status: String,
    message: String,
}

struct AppState {
    app_name: String,
    db: SqlitePool,
}
#[derive(Serialize)]
struct ResponseErr {
    message: String,
}

async fn index(data: web::Data<AppState>) -> impl Responder {
    let _app_name = &data.app_name;

    let ver: Result<String, sqlx::Error> = sqlx::query_scalar("SELECT sqlite_version()")
        .fetch_one(&data.db)
        .await;

    if let Err(e) = ver {
        println!("{:?}", e);
        return HttpResponse::BadRequest().json(ResponseErr {
            message: "Bad response".to_string(),
        });
    }

    return HttpResponse::Ok().json(MyJsonResponse {
        status: "Good".to_string(),
        message: ver.unwrap(),
    });
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("\n 🚀 Starting server at http://127.0.0.1:8080 \n");

    let pool = SqlitePool::connect("sqlite:db.db?mode=rwc")
        .await
        .expect("Failed to create database pool.");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(AppState {
                app_name: String::from("Actix Web"),
                db: pool.clone(),
            }))
            .route("/", web::get().to(index))
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}

