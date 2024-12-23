package pathmodel

import "context"

func (p *PathStore) CreateQuota(ctx context.Context, pathId, statName string) error {
	_, err := p.postgresC.ExecContext(ctx, `
		INSERT INTO quotas (path_id, stat_name) VALUES ($1, $2)
	`, pathId, statName)
	return err
}

func (p *PathStore) UpdateQuota(ctx context.Context, pathId, statName string, quota QuotaEditable) error {
	_, err := p.postgresC.ExecContext(ctx, `
		UPDATE quotas
		SET quota = $1, duration_hours = $2
		WHERE path_id = $3 AND stat_name = $4
	`, quota.Quota, quota.HoursLimit, pathId, statName)
	return err
}
