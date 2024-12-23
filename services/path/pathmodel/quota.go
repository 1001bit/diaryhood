package pathmodel

import "context"

func (p *PathStore) CreateQuota(ctx context.Context, pathId, statName string) error {
	_, err := p.postgresC.ExecContext(ctx, `
		INSERT INTO quotas (path_id, stat_name) VALUES ($1, $2)
	`, pathId, statName)
	return err
}
