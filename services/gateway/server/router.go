package server

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/1001bit/pathgoer/services/gateway/server/handler"
	"github.com/1001bit/pathgoer/services/gateway/server/middleware"
	"github.com/1001bit/pathgoer/services/gateway/template"
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"
	slogchi "github.com/samber/slog-chi"
)

type HttpProxy interface {
	ReverseProxy(stripPrefix string) http.HandlerFunc
}

type UserServiceClient interface {
	HandleProfile(w http.ResponseWriter, r *http.Request)
	HandleLogout(w http.ResponseWriter, r *http.Request)
	HandleRefresh(w http.ResponseWriter, r *http.Request)
	HandleLoginEmail(w http.ResponseWriter, r *http.Request)
	HandleLoginOtp(w http.ResponseWriter, r *http.Request)
	HandleChangeUsername(w http.ResponseWriter, r *http.Request)
}

func newRouter(userclient UserServiceClient, storageProxy, pathProxy HttpProxy) *chi.Mux {
	// Router
	r := chi.NewRouter()

	// Middleware
	// Logging
	r.Use(chimw.RealIP)
	r.Use(slogchi.New(slog.Default()))
	// Recovery
	r.Use(chimw.Recoverer)
	// Limits
	r.Use(chimw.Timeout(time.Second * 10))
	r.Use(httprate.LimitByIP(100, time.Minute))
	// Path cleaning
	r.Use(chimw.RedirectSlashes)
	r.Use(chimw.CleanPath)

	// Routes
	// With JWT claims in context
	r.Group(func(r chi.Router) {
		r.Use(middleware.JwtClaimsToContext)

		// Home
		r.Get("/", handler.HandleHome)
		// Login page
		r.Get("/login", handler.LoginPageHandler)
		// Pseudo Profile
		r.Get("/user", handler.HandleIDlessProfile)
		// Profile
		r.Get("/user/{name}", userclient.HandleProfile)
	})

	// Json API
	r.Route("/api", func(r chi.Router) {
		// Login
		r.Post("/login/email", userclient.HandleLoginEmail)
		r.Post("/login/otp", userclient.HandleLoginOtp)

		// Change username
		r.Post("/change-name", middleware.JwtClaimsToContext(http.HandlerFunc(userclient.HandleChangeUsername)).ServeHTTP)

		// Path
		r.Handle("/path", middleware.JwtToHeader(pathProxy.ReverseProxy("/api/path")))
		r.Handle("/path/*", middleware.JwtToHeader(pathProxy.ReverseProxy("/api/path")))
	})

	// Routes that get refresh token
	r.Route("/auth", func(r chi.Router) {
		// Refresh
		r.Get("/refresh", userclient.HandleRefresh)
		// Logout
		r.Get("/logout", userclient.HandleLogout)
	})

	// Storage
	r.Get("/storage/*", storageProxy.ReverseProxy("/storage"))
	r.Get("/favicon.ico", storageProxy.ReverseProxy("").ServeHTTP)

	// 404
	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		template.ErrorNotFound().Render(r.Context(), w)
		w.WriteHeader(http.StatusNotFound)
	})

	return r
}
