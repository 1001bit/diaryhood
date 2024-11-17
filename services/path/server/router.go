package server

import (
	"time"

	"github.com/1001bit/pathgoer/services/path/server/handler"
	"github.com/1001bit/pathgoer/services/path/server/middleware"
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
)

func (s *Server) newRouter() *chi.Mux {
	r := chi.NewRouter()
	// Middleware
	r.Use(chimw.Timeout(time.Second * 10))
	r.Use(chimw.CleanPath)
	r.Use(chimw.Recoverer)

	handler := handler.New(s.pathstore)

	r.Group(func(r chi.Router) {
		r.Use(middleware.JwtClaimsToContext)

		r.Post("/", handler.HandleCreatePath)
		r.Get("/user/{id}", handler.HandleUserPaths)
	})

	return r
}
