package accesstoken

import "context"

type Claims struct {
	Id string `json:"id"`
}

func GetClaimsFromContext(ctx context.Context) (Claims, bool) {
	claims, ok := ctx.Value("claims").(Claims)
	return claims, ok
}
