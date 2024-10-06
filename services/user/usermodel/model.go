package usermodel

import (
	"context"
	"database/sql"
)

type User struct {
	ID    string
	Name  string
	Email string
	Date  string
}

type UserStore struct {
	db *sql.DB
}

func NewUserStore(db *sql.DB) *UserStore {
	return &UserStore{
		db: db,
	}
}

func (us *UserStore) GetProfile(ctx context.Context, name string) (*User, error) {
	user := &User{}

	err := us.db.QueryRowContext(ctx, "SELECT name, date FROM users WHERE LOWER(name) = LOWER($1)", name).Scan(&user.Name, &user.Date)
	if err != nil {
		return nil, err
	}

	return user, nil
}
