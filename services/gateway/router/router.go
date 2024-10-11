package router

import (
	"net/http"
	"os"
	"time"

	"github.com/1001bit/pathgoer/services/gateway/storageclient"
	"github.com/1001bit/pathgoer/services/gateway/template"
	"github.com/1001bit/pathgoer/services/gateway/userclient"
	"github.com/a-h/templ"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"
)

func New(userclient *userclient.Client) *chi.Mux {
	// Router
	r := chi.NewRouter()

	// Middleware
	// Logging
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	// Recovery
	r.Use(middleware.Recoverer)
	// Limits
	r.Use(middleware.Timeout(time.Second * 10))
	r.Use(httprate.LimitByIP(100, time.Minute))
	// Path cleaning
	r.Use(middleware.RedirectSlashes)
	r.Use(middleware.CleanPath)

	// Paths
	// Home
	r.Get("/", templ.Handler(template.Home()).ServeHTTP)

	// Profile
	r.Get("/profile/{name}", ProfileHandler(userclient))

	// Storage
	storageClient := storageclient.MustNew(os.Getenv("STORAGE_HOST"), os.Getenv("PORT"))
	r.Get("/storage/*", http.StripPrefix("/storage", storageClient.ReverseProxy()).ServeHTTP)
	r.Get("/favicon.ico", storageClient.ReverseProxy())

	// 404
	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		template.ErrorNotFound().Render(r.Context(), w)
		w.WriteHeader(http.StatusNotFound)
	})

	return r
}
