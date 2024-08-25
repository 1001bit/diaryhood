package router

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
)

func NewRouter() (http.Handler, error) {
	// Base
	router := chi.NewRouter()
	router.Use(chimw.Logger)
	router.Use(chimw.RedirectSlashes)

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("<h1>yo hello</h1>"))
	})

	return router, nil
}
