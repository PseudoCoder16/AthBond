const fs = require('fs');
const path = require('path');

class RuleEngineService {
    constructor() {
        this.rulesPath = path.join(__dirname, '../ai-services/rules/evaluationRules.json');
    }

    loadRules() {
        const raw = fs.readFileSync(this.rulesPath, 'utf-8');
        return JSON.parse(raw);
    }

    evaluateRules(data) {
        const rules = this.loadRules();
        const triggered = [];

        for (const rule of rules) {
            const value = data?.[rule.metric];
            if (typeof value === 'undefined' || value === null) {
                continue;
            }

            if (this.compare(value, rule.operator, rule.threshold)) {
                triggered.push({
                    ruleId: rule.id,
                    severity: rule.severity,
                    message: rule.message,
                    recommendation: rule.recommendation,
                    observedValue: value
                });
            }
        }

        return {
            triggeredRules: triggered,
            recommendations: triggered.map((item) => item.recommendation),
            riskLevel: this.calculateRiskLevel(triggered)
        };
    }

    compare(value, operator, threshold) {
        switch (operator) {
            case '<':
                return value < threshold;
            case '<=':
                return value <= threshold;
            case '>':
                return value > threshold;
            case '>=':
                return value >= threshold;
            case '==':
                return value === threshold;
            default:
                return false;
        }
    }

    calculateRiskLevel(triggeredRules) {
        if (triggeredRules.some((rule) => rule.severity === 'HIGH')) {
            return 'HIGH';
        }
        if (triggeredRules.some((rule) => rule.severity === 'MEDIUM')) {
            return 'MEDIUM';
        }
        return 'LOW';
    }
}

module.exports = new RuleEngineService();
