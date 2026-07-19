class ExerciseEngine {
  /**
   * Return dynamic recommendations based on injury type and severity
   */
  getRecommendations(bodyPart, severity, progress) {
    const part = (bodyPart || '').toLowerCase();
    const sev = (severity || '').toLowerCase();
    
    let recommendedExercises = [];
    let exercisesToAvoid = [];
    let warmUpSuggestions = [];
    let recoveryTips = [];

    // Base defaults
    if (!part) {
      return {
        recommendedExercises: ["Light stretching", "Yoga"],
        exercisesToAvoid: ["High impact training"],
        warmUpSuggestions: ["5 min dynamic stretches"],
        recoveryTips: ["Adequate hydration", "8 hours sleep"]
      };
    }

    if (part.includes('hamstring') || part.includes('thigh') || part.includes('quad')) {
      if (progress < 50) {
        recommendedExercises = ["Isometric glute bridges", "Gentle static hamstring stretches"];
        exercisesToAvoid = ["Sprinting", "Deadlifts", "Squats"];
        warmUpSuggestions = ["Stationary bike (low resistance)", "Walking"];
        recoveryTips = ["Ice for 20 mins every 4 hours", "Keep leg elevated"];
      } else {
        recommendedExercises = ["Nordic hamstring curls", "Romanian deadlifts (light)", "Lunges"];
        exercisesToAvoid = ["Maximum speed sprinting"];
        warmUpSuggestions = ["High knees", "Butt kicks", "Dynamic leg swings"];
        recoveryTips = ["Heat therapy before training", "Foam rolling"];
      }
    } else if (part.includes('knee') || part.includes('acl')) {
      if (progress < 50) {
        recommendedExercises = ["Straight leg raises", "Quad sets", "Heel slides"];
        exercisesToAvoid = ["Jumping", "Pivoting", "Running"];
        warmUpSuggestions = ["Pool walking", "Stationary cycling"];
        recoveryTips = ["Bracing as recommended", "Avoid twisting motions"];
      } else {
        recommendedExercises = ["Box step-ups", "Goblet squats", "Resistance band sidesteps"];
        exercisesToAvoid = ["Heavy plyometrics"];
        warmUpSuggestions = ["Banded lateral walks", "Cycling"];
        recoveryTips = ["Monitor swelling after sessions", "Cryotherapy"];
      }
    } else if (part.includes('ankle') || part.includes('calf')) {
      recommendedExercises = ["Calf raises", "Ankle alphabet", "Balance board"];
      exercisesToAvoid = ["Uneven surface running", "Box jumps"];
      warmUpSuggestions = ["Ankle circles", "Skipping rope (if cleared)"];
      recoveryTips = ["Compression socks", "Contrast baths"];
    } else if (part.includes('shoulder')) {
      recommendedExercises = ["Rotator cuff external rotations", "Wall slides", "Scapular push-ups"];
      exercisesToAvoid = ["Overhead heavy presses", "Throwing (max effort)"];
      warmUpSuggestions = ["Arm circles", "Band pull-aparts"];
      recoveryTips = ["Post-session icing", "Focus on posture"];
    } else {
      // Generic
      recommendedExercises = ["Pool therapy", "Core stability"];
      exercisesToAvoid = ["High-intensity interval training"];
      warmUpSuggestions = ["Full body dynamic warmup"];
      recoveryTips = ["Listen to body pain signals", "Adequate protein intake"];
    }

    return {
      recommendedExercises,
      exercisesToAvoid,
      warmUpSuggestions,
      recoveryTips
    };
  }
}

module.exports = new ExerciseEngine();
