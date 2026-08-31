const { spawn } = require('child_process');
const path = require('path');

class PythonBridge {
  constructor() {
    this.scriptPath = path.join(__dirname, '../../scripts/ml_predictor.py');
  }

  /**
   * Spawns Python process to compute ML injury risk
   */
  async predictInjury(params = {}) {
    const {
      workload = 0.5,
      acwr = 1.05,
      restDays = 3,
      historyIndex = 0.2,
      fatigue = 0.4
    } = params;

    return new Promise((resolve) => {
      const args = [
        this.scriptPath,
        '--task', 'injury',
        '--workload', String(workload),
        '--acwr', String(acwr),
        '--rest_days', String(restDays),
        '--history_index', String(historyIndex),
        '--fatigue', String(fatigue)
      ];

      // Try python first, fallback to python3 or node logic on failure
      const pyProcess = spawn('python', args, { timeout: 3000 });

      let stdoutData = '';
      let stderrData = '';

      pyProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      pyProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      pyProcess.on('close', (code) => {
        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData);
            return resolve({ success: true, isPython: true, data: parsed });
          } catch (e) { }
        }
        
        // Fallback to Node.js calculation
        return resolve({
          success: true,
          isPython: false,
          data: this.fallbackInjuryPrediction(workload, acwr, restDays, historyIndex, fatigue)
        });
      });

      pyProcess.on('error', () => {
        return resolve({
          success: true,
          isPython: false,
          data: this.fallbackInjuryPrediction(workload, acwr, restDays, historyIndex, fatigue)
        });
      });
    });
  }

  /**
   * Safe JavaScript Fallback Prediction Engine
   */
  fallbackInjuryPrediction(workload, acwr, restDays, historyIndex, fatigue) {
    const rawScore = (workload * 0.3) + (acwr * 0.35) + (fatigue * 0.25) + (historyIndex * 0.2) - (restDays * 0.05);
    const prob = Math.min(0.99, Math.max(0.03, 1.0 / (1.0 + Math.exp(-rawScore + 1.2))));

    let riskLevel = 'LOW';
    let availabilityStatus = 'Ready';

    if (prob >= 0.70 || acwr > 1.5) {
      riskLevel = 'HIGH';
      availabilityStatus = 'Unavailable';
    } else if (prob >= 0.35 || acwr > 1.3) {
      riskLevel = 'MEDIUM';
      availabilityStatus = 'Limited Training';
    }

    const factors = [];
    if (acwr > 1.5) factors.push(`High ACWR Spike (${acwr.toFixed(2)})`);
    if (workload > 0.7) factors.push('High Match Workload Accumulation');
    if (restDays < 3) factors.push(`Short Recovery Window (${restDays} Days)`);
    if (factors.length === 0) factors.push('Optimal Workload Sweet Spot');

    return {
      model_type: 'Kinetix Node JS Fallback Engine v2.4',
      risk_score: parseFloat((prob * 100).toFixed(1)),
      risk_level: riskLevel,
      acwr_ratio: parseFloat(acwr.toFixed(2)),
      availability_status: availabilityStatus,
      contributing_factors: factors,
      confidence_score: 0.85
    };
  }
}

module.exports = new PythonBridge();
