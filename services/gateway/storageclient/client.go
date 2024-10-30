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

func MustNew(host, port string) *Client {
	url, err := url.Parse(fmt.Sprintf("http://%s:%s", host, port))
	if err != nil {
		slog.With("err", err).Error("Failed to parse url")
		panic(err)
	}

	return &Client{
		url: url,
	}
}

func (c *Client) ReverseProxy() http.HandlerFunc {
	return httputil.NewSingleHostReverseProxy(c.url).ServeHTTP
}
