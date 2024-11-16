package server

import (
	"log/slog"
	"net/http"

	"github.com/1001bit/pathgoer/services/path/server/handler"
	"github.com/go-chi/chi/v5"
)

type Server struct {
	mux *chi.Mux
}

func New(pathstore handler.PathStore) *Server {
	return &Server{
		mux: newRouter(pathstore),
	}
}

func (s *Server) ListenAndServe(port string) error {
	addr := ":" + port
	slog.With("addr", addr).Info("Listening")

	return http.ListenAndServe(addr, s.mux)
}
