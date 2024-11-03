package server

import (
	"github.com/1001bit/pathgoer/services/path/pathmodel"
	"github.com/1001bit/pathgoer/services/path/shared/pathpb"
)

func ModelStatsToPb(modelStats []pathmodel.Stat) []*pathpb.Stat {
	pbStats := make([]*pathpb.Stat, len(modelStats))
	for i, stat := range modelStats {
		pbStats[i] = &pathpb.Stat{
			Count:          stat.Count,
			Name:           stat.Name,
			StepEquivalent: stat.StepEquivalent,
		}
	}

	return pbStats
}

func PbStatsToModel(pbStats []*pathpb.Stat) []pathmodel.Stat {
	modelStats := make([]pathmodel.Stat, len(pbStats))
	for i, stat := range pbStats {
		modelStats[i] = pathmodel.Stat{
			Count:          stat.Count,
			Name:           stat.Name,
			StepEquivalent: stat.StepEquivalent,
		}
	}

	return modelStats
}
