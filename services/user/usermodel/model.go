package usermodel

import (
	"context"
	"errors"

	"github.com/1001bit/pathgoer/services/user/shared/database"
)

var ErrNoDB = errors.New("no database connection")

type Profile struct {
	Name string
	Date string
}

type UserStore struct {
	dbConn *database.Conn
}

func NewUserStore(dbConn *database.Conn) *UserStore {
	return &UserStore{
		dbConn: dbConn,
	}
}

func (us *UserStore) GetProfile(ctx context.Context, name string) (*Profile, error) {
	profile := &Profile{}

	row, err := us.dbConn.QueryRowContext(ctx, "SELECT name, date FROM users WHERE LOWER(name) = LOWER($1)", name)
	if err != nil {
		return nil, err
	}

	err = row.Scan(&profile.Name, &profile.Date)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (us *UserStore) GetNameAndEmail(ctx context.Context, login string) (string, string, error) {
	var name, email string

	row, err := us.dbConn.QueryRowContext(ctx, "SELECT name, email FROM users WHERE LOWER(name) = LOWER($1) OR LOWER(email) = LOWER($1)", login)
	if err != nil {
		return "", "", err
	}

	err = row.Scan(&name, &email)
	if err != nil {
		return "", "", err
	}

	return name, email, nil
}

func (us *UserStore) GetNameAndIdByEmail(ctx context.Context, email string) (string, string, error) {
	name := ""
	id := ""

	row, err := us.dbConn.QueryRowContext(ctx, "SELECT name, id FROM users WHERE LOWER(email) = LOWER($1)", email)
	if err != nil {
		return "", "", err
	}

	err = row.Scan(&name, &id)
	if err != nil {
		return "", "", err
	}
	return name, id, err
}

func (us *UserStore) CreateUserGetNameAndId(ctx context.Context, email string) (string, string, error) {
	name := ""
	id := ""

	row, err := us.dbConn.QueryRowContext(ctx, "INSERT INTO users (email) VALUES ($1) RETURNING name, id", email)
	if err != nil {
		return "", "", err
	}

	err = row.Scan(&name, &id)
	if err != nil {
		return "", "", err
	}
	return name, id, err
}

func (us *UserStore) GetNameByID(ctx context.Context, id string) (string, error) {
	name := ""

	row, err := us.dbConn.QueryRowContext(ctx, "SELECT name FROM users WHERE id = $1", id)
	if err != nil {
		return "", err
	}

	err = row.Scan(&name)
	if err != nil {
		return "", err
	}

	return name, err
}
