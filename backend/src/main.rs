use axum::{Json, Router, extract::State, http::StatusCode, routing::get};
use serde::Serialize;
use sqlx::sqlite::SqlitePool;
use std::{env, error::Error};

#[derive(Serialize)]
struct User {
    id: i64,
    username: String,
}

#[derive(Serialize)]
struct ErrorMessage {
    message: String,
}

#[derive(Serialize)]
enum ApiResponse {
    User(User),
    Error(ErrorMessage),
}

type SharedPool = SqlitePool;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenvy::dotenv()?;
    let pool = SqlitePool::connect(&env::var("DATABASE_URL")?).await?;

    println!("Server running");
    let app = Router::new().route("/", get(root)).with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
    Ok(())
}

async fn root(State(pool): State<SharedPool>) -> (StatusCode, Json<ApiResponse>) {
    let user_info = sqlx::query_as!(
        User,
        "SELECT id,name AS username from users where id = ?",
        7
    )
    .fetch_optional(&pool)
    .await;

    let found_user = match user_info {
        Ok(Some(user)) => user,

        Ok(None) => {
            return (
                StatusCode::NOT_FOUND,
                Json(ApiResponse::Error(ErrorMessage {
                    message: format!("User with ID {} not found", 1),
                })),
            );
        }
        Err(e) => {
            println!("{}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::Error(ErrorMessage {
                    message: "Internal error occured".to_string(),
                })),
            );
        }
    };

    (StatusCode::OK, Json(ApiResponse::User(found_user)))
}
