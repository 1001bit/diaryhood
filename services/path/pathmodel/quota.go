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

func (p *PathStore) UpdateQuotaStreak(ctx context.Context, pathId, statName string, count int32, quota *Quota) error {
	if quota.HoursPassed < quota.HoursLimit {
		return nil
	}

	var err error

	if quota.CountProgress >= quota.Quota {
		_, err = p.postgresC.ExecContext(ctx, `
			UPDATE quotas
			SET streak = streak + 1, last_done = now(), last_count = $1
			WHERE path_id = $2 AND stat_name = $3
		`, count, pathId, statName)
		quota.Streak += 1
	} else {
		_, err = p.postgresC.ExecContext(ctx, `
			UPDATE quotas
			SET streak = 0, last_done = now(), last_count = $1
			WHERE path_id = $2 AND stat_name = $3
		`, count, pathId, statName)
		quota.Streak = 0
	}

	quota.CountProgress = 0
	quota.HoursPassed = 0
	return err
}
