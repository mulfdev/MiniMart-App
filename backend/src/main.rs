use axum::{Router, routing::get};
use sqlx::sqlite::SqlitePool;
use std::{env, error::Error};

mod handlers;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenvy::dotenv()?;
    let pool = SqlitePool::connect(&env::var("DATABASE_URL")?).await?;

    println!("Server running");
    let app = Router::new()
        .route("/", get(handlers::root))
        .route("/orders", get(handlers::get_orders))
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
    Ok(())
}
