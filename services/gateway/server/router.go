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

func (s *Server) newRouter() *chi.Mux {
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
	// Path
	r.Get("/path/{id}", handler.HandlePath)
	// Profile
	r.Get("/user/{id}", s.userclient.HandleProfile)

	// With JWT claims in context
	r.Group(func(r chi.Router) {
		r.Use(middleware.CookieJwtClaimsToContext)

		// Home
		r.Get("/", handler.HandleHome)
		// Login page
		r.Get("/login", handler.LoginPageHandler)
		// Pseudo Profile
		r.Get("/user", handler.HandleIDlessProfile)
		// Check if authenticated
		r.Get("/authenticated", handler.HandleAuthenticated)
	})

	// Json API
	r.Route("/api", func(r chi.Router) {
		// Login
		r.Post("/login/email", s.userclient.HandleLoginEmail)
		r.Post("/login/otp", s.userclient.HandleLoginOtp)

		// Change username
		r.Post("/change-name", middleware.CookieJwtClaimsToContext(http.HandlerFunc(s.userclient.HandleChangeUsername)).ServeHTTP)

		// Path
		r.Handle("/path", s.pathproxy.ReverseProxy("/api/path"))
		r.Handle("/path/*", s.pathproxy.ReverseProxy("/api/path"))
	})

	// Routes that get refresh token
	r.Route("/auth", func(r chi.Router) {
		r.Use(middleware.CookieJwtClaimsToContext)

		// Refresh
		r.Get("/refresh", s.userclient.HandleRefresh)
		// Logout
		r.Get("/logout", s.userclient.HandleLogout)
	})

	// Storage
	r.Get("/static/*", s.storageproxy.ReverseProxy(""))
	r.Handle("/dynamic/*", s.storageproxy.ReverseProxy(""))
	r.Get("/favicon.ico", s.storageproxy.ReverseProxy(""))

	// 404
	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		template.ErrorNotFound().Render(r.Context(), w)
		w.WriteHeader(http.StatusNotFound)
	})

	return r
}
