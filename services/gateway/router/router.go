package router

import (
	"net/http"
	"os"
	"time"

	"github.com/1001bit/pathgoer/services/gateway/authpb"
	"github.com/1001bit/pathgoer/services/gateway/router/handler"
	"github.com/1001bit/pathgoer/services/gateway/router/middleware"
	"github.com/1001bit/pathgoer/services/gateway/storageclient"
	"github.com/1001bit/pathgoer/services/gateway/template"
	"github.com/1001bit/pathgoer/services/gateway/userpb"
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"
)

func New(userclient userpb.UserServiceClient, authclient authpb.AuthServiceClient) *chi.Mux {
	// Router
	r := chi.NewRouter()

	// Middleware
	// Logging
	r.Use(chimw.RealIP)
	r.Use(chimw.Logger)
	// Recovery
	r.Use(chimw.Recoverer)
	// Limits
	r.Use(chimw.Timeout(time.Second * 10))
	r.Use(httprate.LimitByIP(100, time.Minute))
	// Path cleaning
	r.Use(chimw.RedirectSlashes)
	r.Use(chimw.CleanPath)

	// Paths
	r.Group(func(r chi.Router) {
		r.Use(middleware.InjectJwtClaims)

		// Home
		r.Get("/", handler.HandleHome)
		// Pseudo Profile
		r.Get("/profile", handler.HandleIdlessProfile)
		// Login page
		r.Get("/login", handler.LoginPageHandler)
	})

	// Profile
	r.Get("/profile/{name}", handler.ProfileHandler(userclient))

	// Login API
	r.Post("/login/email", handler.LoginEmailHandler(authclient))
	r.Post("/login/otp", handler.LoginOTPHandler(authclient))
	// Refresh
	r.Get("/auth/refresh", handler.RefreshHandler(authclient))

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
