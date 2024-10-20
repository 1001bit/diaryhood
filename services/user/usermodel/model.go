package usermodel

import (
	"context"
	"database/sql"
)

type Profile struct {
	Name string
	Date string
}

type Credentials struct {
	Name  string
	Email string
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

func (us *UserStore) GetCredentials(ctx context.Context, login string) (*Credentials, error) {
	creds := &Credentials{}

	err := us.db.QueryRowContext(
		ctx,
		"SELECT name, email FROM users WHERE LOWER(name) = LOWER($1) OR LOWER(email) = LOWER($1)",
		login,
	).Scan(&creds.Name, &creds.Email)

	if err != nil {
		return nil, err
	}

	return creds, nil
}

func (us *UserStore) GetNameAndIdByEmail(ctx context.Context, email string) (string, string, error) {
	name := ""
	id := ""

	err := us.db.QueryRowContext(
		ctx,
		`
		INSERT INTO users (email)
		VALUES ($1)
		ON CONFLICT (email)
		DO UPDATE SET email = users.email
		RETURNING name, id;
		`,
		email,
	).Scan(&name, &id)

	return name, id, err
}

func (us *UserStore) GetNameByID(ctx context.Context, id string) (string, error) {
	name := ""

	err := us.db.QueryRowContext(
		ctx,
		"SELECT name FROM users WHERE id = $1",
		id,
	).Scan(&name)

	return name, err
}
