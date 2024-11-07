package server

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Server struct {
	mux *chi.Mux
}

func New() *Server {
	return &Server{
		mux: newRouter(),
	}
}

func (s *Server) ListenAndServe(port string) error {
	addr := ":" + port
	slog.With("addr", addr).Info("Listening")

	return http.ListenAndServe(addr, s.mux)
}
