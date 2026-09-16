#!/usr/bin/env node

import { classifyMeasurements } from "../src/reference.mjs";

const USAGE = "Usage: node ./bin/face-shape-reference.mjs --forehead N --cheekbones N --jaw N --length N [--jaw-angle N]";

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      console.log(USAGE);
      process.exit(0);
    }
    if (!argument.startsWith("--")) throw new Error(`Unexpected argument: ${argument}`);
    const key = argument.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${argument}`);
    values[key] = Number(value);
    if (!Number.isFinite(values[key])) throw new Error(`${argument} must be numeric.`);
    index += 1;
  }
  return values;
}

try {
  const args = parseArgs(process.argv.slice(2));
  const input = {
    forehead: args.forehead,
    cheekbones: args.cheekbones,
    jaw: args.jaw,
    length: args.length,
    jawAngle: args["jaw-angle"],
  };
  const result = classifyMeasurements(input);
  console.log(JSON.stringify({
    ...result,
    caveat: "Fixed styling heuristic only. This CLI accepts measurements and does not process photos.",
  }, null, 2));
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  console.error(USAGE);
  process.exitCode = 1;
}
