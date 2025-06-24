use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use serde::Serialize;
use sqlx::sqlite::SqlitePool;

#[derive(Serialize)]
pub struct User {
    id: i64,
    username: String,
}

pub enum ApiError {
    NotFound(&'static str),
    Internal(&'static str),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        let (code, msg) = match self {
            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            ApiError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        };
        (code, Json(msg)).into_response()
    }
}

pub async fn root(State(pool): State<SqlitePool>) -> Result<(StatusCode, Json<User>), ApiError> {
    let user_info = sqlx::query_as!(
        User,
        "SELECT id,name AS username from users where id = ?",
        44
    )
    .fetch_optional(&pool)
    .await
    .map_err(|_| ApiError::Internal("Could not complete request"))?
    .ok_or(ApiError::NotFound("User not found"))?;

    Ok((StatusCode::OK, Json(user_info)))
}
