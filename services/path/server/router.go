package server

import (
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type PathStore interface {
}

func newRouter(pathstore PathStore) *chi.Mux {
	r := chi.NewRouter()
	// Middleware
	r.Use(middleware.Timeout(time.Second * 10))
	r.Use(middleware.CleanPath)
	r.Use(middleware.Recoverer)

	return r
}
