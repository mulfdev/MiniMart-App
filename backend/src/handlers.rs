use self::custom_scalars::{BigInt, Bytes};
use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use graphql_client::{GraphQLQuery, Response};
use reqwest;
use serde::Serialize;
use sqlx::sqlite::SqlitePool;

pub mod custom_scalars {
    pub type Bytes = String;
    pub type BigInt = String;
}

#[derive(Serialize)]
pub struct User {
    id: i64,
    username: String,
}

#[derive(Debug)]
pub enum ApiError {
    NotFound(&'static str),
    Internal(&'static str),
}

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "queries/schema.graphql",
    query_path = "queries/get_orders.graphql",
    response_derives = "Debug,Serialize,PartialEq",
    scalar_modules = "crate::handlers::custom_scalars",
    variables_derives = "Deserialize"
)]
pub struct GetOrderListeds;

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

pub async fn get_orders(
    Query(vars): Query<get_order_listeds::Variables>,
) -> Result<(StatusCode, Json<get_order_listeds::ResponseData>), ApiError> {
    let req_body = GetOrderListeds::build_query(vars);

    let client = reqwest::Client::new();
    let res = client
        .post("https://api.studio.thegraph.com/query/29786/minimart/version/latest")
        .json(&req_body)
        .send()
        .await
        .map_err(|_| ApiError::Internal("Could not get graph data"))?;

    let res_body: Response<get_order_listeds::ResponseData> = res
        .json()
        .await
        .map_err(|_| ApiError::Internal("Could not fetch order data"))?;

    if let Some(errors) = res_body.errors {
        eprint!("GraphQL errors: {:?}", errors);
        return Err(ApiError::Internal(
            "There were errors in the graphql response",
        ));
    }

    let data = res_body.data.ok_or(ApiError::NotFound("No data"))?;

    println!("{:?}", data);

    Ok((StatusCode::OK, Json(data)))
}
