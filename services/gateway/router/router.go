package router

import (
	"net/http"
	"os"
	"time"

	"github.com/1001bit/pathgoer/services/gateway/storageclient"
	"github.com/1001bit/pathgoer/services/gateway/template"
	"github.com/a-h/templ"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func New() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(time.Second * 10))
	r.Use(middleware.RedirectSlashes)
	r.Use(middleware.CleanPath)

	// Home
	r.Get("/", templ.Handler(template.Home()).ServeHTTP)

	// Storage
	storageClient := storageclient.MustNew(os.Getenv("STORAGE_HOST"), os.Getenv("STORAGE_PORT"))
	r.Get("/storage/*", http.StripPrefix("/storage", storageClient.ReverseProxy()).ServeHTTP)
	r.Get("/favicon.ico", storageClient.ReverseProxy())

	return r
}
