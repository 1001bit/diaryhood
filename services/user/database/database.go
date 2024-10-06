package database

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

type Config struct {
	User string
	Name string
	Pass string
	Host string
	Port int
}

func NewFromEnv() (*sql.DB, error) {
	config := Config{
		User: os.Getenv("POSTGRES_USER"),
		Name: os.Getenv("POSTGRES_DB"),
		Pass: os.Getenv("POSTGRES_PASSWORD"),
		Host: os.Getenv("POSTGRES_HOST"),
		Port: 5432,
	}

	connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable", config.Host, config.User, config.Pass, config.Name, config.Port)

	return sql.Open("postgres", connStr)
}
