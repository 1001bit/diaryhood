package router

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

const storagePath = "./storage"

func New() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Timeout(time.Second * 10))
	r.Use(middleware.CleanPath)

	fileServer := http.FileServer(http.Dir(storagePath))
	r.Get("/*", fileServer.ServeHTTP)

	return r
}
