use dotenvy::dotenv;
use sqlx::SqlitePool;
use std::{env, error::Error};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set for SQLite (e.g., 'sqlite://sqlite.db')");

    let pool = SqlitePool::connect(&database_url).await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY, -- Changed from SERIAL
            name VARCHAR(255) NOT NULL -- Removed trailing comma here
        )
    "#,
    )
    .execute(&pool)
    .await?;
    println!("'users' table ensured.");

    // --- 2. Seed 25 sequential users ---
    println!("Starting to seed 25 users...");
    let mut total_inserted_rows = 0;

    for i in 1..=25 {
        let user_name = format!("User {}", i); // Generates "User 1", "User 2", etc.

        // Insert the user. SQLite will automatically assign the next available ID.
        let result = sqlx::query(r#"INSERT INTO users (name) VALUES ($1)"#)
            .bind(&user_name) // Bind the name
            .execute(&pool)
            .await?; // The `?` will propagate any error, stopping the seeding process

        total_inserted_rows += result.rows_affected();
    }

    println!("Successfully inserted {} new users.", total_inserted_rows);
    println!("Database seeding completed successfully!");
    Ok(())
}
