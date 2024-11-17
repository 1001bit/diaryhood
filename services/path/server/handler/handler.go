package handler

import (
	"github.com/1001bit/pathgoer/services/path/pathmodel"
)

type Handler struct {
	pathstore *pathmodel.PathStore
}

func New(pathstore *pathmodel.PathStore) *Handler {
	return &Handler{
		pathstore: pathstore,
	}
}
