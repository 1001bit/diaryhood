package server

import (
	"net/http"
	"path/filepath"
	"strings"
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

	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		// Clean and validate the requested file path
		requestedPath := chi.URLParam(r, "*")
		cleanPath := filepath.Clean(requestedPath)
		finalPath := filepath.Join(storagePath, cleanPath)

		// Ensure the final path is within the storage directory
		if !strings.HasPrefix(finalPath, filepath.Clean(storagePath)) {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}

		// Serve file with caching
		cacheTime := time.Hour * 24
		if strings.Split(cleanPath, "/")[0] == "dynamic" {
			cacheTime = time.Minute * 5
		}
		middleware.Cache(cacheTime)(fileServer).ServeHTTP(w, r)
	})

	return r
}
