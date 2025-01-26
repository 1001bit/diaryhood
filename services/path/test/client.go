package test

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"

	"github.com/1001bit/pathgoer/services/path/pathmodel"
	"github.com/1001bit/pathgoer/services/path/server/handler"
)

type HTTPClient struct {
	jwt  string
	addr string
}

func NewHTTPClient(addr string) *HTTPClient {
	return &HTTPClient{
		jwt:  "",
		addr: addr,
	}
}

func (c *HTTPClient) SetJWT(token string) {
	c.jwt = token
}

func (c *HTTPClient) MakeRequest(ctx context.Context, method string, url string, body any) (int, []byte, error) {
	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return 0, nil, err
	}

	req, err := http.NewRequest(method, c.addr+url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return 0, nil, err
	}
	req = req.WithContext(ctx)
	req.Header.Set("Authorization", "Bearer "+c.jwt)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, nil, err
	}
	defer res.Body.Close()

	bodyBytes, err = io.ReadAll(res.Body)
	if err != nil {
		return 0, nil, err
	}

	return res.StatusCode, bodyBytes, err
}

func (c *HTTPClient) CreatePath(ctx context.Context, body handler.CreatePathRequest) (int, *handler.CreatePathResponse, error) {
	code, respBody, err := c.MakeRequest(ctx, "POST", "/", body)
	if err != nil || code != http.StatusOK {
		return code, nil, err
	}

	resp := &handler.CreatePathResponse{}
	if err := json.Unmarshal(respBody, resp); err != nil {
		return 0, nil, err
	}

	return code, resp, err
}

func (c *HTTPClient) DeletePath(ctx context.Context, pathId string) (int, error) {
	code, _, err := c.MakeRequest(ctx, "DELETE", "/"+pathId, nil)
	return code, err
}

func (c *HTTPClient) FetchUserPaths(ctx context.Context, userId string) (int, []*pathmodel.Path, error) {
	code, body, err := c.MakeRequest(ctx, "GET", "/user/"+userId, nil)
	if err != nil || code != http.StatusOK {
		return code, nil, err
	}

	paths := []*pathmodel.Path{}
	if err := json.Unmarshal(body, &paths); err != nil {
		return 0, nil, err
	}

	return code, paths, nil
}

func (c *HTTPClient) FetchPath(ctx context.Context, pathId string) (int, *handler.PathResponse, error) {
	code, body, err := c.MakeRequest(ctx, "GET", "/"+pathId, nil)
	if err != nil || code != http.StatusOK {
		return code, nil, err
	}

	path := &handler.PathResponse{}
	if err := json.Unmarshal(body, path); err != nil {
		return 0, nil, err
	}

	return code, path, nil
}

func (c *HTTPClient) UpdatePath(ctx context.Context, pathId string, body pathmodel.Path) (int, error) {
	code, _, err := c.MakeRequest(ctx, "PUT", "/"+pathId, body)
	return code, err
}

func (c *HTTPClient) CreateStat(ctx context.Context, pathId string, body handler.CreateStatRequest) (int, error) {
	code, _, err := c.MakeRequest(ctx, "POST", "/"+pathId+"/stat", body)
	return code, err
}

func (c *HTTPClient) UpdateStat(ctx context.Context, pathId, statName string, newStat pathmodel.CountlessStat) (int, error) {
	code, _, err := c.MakeRequest(ctx, "PUT", "/"+pathId+"/stat/"+statName, newStat)
	return code, err
}

func (c *HTTPClient) DeleteStat(ctx context.Context, pathId, statName string) (int, error) {
	code, _, err := c.MakeRequest(ctx, "DELETE", "/"+pathId+"/stat/"+statName, nil)
	return code, err
}
