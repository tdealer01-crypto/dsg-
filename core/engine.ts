import crypto from 'crypto';

export interface Rule {
  name: string;
  field: string;
  op: '>' | '<' | '==' | '!=';
  value: any;
}

export class DSGEngine {
  private rules: Rule[];

  constructor(rules: Rule[]) {
    this.rules = rules;
  }

  evaluate(payload: any) {
    const results: Record<string, boolean> = {};

    for (const rule of this.rules) {
      const actual = payload[rule.field];
      results[rule.name] = this.compare(actual, rule.op, rule.value);
    }

    const decision = Object.values(results).every(v => v === true);

    return {
      status: decision ? 'ALLOWED' : 'BLOCKED',
      results,
      proof: this.generateProof(payload, results),
      timestamp: new Date().toISOString(),
      version: 'V3.0.0-TS'
    };
  }

  private compare(actual: any, op: string, value: any): boolean {
    if (actual === undefined) return false;
    switch (op) {
      case '>': return actual > value;
      case '<': return actual < value;
      case '==': return actual === value;
      case '!=': return actual !== value;
      default: return false;
    }
  }

  private generateProof(payload: any, results: any): string {
    const data = JSON.stringify({ payload, results });
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
