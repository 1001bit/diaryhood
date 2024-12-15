package server

import (
	"net/http"
	"time"

	"github.com/1001bit/pathgoer/services/storage/server/handler"
	"github.com/1001bit/pathgoer/services/storage/server/middleware"
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
)

const storagePath = "./storage"

func (s *Server) newRouter() *chi.Mux {
	r := chi.NewRouter()
	r.Use(chimw.Timeout(time.Second * 10))
	r.Use(chimw.CleanPath)
	r.Use(chimw.Recoverer)

	fileServer := http.FileServer(http.Dir(storagePath))

	r.Group(func(r chi.Router) {
		r.Use(middleware.JwtClaimsToContext)
		r.Post("/dynamic/avatar", handler.UploadAvatar)
	})

	r.Get("/static/*", func(w http.ResponseWriter, r *http.Request) {
		// Serve file with caching
		cacheTime := time.Hour * 24
		middleware.Cache(cacheTime)(fileServer).ServeHTTP(w, r)
	})

	r.Get("/dynamic/*", func(w http.ResponseWriter, r *http.Request) {
		// Serve file without caching
		w.Header().Set("Cache-Control", "public, max-age=0")
		fileServer.ServeHTTP(w, r)
	})

	return r
}
