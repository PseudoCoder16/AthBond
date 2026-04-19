class TrainingRecommendationService {
    generatePlan({ athlete, poseScore, ruleResults, agentOutput }) {
        const primaryGoal = this.selectGoal(ruleResults, poseScore);

        const exercises = this.buildExerciseList(primaryGoal, ruleResults);
        return {
            athleteId: athlete?._id || athlete?.id || null,
            goal: primaryGoal,
            duration: '2 weeks',
            baselineScore: poseScore,
            targetScore: agentOutput.goals.targetScore,
            reasoning: `Trend: ${agentOutput.trend}. Focus areas: ${agentOutput.weaknesses.join(', ')}`,
            exercises
        };
    }

    selectGoal(ruleResults, poseScore) {
        if (ruleResults.triggeredRules.some((rule) => rule.ruleId.includes('balance'))) {
            return 'Improve balance and stability';
        }
        if (ruleResults.triggeredRules.some((rule) => rule.ruleId.includes('knee'))) {
            return 'Reduce injury risk and improve knee alignment';
        }
        if ((poseScore || 0) < 70) {
            return 'Improve movement quality and posture';
        }
        return 'Progress overall athletic performance';
    }

    buildExerciseList(goal, ruleResults) {
        const list = [
            {
                name: 'Dynamic warm-up',
                focusArea: 'mobility',
                frequencyPerWeek: 5,
                durationMinutes: 12,
                notes: 'Before each training session.'
            },
            {
                name: 'Core stability circuit',
                focusArea: 'balance',
                frequencyPerWeek: 4,
                durationMinutes: 20,
                notes: 'Plank variations and anti-rotation drills.'
            }
        ];

        if (ruleResults.triggeredRules.some((rule) => rule.ruleId.includes('speed'))) {
            list.push({
                name: 'Resisted sprints',
                focusArea: 'speed',
                frequencyPerWeek: 3,
                durationMinutes: 25,
                notes: 'Short bursts with full rest intervals.'
            });
        }

        if (goal.toLowerCase().includes('knee')) {
            list.push({
                name: 'Controlled split squats',
                focusArea: 'knee control',
                frequencyPerWeek: 3,
                durationMinutes: 18,
                notes: 'Track knee over toe and maintain alignment.'
            });
        }

        return list;
    }
}

module.exports = new TrainingRecommendationService();
