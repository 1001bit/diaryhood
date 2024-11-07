package server

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Server struct {
	mux *chi.Mux
}

func New(userclient UserServiceClient, storageproxy HttpProxy, pathProxy HttpProxy) *Server {
	return &Server{
		mux: newRouter(userclient, storageproxy, pathProxy),
	}
}

func (s *Server) ListenAndServe(port string) error {
	addr := ":" + port
	slog.With("addr", addr).Info("Listening")

	return http.ListenAndServe(addr, s.mux)
}
