import React, { useState, useEffect } from 'react';
import { Shield, Activity, Lock, CheckCircle2, XCircle, Terminal, Info, Zap, RefreshCw, Github, Star, Share2, BookOpen, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Invariants {
  RIGHT_VIEW: boolean;
  RIGHT_INTENT: boolean;
  RIGHT_SPEECH: boolean;
  RIGHT_CONDUCT: boolean;
  RIGHT_LIVELIHOOD: boolean;
  RIGHT_EFFORT: boolean;
  RIGHT_MINDFUL: boolean;
  RIGHT_SAMADHI: boolean;
}

interface GateResult {
  status: 'ALLOWED' | 'BLOCKED';
  delta: number;
  invariants: Invariants;
  deterministic: boolean;
  proof: string;
}

const DEFAULT_CURRENT = { value: 10 };
const DEFAULT_PROPOSED = {
  value: 20,
  is_grounded: true,
  intent_score: 5,
  is_api_clean: true,
  source_verified: true,
  compute_cost: 50,
  has_audit_trail: true,
  nonce_lock: true
};

export default function App() {
  const [currentState, setCurrentState] = useState(JSON.stringify(DEFAULT_CURRENT, null, 2));
  const [proposedState, setProposedState] = useState(JSON.stringify(DEFAULT_PROPOSED, null, 2));
  const [result, setResult] = useState<GateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);

  const runGate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_state: JSON.parse(currentState),
          proposed_state: JSON.parse(proposedState)
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Gate Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAIExplanation = async () => {
    if (!result) return;
    setExplaining(true);
    try {
      const prompt = `Explain the following DSG (Deterministic Security Gate) result in a technical but concise way. 
      Status: ${result.status}
      Delta: ${result.delta}
      Invariants: ${JSON.stringify(result.invariants)}
      Proof: ${result.proof}
      
      Explain why it was ${result.status} based on the DSG V160 algorithm (Noble Eightfold Invariants and Structural Drift).`;
      
      const response = await genAI.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt
      });
      setExplanation(response.text || 'No explanation available.');
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setExplaining(false);
    }
  };

  useEffect(() => {
    runGate();
  }, []);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-12 border-b border-[#141414] pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic font-serif">DSG V160</h1>
          <p className="text-xs opacity-60 uppercase tracking-widest font-mono">Deterministic Security Gate / Invariant Engine</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="flex items-center gap-4 mb-2 justify-end">
            <a href="#" className="flex items-center gap-1 text-[10px] font-mono uppercase bg-white border border-[#141414] px-2 py-1 hover:bg-[#141414] hover:text-white transition-colors">
              <Github size={12} />
              View Source
            </a>
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase bg-[#141414] text-white px-2 py-1">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              10k Goal
            </div>
          </div>
          <p className="text-[10px] font-mono opacity-40 uppercase">Status: Operational</p>
          <p className="text-[10px] font-mono opacity-40 uppercase">Protocol: Stateless-Deterministic</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <div className="flex items-center gap-2 mb-4 border-b border-[#141414] pb-2">
              <Terminal size={16} />
              <h2 className="text-xs font-mono uppercase font-bold">Payload Configuration</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase opacity-50 block mb-1 italic font-serif">Current State (JSON)</label>
                <textarea 
                  value={currentState}
                  onChange={(e) => setCurrentState(e.target.value)}
                  className="w-full h-32 bg-[#F5F5F5] border border-[#141414] p-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#141414] resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase opacity-50 block mb-1 italic font-serif">Proposed State (JSON)</label>
                <textarea 
                  value={proposedState}
                  onChange={(e) => setProposedState(e.target.value)}
                  className="w-full h-64 bg-[#F5F5F5] border border-[#141414] p-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#141414] resize-none"
                />
              </div>
              <button 
                onClick={runGate}
                disabled={loading}
                className="w-full bg-[#141414] text-white py-3 font-mono uppercase text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all active:translate-y-1 active:shadow-none"
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                Execute Gate Logic
              </button>
            </div>
          </section>

          <section className="bg-[#141414] text-white p-6 shadow-[4px_4px_0px_0px_rgba(228,227,224,1)]">
            <div className="flex items-center gap-2 mb-4 border-b border-white/20 pb-2">
              <BookOpen size={16} />
              <h2 className="text-xs font-mono uppercase font-bold">Academic Foundation</h2>
            </div>
            <div className="space-y-2">
              <a href="https://doi.org/10.5281/zenodo.18244246" target="_blank" className="block text-[10px] font-mono opacity-60 hover:opacity-100 transition-opacity underline">DOI: 10.5281/zenodo.18244246</a>
              <a href="https://doi.org/10.5281/zenodo.18225586" target="_blank" className="block text-[10px] font-mono opacity-60 hover:opacity-100 transition-opacity underline">DOI: 10.5281/zenodo.18225586</a>
              <a href="https://doi.org/10.5281/zenodo.18212854" target="_blank" className="block text-[10px] font-mono opacity-60 hover:opacity-100 transition-opacity underline">DOI: 10.5281/zenodo.18212854</a>
            </div>
          </section>

          <section className="bg-emerald-900 text-emerald-100 p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <div className="flex items-center gap-2 mb-4 border-b border-emerald-700 pb-2">
              <DollarSign size={16} />
              <h2 className="text-xs font-mono uppercase font-bold">Monetization Plan</h2>
            </div>
            <ul className="text-[10px] font-mono space-y-2 opacity-80">
              <li>• <span className="font-bold">Enterprise:</span> Custom Invariants & SLA</li>
              <li>• <span className="font-bold">Compliance:</span> SOC2/ISO Audit Proofs</li>
              <li>• <span className="font-bold">Cloud:</span> Managed Global SaaS</li>
            </ul>
          </section>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] min-h-[400px]">
            <div className="flex items-center justify-between mb-6 border-b border-[#141414] pb-2">
              <div className="flex items-center gap-2">
                <Activity size={16} />
                <h2 className="text-xs font-mono uppercase font-bold">Gate Decision Engine</h2>
              </div>
              {result && (
                <div className={`px-3 py-1 text-[10px] font-mono uppercase font-bold ${result.status === 'ALLOWED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {result.status}
                </div>
              )}
            </div>

            {result ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Invariants Grid */}
                  <div>
                    <h3 className="text-[10px] font-mono uppercase opacity-50 mb-3 italic font-serif">Invariant Evaluation</h3>
                    <div className="space-y-2">
                      {Object.entries(result.invariants).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between border-b border-black/5 pb-1">
                          <span className="text-[10px] font-mono">{key}</span>
                          {val ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-rose-500" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-mono uppercase opacity-50 mb-3 italic font-serif">Structural Drift (Δ)</h3>
                      <div className="relative h-4 bg-[#F5F5F5] border border-[#141414]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (result.delta / 256) * 100)}%` }}
                          className={`h-full ${result.delta > 256 ? 'bg-rose-500' : 'bg-[#141414]'}`}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] font-mono">0</span>
                        <span className="text-[10px] font-mono font-bold">{result.delta} / 256</span>
                        <span className="text-[9px] font-mono">MAX</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-mono uppercase opacity-50 mb-3 italic font-serif">Deterministic Proof</h3>
                      <div className="bg-[#F5F5F5] border border-[#141414] p-3 break-all">
                        <p className="text-[9px] font-mono leading-tight opacity-70 uppercase mb-1">SHA-256 Hash</p>
                        <p className="text-[10px] font-mono font-bold">{result.proof}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="border-t border-[#141414] pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-mono uppercase font-bold flex items-center gap-2">
                      <Zap size={12} className="text-amber-500" />
                      AI Decision Analysis
                    </h3>
                    <button 
                      onClick={getAIExplanation}
                      disabled={explaining}
                      className="text-[10px] font-mono uppercase underline hover:opacity-70 disabled:opacity-30"
                    >
                      {explaining ? 'Analyzing...' : 'Request Analysis'}
                    </button>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {explanation ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-amber-50 border border-amber-200 p-4 text-xs font-mono italic text-amber-900 leading-relaxed"
                      >
                        {explanation}
                      </motion.div>
                    ) : (
                      <div className="h-20 border border-dashed border-black/10 flex items-center justify-center">
                        <p className="text-[10px] font-mono opacity-30 uppercase">No analysis generated</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 opacity-20">
                <Shield size={48} />
                <p className="text-xs font-mono uppercase mt-4">Awaiting Execution</p>
              </div>
            )}
          </section>

          <footer className="text-[10px] font-mono opacity-40 uppercase flex justify-between">
            <p>© 2026 DSG SECURITY SYSTEMS</p>
            <p>BUILD: V160.FINAL</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
