package handler

import "context"

type PathStore interface {
	CreatePath(ctx context.Context, userId, pathName string) (string, error)
}

type Handler struct {
	pathstore PathStore
}

func New(pathstore PathStore) *Handler {
	return &Handler{
		pathstore: pathstore,
	}
}
