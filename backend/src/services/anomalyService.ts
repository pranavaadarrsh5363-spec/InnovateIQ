export interface WaterQualityThresholds {
  ph: { min: number; max: number; criticalMin: number; criticalMax: number; unit: string; standard: string };
  turbidity: { max: number; criticalMax: number; unit: string; standard: string };
  tds: { max: number; criticalMax: number; unit: string; standard: string };
  temperature: { min: number; max: number; unit: string; standard: string };
}

export interface TelemetryMeasurementInput {
  ph?: number;
  turbidity?: number;
  tds?: number;
  temperature?: number;
  [key: string]: number | undefined;
}

export interface MetricViolation {
  metric: string;
  observed: number;
  threshold: number;
  condition: 'below_min' | 'above_max' | 'critical_below_min' | 'critical_above_max';
  severity: 'WARNING' | 'CRITICAL';
  standardRef: string;
  message: string;
}

export interface AnomalyEvaluationResult {
  hasAnomaly: boolean;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  overallScore: number; // 0 to 100 potability index
  violations: MetricViolation[];
  interpretation: string;
  recommendedAction: string;
  evaluatedAt: string;
  regulatoryStandard: string;
}

// Default standard based on Bureau of Indian Standards BIS IS 10500:2012 Drinking Water Specification
let activeThresholds: WaterQualityThresholds = {
  ph: {
    min: 6.5,
    max: 8.5,
    criticalMin: 6.0,
    criticalMax: 9.0,
    unit: 'pH',
    standard: 'BIS IS 10500:2012 Clause 4.1 Table 1',
  },
  turbidity: {
    max: 5.0,
    criticalMax: 10.0,
    unit: 'NTU',
    standard: 'BIS IS 10500:2012 Clause 4.1 Table 1 (Permissible limit)',
  },
  tds: {
    max: 500,
    criticalMax: 1000,
    unit: 'ppm',
    standard: 'BIS IS 10500:2012 Clause 4.1 Table 1 (Desirable limit: 500, Permissible: 2000)',
  },
  temperature: {
    min: 5.0,
    max: 40.0,
    unit: '°C',
    standard: 'Environmental Standard Baseline',
  },
};

