package usermodel

import (
	"context"
	"database/sql"
)

type Profile struct {
	Name string
	Date string
}

type UserStore struct {
	db *sql.DB
}

func NewUserStore(db *sql.DB) *UserStore {
	return &UserStore{
		db: db,
	}
}

func (us *UserStore) GetProfile(ctx context.Context, name string) (*Profile, error) {
	profile := &Profile{}

	err := us.db.QueryRowContext(ctx, "SELECT name, date FROM users WHERE LOWER(name) = LOWER($1)", name).Scan(&profile.Name, &profile.Date)
	if err != nil {
		return nil, err
	}

	return profile, nil
}
