use axum::{Json, extract::State, http::StatusCode};
use serde::Serialize;
use sqlx::sqlite::SqlitePool;

#[derive(Serialize)]
pub struct User {
    id: i64,
    username: String,
}

#[derive(Serialize)]
pub struct ErrorMessage {
    message: String,
}

#[derive(Serialize)]
pub enum ApiResponse {
    User(User),
    Error(ErrorMessage),
}
pub type SharedPool = SqlitePool;

pub async fn root(State(pool): State<SharedPool>) -> (StatusCode, Json<ApiResponse>) {
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