export const anomalyService = {
  getThresholds(): WaterQualityThresholds {
    return { ...activeThresholds };
  },

  updateThresholds(newThresholds: Partial<WaterQualityThresholds>): WaterQualityThresholds {
    activeThresholds = {
      ...activeThresholds,
      ...newThresholds,
    };
    return { ...activeThresholds };
  },

  evaluate(measurements: TelemetryMeasurementInput): AnomalyEvaluationResult {
    const violations: MetricViolation[] = [];
    let isCritical = false;
    let isWarning = false;

    // 1. Evaluate pH
    if (typeof measurements.ph === 'number') {
      const val = measurements.ph;
      const t = activeThresholds.ph;
      if (val < t.criticalMin) {
        violations.push({
          metric: 'ph',
          observed: val,
          threshold: t.criticalMin,
          condition: 'critical_below_min',
          severity: 'CRITICAL',
          standardRef: t.standard,
          message: `Severe acidity detected (${val} < ${t.criticalMin}). Potential industrial effluent or chemical leaching.`,
        });
        isCritical = true;
      } else if (val > t.criticalMax) {
        violations.push({
          metric: 'ph',
          observed: val,
          threshold: t.criticalMax,
          condition: 'critical_above_max',
          severity: 'CRITICAL',
          standardRef: t.standard,
          message: `Severe alkalinity detected (${val} > ${t.criticalMax}). Exceeds emergency consumption safety limits.`,
        });
        isCritical = true;
      } else if (val < t.min) {
        violations.push({
          metric: 'ph',
          observed: val,
          threshold: t.min,
          condition: 'below_min',
          severity: 'WARNING',
          standardRef: t.standard,
          message: `Slight acidic deviation (${val} < ${t.min} acceptable baseline).`,
        });
        isWarning = true;
      } else if (val > t.max) {
        violations.push({
          metric: 'ph',
          observed: val,
          threshold: t.max,
          condition: 'above_max',
          severity: 'WARNING',
          standardRef: t.standard,
          message: `Slight alkaline deviation (${val} > ${t.max} acceptable baseline).`,
        });
        isWarning = true;
      }
    }

    // 2. Evaluate Turbidity
    if (typeof measurements.turbidity === 'number') {
      const val = measurements.turbidity;
      const t = activeThresholds.turbidity;
      if (val >= t.criticalMax) {
        violations.push({
          metric: 'turbidity',
          observed: val,
          threshold: t.criticalMax,
          condition: 'critical_above_max',
          severity: 'CRITICAL',
          standardRef: t.standard,
          message: `Critical turbidity suspension (${val} NTU >= ${t.criticalMax} NTU). Significant particulate matter or pathogen transport risk.`,
        });
        isCritical = true;
      } else if (val > t.max) {
        violations.push({
          metric: 'turbidity',
          observed: val,
          threshold: t.max,
          condition: 'above_max',
          severity: 'WARNING',
          standardRef: t.standard,
          message: `Turbidity elevated (${val} NTU > ${t.max} NTU desirable limit).`,
        });
        isWarning = true;
      }
    }

    // 3. Evaluate TDS
    if (typeof measurements.tds === 'number') {
      const val = measurements.tds;
      const t = activeThresholds.tds;
      if (val >= t.criticalMax) {
        violations.push({
          metric: 'tds',
          observed: val,
          threshold: t.criticalMax,
          condition: 'critical_above_max',
          severity: 'CRITICAL',
          standardRef: t.standard,
          message: `High total dissolved solids (${val} ppm >= ${t.criticalMax} ppm). Mineral or salinity contamination risk.`,
        });
        isCritical = true;
      } else if (val > t.max) {
        violations.push({
          metric: 'tds',
          observed: val,
          threshold: t.max,
          condition: 'above_max',
          severity: 'WARNING',
          standardRef: t.standard,
          message: `TDS exceeds desirable baseline (${val} ppm > ${t.max} ppm).`,
        });
        isWarning = true;
      }
    }

    // Determine Status
    const status: 'NORMAL' | 'WARNING' | 'CRITICAL' = isCritical
      ? 'CRITICAL'
      : isWarning
      ? 'WARNING'
      : 'NORMAL';

    // Compute Potability Index (0-100)
    let overallScore = 95;
    if (status === 'CRITICAL') overallScore = 32;
    else if (status === 'WARNING') overallScore = 68;

    // Generate Contextual AI Interpretation & Recommended Actions
    let interpretation = 'Sensor parameters comply with BIS IS 10500:2012 potability specifications. No acute anomaly detected.';
    let recommendedAction = 'Maintain standard continuous telemetry sampling interval (10–60s).';

    if (status === 'CRITICAL') {
      interpretation = `CRITICAL ANOMALY: Multiple parameter violation detected (${violations.map(v => `${v.metric}: ${v.observed}`).join(', ')}). Probable sudden contamination event such as agricultural runoff, wastewater seepage, or sensor fouling.`;
      recommendedAction = '1. Automated alert broadcast to local administration and community representatives.\n2. Trigger automated auxiliary filtration/dosing unit if available.\n3. Request physical sample verification by certified district water inspector before water distribution.';
    } else if (status === 'WARNING') {
      interpretation = `MODERATE WARNING: Telemetry indicates minor deviation from desirable thresholds (${violations.map(v => `${v.metric}: ${v.observed}`).join(', ')}). Water may remain potable but warrants observation.`;
      recommendedAction = 'Increase telemetry polling frequency to 10s and monitor trend for potential subsequent contamination escalation.';
    }

    return {
      hasAnomaly: violations.length > 0,
      status,
      overallScore,
      violations,
      interpretation,
      recommendedAction,
      evaluatedAt: new Date().toISOString(),
      regulatoryStandard: 'BIS IS 10500:2012 Drinking Water Specification',
    };
  },
};
