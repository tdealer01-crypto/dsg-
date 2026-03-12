import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // -----------------------------
  // DSG Algorithm Implementation
  // -----------------------------

  const INVARIANTS = {
    "RIGHT_VIEW": (x: any) => x.is_grounded === true,
    "RIGHT_INTENT": (x: any) => (x.intent_score || 0) > 0,
    "RIGHT_SPEECH": (x: any) => x.is_api_clean === true,
    "RIGHT_CONDUCT": (x: any) => (x.value || 0) >= 0,
    "RIGHT_LIVELIHOOD": (x: any) => x.source_verified === true,
    "RIGHT_EFFORT": (x: any) => (x.compute_cost || 0) < 1000,
    "RIGHT_MINDFUL": (x: any) => x.has_audit_trail === true,
    "RIGHT_SAMADHI": (x: any) => x.nonce_lock === true,
  };

  const DELTA_MAX = 256;

  function driftMetric(a: any, b: any) {
    const aKeys = new Set(Object.keys(a));
    const bKeys = new Set(Object.keys(b));

    const symmetricDifference = new Set([...aKeys].filter(x => !bKeys.has(x)).concat([...bKeys].filter(x => !aKeys.has(x))));
    const keyDrift = symmetricDifference.size;

    const sizeDrift = Math.abs(
      JSON.stringify(a).length - JSON.stringify(b).length
    );

    return keyDrift + sizeDrift;
  }

  function proofHash(payload: any, results: any, allowed: boolean) {
    const h = crypto.createHash('sha256');
    const data = JSON.stringify({
        payload: Object.keys(payload).sort().reduce((obj: any, key) => { obj[key] = payload[key]; return obj; }, {}),
        results: Object.keys(results).sort().reduce((obj: any, key) => { obj[key] = results[key]; return obj; }, {}),
        allowed
    });
    h.update(data);
    return h.digest('hex');
  }

  function DSG(currentState: any, proposedState: any) {
    const results: Record<string, boolean> = {};
    for (const [key, rule] of Object.entries(INVARIANTS)) {
      results[key] = !!rule(proposedState);
    }

    const invariantPass = Object.values(results).every(v => v === true);
    const delta = driftMetric(currentState, proposedState);
    const driftOk = delta <= DELTA_MAX;

    const allowed = invariantPass && driftOk;

    return {
      allowed,
      delta,
      invariants: results
    };
  }

  // -----------------------------
  // API Routes
  // -----------------------------

  app.post("/api/gate", (req, res) => {
    const { current_state = {}, proposed_state = {} } = req.body;

    const result = DSG(current_state, proposed_state);
    const proof = proofHash(proposed_state, result.invariants, result.allowed);

    res.json({
      status: result.allowed ? "ALLOWED" : "BLOCKED",
      delta: result.delta,
      invariants: result.invariants,
      deterministic: true,
      proof: proof
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({
      system: "DSG",
      version: "V160",
      deterministic: true
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
