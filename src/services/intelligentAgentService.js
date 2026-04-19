class IntelligentAgentService {
    buildPlanInput({ poseScore, ruleResults, history = [] }) {
        const trend = this.computeTrend(history);
        const weaknesses = this.extractWeaknesses(ruleResults);
        const targetScore = Math.min(100, Math.round((poseScore || 60) + 12));

        return {
            weaknesses,
            trend,
            goals: {
                currentScore: poseScore || 0,
                targetScore
            }
        };
    }

    computeTrend(history) {
        if (!history || history.length < 2) {
            return 'insufficient_data';
        }
        const sorted = [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const first = sorted[0].poseScore;
        const last = sorted[sorted.length - 1].poseScore;

        if (last > first + 3) return 'improving';
        if (last < first - 3) return 'declining';
        return 'stable';
    }

    extractWeaknesses(ruleResults) {
        if (!ruleResults?.triggeredRules?.length) {
            return ['general conditioning'];
        }
        return ruleResults.triggeredRules.map((r) => r.ruleId);
    }
}

module.exports = new IntelligentAgentService();
