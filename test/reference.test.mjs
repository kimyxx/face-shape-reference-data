import test from "node:test";
import assert from "node:assert/strict";
import { classifyMeasurements, summarizeMeasurements } from "../src/reference.mjs";

test("computes ratios and a descending width profile", () => {
  const metrics = summarizeMeasurements({ forehead: 6, cheekbones: 6.5, jaw: 5.2, length: 8 });
  assert.equal(metrics.faceRatio, 8 / 6.5);
  assert.equal(metrics.foreheadRatio, 6 / 6.5);
  assert.equal(metrics.jawRatio, 5.2 / 6.5);
  assert.equal(metrics.widthProfile, "Cheekbones > Forehead > Jaw");
  assert.equal(metrics.jawAngle, null);
});

test("returns no classification when jaw angle is absent", () => {
  const result = classifyMeasurements({ forehead: 6, cheekbones: 6.5, jaw: 5.2, length: 8 });
  assert.equal(result.classification, null);
});

test("matches the square priority profile", () => {
  const result = classifyMeasurements({ forehead: 9.4, cheekbones: 10, jaw: 9.2, length: 11.4, jawAngle: 145 });
  assert.equal(result.classification.primary, "Square");
  assert.ok(result.classification.secondary);
  assert.ok(result.classification.confidence > 0 && result.classification.confidence <= 1);
});

test("matches the heart priority profile", () => {
  const result = classifyMeasurements({ forehead: 9, cheekbones: 10, jaw: 8.6, length: 13, jawAngle: 145 });
  assert.equal(result.classification.primary, "Heart");
});
