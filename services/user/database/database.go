package database

import (
	"database/sql"
	"fmt"
	"log/slog"

	_ "github.com/lib/pq"
)

type Config struct {
	User string
	Name string
	Pass string
	Host string
	Port string
}

func NewFromEnv(cfg Config) (*sql.DB, error) {
	connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", cfg.Host, cfg.User, cfg.Pass, cfg.Name, cfg.Port)
	slog.
		With("host", cfg.Host).
		With("port", cfg.Port).
		With("dbname", cfg.Name).
		With("user", cfg.User).
		Info("connecting to postgreSQL")

	return sql.Open("postgres", connStr)
}
