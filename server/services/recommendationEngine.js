class RecommendationEngine {
  /**
   * Generates workload and playing time recommendations based on risk
   */
  getRecommendation(riskProbability) {
    if (riskProbability < 20) {
      return {
        recommendedPlayingMinutes: 90, // Or "Full Match"
        selectionAdvice: "Start Player",
        workloadAdvice: "Normal workload. Player is fully fit and ready for maximum intensity."
      };
    } else if (riskProbability < 50) {
      return {
        recommendedPlayingMinutes: 70,
        selectionAdvice: "Monitor Workload",
        workloadAdvice: "Player is safe to start but monitor fatigue levels in the second half. Consider early substitution if intensity drops."
      };
    } else if (riskProbability < 80) {
      return {
        recommendedPlayingMinutes: 45,
        selectionAdvice: "Use Substitute",
        workloadAdvice: "Limit exposure. Best used as an impact substitute in the second half to minimize injury risk."
      };
    } else {
      return {
        recommendedPlayingMinutes: 0,
        selectionAdvice: "Do Not Start",
        workloadAdvice: "High risk of re-injury. Player should not be selected for matchday squad and should focus on rehabilitation."
      };
    }
  }
}

module.exports = new RecommendationEngine();
