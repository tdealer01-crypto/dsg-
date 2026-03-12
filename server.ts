import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { DSGEngine } from "./core/engine";
import { loadPolicy } from "./core/policy";
import { PayloadSchema } from "./core/validator";

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Load V3 Policy
  const policyPath = path.join(process.cwd(), 'policies', 'default.yaml');
  const rules = loadPolicy(policyPath);
  const engine = new DSGEngine(rules);

  // API Routes
  app.post("/api/gate", (req, res) => {
    try {
      const { current_state = {}, proposed_state = {} } = req.body;
      
      // V3 Schema Validation
      const validatedPayload = PayloadSchema.parse(proposed_state);
      
      const result = engine.evaluate(validatedPayload);
      
      // Still calculate drift for backward compatibility in UI if needed
      const currentKeys = new Set(Object.keys(current_state));
      const proposedKeys = new Set(Object.keys(proposed_state));
      const symmetricDifference = new Set([...currentKeys].filter(x => !proposedKeys.has(x)).concat([...proposedKeys].filter(x => !currentKeys.has(x))));
      const delta = symmetricDifference.size + Math.abs(JSON.stringify(current_state).length - JSON.stringify(proposed_state).length);

      res.json({
        status: result.status,
        delta: delta,
        invariants: result.results,
        deterministic: true,
        proof: result.proof,
        version: result.version,
        timestamp: result.timestamp
      });
    } catch (error) {
      res.status(400).json({ 
        status: "ERROR",
        message: "Invalid Payload Schema",
        details: error
      });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({
      system: "DSG",
      version: "V3.0.0-TS",
      rules_loaded: rules.length,
      deterministic: true
    });
  });

  app.get("/api/benchmark", (req, res) => {
    const payload = { intent_score: 10, is_api_clean: true, compute_cost: 50 };
    const start = performance.now();
    const iterations = 100000;
    
    for (let i = 0; i < iterations; i++) {
      engine.evaluate(payload);
    }
    
    const end = performance.now();
    const duration = end - start;
    
    res.json({
      iterations,
      duration_ms: duration,
      req_per_sec: Math.round((iterations / duration) * 1000)
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
    console.log(`DSG V3 Server running on http://localhost:${PORT}`);
  });
}

startServer();
