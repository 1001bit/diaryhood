package pathmodel

import (
	"github.com/1001bit/pathgoer/services/path/shared/postgresclient"
)

type PathStore struct {
	postgresC *postgresclient.Client
}

func NewPathStore(postgresC *postgresclient.Client) *PathStore {
	return &PathStore{
		postgresC: postgresC,
	}
}
