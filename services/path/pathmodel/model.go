package pathmodel

import (
	"errors"

	"github.com/1001bit/pathgoer/services/path/shared/postgresclient"
)

var ErrNoDB = errors.New("no database connection")

type PathStore struct {
	postgresC *postgresclient.Client
}

func NewPathStore(postgresC *postgresclient.Client) *PathStore {
	return &PathStore{
		postgresC: postgresC,
	}
}
