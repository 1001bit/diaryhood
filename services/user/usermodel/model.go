package usermodel

import (
	"context"
	"errors"

	"github.com/1001bit/pathgoer/services/user/shared/postgresclient"
)

var ErrNoDB = errors.New("no database connection")

type Profile struct {
	Name string
	Date string
}

type UserStore struct {
	postgresC *postgresclient.Client
}

func NewUserStore(postrgesC *postgresclient.Client) *UserStore {
	return &UserStore{
		postgresC: postrgesC,
	}
}

func (us *UserStore) GetProfileByName(ctx context.Context, name string) (*Profile, error) {
	profile := &Profile{}

	row, err := us.postgresC.QueryRowContext(ctx, "SELECT name, date FROM users WHERE LOWER(name) = LOWER($1)", name)
	if err != nil {
		return nil, err
	}

	err = row.Scan(&profile.Name, &profile.Date)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (us *UserStore) GetNameAndEmailByLogin(ctx context.Context, login string) (string, string, error) {
	var name, email string

	row, err := us.postgresC.QueryRowContext(ctx, "SELECT name, email FROM users WHERE LOWER(name) = LOWER($1) OR LOWER(email) = LOWER($1)", login)
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

	row, err := us.postgresC.QueryRowContext(ctx, "SELECT name, id FROM users WHERE LOWER(email) = LOWER($1)", email)
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

	row, err := us.postgresC.QueryRowContext(ctx, "INSERT INTO users (email) VALUES ($1) RETURNING name, id", email)
	if err != nil {
		return "", "", err
	}

	err = row.Scan(&name, &id)
	if err != nil {
		return "", "", err
	}
	return name, id, err
}

func (us *UserStore) GetNameById(ctx context.Context, id string) (string, error) {
	name := ""

	row, err := us.postgresC.QueryRowContext(ctx, "SELECT name FROM users WHERE id = $1", id)
	if err != nil {
		return "", err
	}

	err = row.Scan(&name)
	if err != nil {
		return "", err
	}

	return name, err
}

func (us *UserStore) ChangeUsername(ctx context.Context, oldName, newName string) error {
	_, err := us.postgresC.ExecContext(ctx, "UPDATE users SET name = $1 WHERE name = $2", newName, oldName)
	return err
}
