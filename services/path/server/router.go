package server

import (
	"net/http"
	"time"

	"github.com/1001bit/pathgoer/services/path/server/middleware"
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
)

type PathStore interface {
}

func newRouter(pathstore PathStore) *chi.Mux {
	r := chi.NewRouter()
	// Middleware
	r.Use(chimw.Timeout(time.Second * 10))
	r.Use(chimw.CleanPath)
	r.Use(chimw.Recoverer)

	r.Group(func(r chi.Router) {
		r.Use(middleware.JwtClaimsToContext)

		r.Get("/test", func(w http.ResponseWriter, r *http.Request) {
			username, _ := middleware.GetUsernameFromContext(r.Context())
			w.Write([]byte("hello, " + username))
		})
	})

	return r
}
