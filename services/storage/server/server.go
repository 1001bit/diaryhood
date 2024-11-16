package server

import (
	"log/slog"
	"net/http"
)

type Server struct {
}

func New() *Server {
	return &Server{}
}

func (s *Server) ListenAndServe(port string) error {
	addr := ":" + port
	slog.With("addr", addr).Info("Listening")

	return http.ListenAndServe(addr, s.newRouter())
}
