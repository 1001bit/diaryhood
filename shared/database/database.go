package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"time"

	_ "github.com/lib/pq"
)

const (
	reconnectTime = 10 * time.Second
)

var ErrNoConn = errors.New("no database connection")

type Config struct {
	User string
	Pass string
	Host string
	Port string
	Name string
}

type Conn struct {
	cfg Config
	db  *sql.DB
}

func NewConn(cfg Config) *Conn {
	return &Conn{
		cfg: cfg,

		db: nil,
	}
}

func (c *Conn) Connect() {
	connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", c.cfg.Host, c.cfg.User, c.cfg.Pass, c.cfg.Name, c.cfg.Port)
	var err error

	for {
		c.db, err = sql.Open("postgres", connStr)
		if err != nil {
			slog.
				With("err", err).
				With("host", c.cfg.Host).
				With("port", c.cfg.Port).
				Error("Failed to connect to PostgreSQL. Retrying")
			time.Sleep(reconnectTime)
			continue
		}
		slog.Info("connected to postgreSQL. Monitoring connection")
		go c.monitorConnection()
		return
	}
}

func (c *Conn) monitorConnection() {
	for {
		time.Sleep(reconnectTime)
		if err := c.db.Ping(); err != nil {
			slog.With("err", err).Warn("Connection to PostgreSQL lost. Attempting reconnection")
			c.db.Close()
			c.Connect()
			return
		}
	}
}

func (c *Conn) Close() {
	c.db.Close()
}

func (c *Conn) QueryRowContext(ctx context.Context, query string, args ...interface{}) (*sql.Row, error) {
	if c.db == nil {
		return nil, ErrNoConn
	}
	return c.db.QueryRowContext(ctx, query, args...), nil
}
