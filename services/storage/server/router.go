package server

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

const storagePath = "./storage"

func CacheMiddleware(dur time.Duration) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Cache-Control", fmt.Sprintf("public, max-age=%d", int(dur.Seconds()))) // Cache for one day
			next.ServeHTTP(w, r)
		})
	}
}

func (s *Server) newRouter() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Timeout(time.Second * 10))
	r.Use(middleware.CleanPath)
	r.Use(middleware.Recoverer)

	fileServer := http.FileServer(http.Dir(storagePath))
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
		CacheMiddleware(time.Hour*24)(fileServer).ServeHTTP(w, r)
	})

	return r
}
