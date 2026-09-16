const SHAPE_ORDER = ["Oblong", "Oval", "Round", "Square", "Heart", "Diamond", "Triangle"];

export const SHAPE_DESCRIPTIONS = Object.freeze({
  Oblong: "Your face is distinctly longer than it is wide, with relatively even horizontal widths.",
  Oval: "Your face is moderately longer than wide, with a balanced forehead and a gently narrower jaw.",
  Round: "Your face length and width are close, with a softer, more curved lower outline.",
  Square: "Your face length and width are close, with balanced widths and a more angular jaw.",
  Heart: "Your upper face is wider while the jaw narrows toward the chin.",
  Diamond: "Your cheekbones are the dominant width while both the forehead and jaw are narrower.",
  Triangle: "Your lower face is broader than your forehead, with the jaw carrying more visual width.",
});

function assertFinitePositive(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a finite number greater than zero.`);
  }
  return value;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function near(value, target, tolerance) {
  return clamp01(1 - Math.abs(value - target) / tolerance);
}

function above(value, start, range) {
  return clamp01((value - start) / range);
}

function below(value, start, range) {
  return clamp01((start - value) / range);
}

function weighted(parts) {
  return parts.reduce((sum, [value, weight]) => sum + value * weight, 0);
}

export function coefficientOfVariation(values) {
  if (!Array.isArray(values) || values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error("Coefficient of variation requires finite values.");
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (mean <= 0) throw new Error("Coefficient of variation requires a positive mean.");
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

export function summarizeMeasurements({ forehead, cheekbones, jaw, length, jawAngle = null } = {}) {
  const foreheadWidth = assertFinitePositive(forehead, "forehead");
  const cheekboneWidth = assertFinitePositive(cheekbones, "cheekbones");
  const jawWidth = assertFinitePositive(jaw, "jaw");
  const faceLength = assertFinitePositive(length, "length");
  const normalizedJawAngle = jawAngle === null || jawAngle === undefined
    ? null
    : assertFinitePositive(jawAngle, "jawAngle");
  const widthProfile = [
    ["Forehead", foreheadWidth],
    ["Cheekbones", cheekboneWidth],
    ["Jaw", jawWidth],
  ]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
    .join(" > ");

  return {
    faceLength,
    foreheadWidth,
    cheekboneWidth,
    jawWidth,
    faceRatio: faceLength / cheekboneWidth,
    foreheadRatio: foreheadWidth / cheekboneWidth,
    jawRatio: jawWidth / cheekboneWidth,
    widthVariance: coefficientOfVariation([foreheadWidth, cheekboneWidth, jawWidth]),
    jawAngle: normalizedJawAngle,
    widthProfile,
    goldenRatioReference: 1.618,
    goldenRatioGap: Math.abs(1.618 - faceLength / cheekboneWidth),
  };
}

export function classifyMetrics(metrics) {
  const {
    faceRatio: h,
    foreheadRatio: f,
    jawRatio: j,
    widthVariance: variance,
    jawAngle,
  } = metrics;
  if (![h, f, j, variance, jawAngle].every(Number.isFinite)) {
    throw new Error("Face classification requires finite measurements and jawAngle.");
  }

  const evenWidths = clamp01(1 - variance / 0.16);
  const softJaw = near(jawAngle, 157, 38);
  const angularJaw = near(jawAngle, 126, 34);
  const foreheadOverJaw = above(f - j, 0.02, 0.18);
  const jawOverForehead = above(j - f, 0.02, 0.18);
  const cheekOverForehead = below(f, 0.98, 0.24);
  const cheekOverJaw = below(j, 0.94, 0.24);
  const narrowJaw = below(j, 0.90, 0.22);
  const broadJaw = above(j, 0.88, 0.18);
  const diamondProfile = f <= 0.82 && j <= 0.90 && h >= 1.20 && h <= 1.27 && jawAngle <= 138;
  const heartProfile = f >= 0.85 && f <= 0.92 && f - j >= -0.02 && j <= 0.90 && h >= 1.22 && h <= 1.40;
  const oblongProfile = h >= 1.28 && h <= 1.55 && variance <= 0.10 && f <= 0.84 && j >= 0.88;
  const triangleProfile = f <= 0.84 && j - f >= 0.06 && j >= 0.87 && h <= 1.25 && jawAngle <= 138 && (f <= 0.81 || h >= 1.22);
  const squareProfile = h <= 1.23 && Math.abs(f - j) <= 0.02 && j >= 0.85 && jawAngle >= 138;

  const scores = {
    Oblong: weighted([[above(h, 1.38, 0.27), 0.58], [evenWidths, 0.27], [near(j, 0.88, 0.20), 0.15]]),
    Oval: weighted([[near(h, 1.36, 0.27), 0.48], [near(f, 0.91, 0.17), 0.20], [near(j, 0.80, 0.17), 0.20], [softJaw, 0.12]]),
    Round: weighted([[near(h, 1.12, 0.22), 0.48], [near(f, 0.89, 0.16), 0.14], [near(j, 0.82, 0.16), 0.18], [softJaw, 0.20]]),
    Square: weighted([[near(h, 1.14, 0.24), 0.34], [near(f, 0.94, 0.14), 0.20], [near(j, 0.92, 0.13), 0.26], [angularJaw, 0.20]]),
    Heart: weighted([[near(h, 1.31, 0.34), 0.18], [foreheadOverJaw, 0.45], [above(f, 0.92, 0.16), 0.21], [narrowJaw, 0.16]]),
    Diamond: weighted([[near(h, 1.34, 0.34), 0.18], [cheekOverForehead, 0.36], [cheekOverJaw, 0.34], [above(variance, 0.07, 0.10), 0.12]]),
    Triangle: weighted([[near(h, 1.23, 0.34), 0.18], [jawOverForehead, 0.45], [broadJaw, 0.24], [angularJaw, 0.13]]),
  };

  if (foreheadOverJaw > 0.48 && f >= 0.92 && j <= 0.90) scores.Heart += 0.20;
  if (jawOverForehead > 0.48 && j >= 0.88 && f <= 0.96) scores.Triangle += 0.20;
  if (cheekOverForehead > 0.45 && cheekOverJaw > 0.45 && variance >= 0.08) scores.Diamond += 0.20;
  if (h >= 1.43 && variance <= 0.11) scores.Oblong += 0.20;
  if (diamondProfile) scores.Diamond += 0.42;
  if (heartProfile) scores.Heart += 0.56;
  if (oblongProfile) scores.Oblong += 0.42;
  if (triangleProfile) scores.Triangle += 0.42;
  if (squareProfile) scores.Square += 0.28;

  const ranked = SHAPE_ORDER
    .map((name) => ({ name, score: scores[name] }))
    .sort((a, b) => b.score - a.score);
  const [primary, secondary] = ranked;
  const margin = primary.score - secondary.score;
  const confidence = Math.round(clamp01(0.48 + primary.score * 0.34 + margin * 0.55) * 100) / 100;

  return {
    primary: primary.name,
    secondary: secondary.name,
    confidence,
    scores,
    rule: `${primary.name} best matches the measured length, width balance, and jaw angle; ${secondary.name} is the nearest alternative.`,
  };
}

export function classifyMeasurements(input) {
  const metrics = summarizeMeasurements(input);
  const classification = metrics.jawAngle === null ? null : classifyMetrics(metrics);
  return { metrics, classification };
}
