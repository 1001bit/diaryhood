package storageclient

import (
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
)

type Client struct {
	url *url.URL
}

func New(host, port string) (*Client, error) {
	url, err := url.Parse(fmt.Sprintf("http://%s:%s", host, port))
	if err != nil {
		slog.With("err", err).Error("Failed to parse url")
		return nil, err
	}

	return &Client{
		url: url,
	}, nil
}

func (c *Client) ReverseProxy() http.HandlerFunc {
	return httputil.NewSingleHostReverseProxy(c.url).ServeHTTP
}
