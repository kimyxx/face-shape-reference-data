# Face Shape Reference Data

Small, dependency-free reference data and a command-line tool for comparing face-shape measurements.

The companion browser tool is available at [My Face Shape Chart](https://myfaceshapechart.com/).

## Included

- `data/measurement-definitions.csv`: raw and derived measurements used by the reference classifier.
- `data/face-shape-reference.csv`: seven face-shape descriptions and the documented heuristic profiles.
- `data/comparison-matrix.csv`: a compact comparison table for neighboring shape rows.
- `data/guide-index.csv`: the public guide index for measurement and styling topics.
- `data/site-discovery.csv`: public API, OpenAPI, MCP, Skill, and catalog entry points.
- `data/example-results.csv`: historical fixture results, clearly marked as reference data rather than accuracy claims.
- `src/reference.mjs`: reusable measurement and classification functions.
- `bin/face-shape-reference.mjs`: a JSON-producing CLI.

## CLI

All four measurements must use the same unit. Jaw angle is optional for ratio-only output and required for the seven-label classification.

```powershell
node .\bin\face-shape-reference.mjs --forehead 6 --cheekbones 6.5 --jaw 5.2 --length 8 --jaw-angle 140
```

The output includes the normalized ratios, width profile, coefficient of variation, and the primary and secondary heuristic results when a jaw angle is supplied.

## Method boundary

This is a transparent styling reference, not a medical, identity, or scientific diagnosis. The classifier is a fixed heuristic and is not an official face-shape standard. The tool accepts measurements; it does not process photos.

## Verification

```powershell
npm test
```

## License

MIT. See [LICENSE](LICENSE).
