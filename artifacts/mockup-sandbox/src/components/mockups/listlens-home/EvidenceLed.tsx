import React from "react";
import { 
  ShieldCheck, Sparkles, CheckCircle, AlertTriangle, Info,
  Camera, Zap, Search, Package, SearchCode,
  BoxSelect, BookOpen, Clock, Music, Cpu, FileSignature, HelpCircle, AlertCircle, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EvidenceLed() {
  return (
    <div className="min-h-screen bg-[#040a14] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#040a14]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg">L</div>
            <span className="font-bold text-lg tracking-tight text-white">Mr.FLENS <span className="text-slate-500 font-normal">· List-LENS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#studio" className="hover:text-white transition-colors">Studio</a>
            <a href="#guard" className="hover:text-white transition-colors">Guard</a>
            <a href="#lenses" className="hover:text-white transition-colors">Lenses</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-300 hover:text-white hidden sm:block">Sign in</button>
            <Button className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white border-0">
              Get started free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/4 w-[600px] h-[300px] bg-violet-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight mb-6">
              This is what you get.
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
              AI output in under 30 seconds. No guesswork. <br className="hidden md:block"/>
              Studio for sellers, Guard for buyers — powered by specialist AI.
            </p>
          </div>

          {/* Dual Mockup UI */}
          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* Guard Mockup (Left) */}
            <div className="bg-[#0a1122] rounded-2xl border border-violet-500/30 shadow-2xl shadow-violet-900/20 overflow-hidden flex flex-col h-[700px]">
              <div className="h-12 bg-[#0d152a] border-b border-white/5 flex items-center px-4 gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                </div>
                <div className="mx-auto flex items-center gap-2 text-violet-400 text-xs font-medium bg-violet-500/10 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Guard Risk Report
                </div>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Jordan 1 Retro High OG</h3>
                    <p className="text-slate-400">"Chicago Lost and Found"</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-center">
                    <div className="text-xs uppercase tracking-wider font-bold mb-0.5">Risk Score</div>
                    <div className="text-xl font-bold">MEDIUM</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Red Flags */}
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-rose-400 uppercase tracking-wider mb-3">
                      <AlertTriangle className="w-4 h-4" /> 2 Red Flags Detected
                    </h4>
                    <div className="space-y-2">
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex gap-3">
                        <div className="mt-0.5 text-rose-400"><AlertCircle className="w-4 h-4" /></div>
                        <div>
                          <p className="text-rose-200 text-sm font-medium">Box label typography inconsistency</p>
                          <p className="text-rose-300/70 text-xs mt-1">The font weight on the sizing tag appears unusually thin compared to retail examples.</p>
                        </div>
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex gap-3">
                        <div className="mt-0.5 text-rose-400"><AlertCircle className="w-4 h-4" /></div>
                        <div>
                          <p className="text-rose-200 text-sm font-medium">Missing medial panel shots</p>
                          <p className="text-rose-300/70 text-xs mt-1">Crucial authentication points (Swoosh placement, leather cracking pattern) are obscured.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Risk Dimensions</h4>
                    <div className="space-y-3 bg-[#0d152a] rounded-xl p-4 border border-white/5">
                      {[
                        { label: "Material Texture", score: 85, color: "bg-emerald-500" },
                        { label: "Stitching Patterns", score: 70, color: "bg-amber-500" },
                        { label: "Shape & Proportions", score: 92, color: "bg-emerald-500" },
                        { label: "Box & Packaging", score: 45, color: "bg-rose-500" },
                        { label: "Seller History", score: 60, color: "bg-amber-500" },
                      ].map((dim, i) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                          <span className="text-xs text-slate-300 w-32">{dim.label}</span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${dim.color}`} style={{ width: \`\${dim.score}%\` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Green Signals */}
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                      <CheckCircle className="w-4 h-4" /> Authenticity Signals
                    </h4>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex gap-3">
                      <div className="mt-0.5 text-emerald-400"><CheckCircle className="w-4 h-4" /></div>
                      <div>
                        <p className="text-emerald-200 text-sm font-medium">Collar cracking aligns with retail</p>
                        <p className="text-emerald-300/70 text-xs mt-1">The specific pattern and depth of the black collar cracking matches verified retail pairs from this release.</p>
                      </div>
                    </div>
                  </div>

                  {/* Seller Questions */}
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">
                      <HelpCircle className="w-4 h-4" /> Questions to ask seller
                    </h4>
                    <ul className="space-y-2 list-decimal list-inside text-sm text-slate-300 ml-1">
                      <li className="pl-2 pb-1 border-b border-white/5">Can you provide a clear, close-up photo of the size tag inside the shoe?</li>
                      <li className="pl-2 pb-1 border-b border-white/5">Do you have a picture of the back of the insole?</li>
                      <li className="pl-2">Is the original purchase receipt available?</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Mockup (Right) */}
            <div className="bg-[#0a1122] rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-900/20 overflow-hidden flex flex-col h-[700px] mt-8 md:mt-0">
              <div className="h-12 bg-[#0d152a] border-b border-white/5 flex items-center px-4 gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                </div>
                <div className="mx-auto flex items-center gap-2 text-cyan-400 text-xs font-medium bg-cyan-500/10 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  Studio Listing Output
                </div>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative">
                
                {/* Missing Evidence Badge */}
                <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-200 text-sm font-medium">Missing Evidence</p>
                    <p className="text-amber-300/70 text-xs mt-1">For maximum buyer trust, add a photo of the heel tabs. Buyers often look for this to verify condition.</p>
                  </div>
                </div>

                {/* Drafted Title */}
                <div className="mb-6">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Optimised Title</label>
                  <div className="p-3 bg-[#0d152a] border border-white/10 rounded-lg text-white font-medium">
                    Sony Alpha a7 III Mirrorless Camera Body Only - Mint Condition, Low Shutter Count
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-500">78/80 characters</span>
                    <span className="text-xs text-cyan-400 font-medium">High search visibility</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-8">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Market Pricing Data</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0d152a] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium">Quick Sale</span>
                      </div>
                      <div className="text-2xl font-bold text-white">£850–920</div>
                    </div>
                    <div className="bg-[#0d152a] border border-cyan-500/20 rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                      <div className="flex items-center gap-2 text-cyan-400 mb-1 relative z-10">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium">Recommended</span>
                      </div>
                      <div className="text-2xl font-bold text-white relative z-10">£980–1,050</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">AI-Drafted Description</label>
                  <div className="bg-[#0d152a] border border-white/10 rounded-xl p-5 text-sm text-slate-300 space-y-4 font-mono leading-relaxed">
                    <p>Up for sale is a meticulously cared for Sony Alpha a7 III (Body Only).</p>
                    <p className="text-white font-semibold mb-1">Condition Details:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Mint condition with zero visible scratches on the sensor.</li>
                      <li>Screen protector applied since day one (included).</li>
                      <li>Shutter count is exceptionally low at roughly 12,500.</li>
                      <li>All buttons and dials are fully functional and tactile.</li>
                    </ul>
                    <p className="text-white font-semibold mt-4 mb-1">Included in Box:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Original Sony NP-FZ100 battery</li>
                      <li>Unused Sony neck strap</li>
                      <li>Original body cap</li>
                      <li>Retail box and manuals</li>
                    </ul>
                    <p className="italic text-slate-500 mt-4">Dispatched securely via Royal Mail Special Delivery Guaranteed by 1pm.</p>
                  </div>
                </div>
                
                {/* Actions overlay */}
                <div className="sticky bottom-0 left-0 right-0 p-4 mt-8 bg-gradient-to-t from-[#0a1122] via-[#0a1122]/90 to-transparent flex gap-3">
                  <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5">Edit manually</Button>
                  <Button className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white border-0 shadow-lg shadow-cyan-900/50">
                    Export to eBay
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Explainer Section */}
      <section className="py-20 px-6 border-y border-white/5 bg-[#070e1c]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
          
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white">How Studio works</h3>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0d152a] border border-white/10 flex items-center justify-center text-slate-400 font-bold shrink-0">1</div>
                <div>
                  <h4 className="text-white font-medium">Upload photos</h4>
                  <p className="text-sm text-slate-400 mt-1">Snap a few pictures of your item. No need for professional lighting.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0d152a] border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold shrink-0">2</div>
                <div>
                  <h4 className="text-white font-medium">AI analysis</h4>
                  <p className="text-sm text-slate-400 mt-1">Our specialist Lens identifies the exact model, condition, and missing evidence.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0d152a] border border-white/10 flex items-center justify-center text-slate-400 font-bold shrink-0">3</div>
                <div>
                  <h4 className="text-white font-medium">Ready to list</h4>
                  <p className="text-sm text-slate-400 mt-1">Get an optimised title, description, and accurate pricing data instantly.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white">How Guard works</h3>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0d152a] border border-white/10 flex items-center justify-center text-slate-400 font-bold shrink-0">1</div>
                <div>
                  <h4 className="text-white font-medium">Paste a link</h4>
                  <p className="text-sm text-slate-400 mt-1">Found a deal on eBay or Vinted? Just paste the URL into Guard.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0d152a] border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold shrink-0">2</div>
                <div>
                  <h4 className="text-white font-medium">Deep scan</h4>
                  <p className="text-sm text-slate-400 mt-1">AI examines seller history, photo inconsistencies, and pricing anomalies.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0d152a] border border-white/10 flex items-center justify-center text-slate-400 font-bold shrink-0">3</div>
                <div>
                  <h4 className="text-white font-medium">Risk report</h4>
                  <p className="text-sm text-slate-400 mt-1">Review the red flags, green signals, and know exactly what to ask the seller.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Lenses Grid */}
      <section className="py-24 px-6 relative" id="lenses">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Which category are you in?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Generic AI hallucinates. Our 10 specialist Lenses are trained on millions of data points specific to their domain.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: BoxSelect, name: "ShoeLens", active: true },
              { icon: Music, name: "RecordLens", active: true },
              { icon: Cpu, name: "TechLens", active: true },
              { icon: BookOpen, name: "BookLens", active: true },
              { icon: Clock, name: "WatchLens", active: true },
              { icon: FileSignature, name: "AutographLens", active: true },
              { icon: Camera, name: "CameraLens", active: false },
              { icon: Package, name: "ToyLens", active: false },
              { icon: SearchCode, name: "CardLens", active: false },
              { icon: Search, name: "More coming...", active: false }
            ].map((lens, i) => (
              <div 
                key={i} 
                className={`p-6 rounded-2xl border text-center transition-all ${
                  lens.active 
                    ? "bg-[#0d152a] border-white/10 hover:border-cyan-500/50 hover:bg-[#121c36]" 
                    : "bg-[#040a14] border-white/5 opacity-50 grayscale"
                }`}
              >
                <lens.icon className={`w-8 h-8 mx-auto mb-3 ${lens.active ? "text-slate-300" : "text-slate-600"}`} />
                <div className={`font-medium ${lens.active ? "text-white" : "text-slate-500"}`}>{lens.name}</div>
                {!lens.active && i !== 9 && <div className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">Coming soon</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 border-y border-white/5 bg-[#0a1122]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Responsible AI, built for resale.</h2>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-8">
              <h3 className="text-rose-400 font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                What we never do
              </h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 mt-1">✕</span>
                  We never definitively declare an item "fake" or "counterfeit".
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 mt-1">✕</span>
                  We never call a seller a "scammer".
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 mt-1">✕</span>
                  We never automatically report listings to platforms.
                </li>
              </ul>
            </div>
            
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-8">
              <h3 className="text-emerald-400 font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                What we always do
              </h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">✓</span>
                  We highlight probabilistic risk factors and anomalies.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">✓</span>
                  We surface missing evidence needed for verification.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">✓</span>
                  We empower buyers with the right questions to ask.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, transparent pricing.</h2>
            <p className="text-slate-400">Start for free. Upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-[#0d152a] border border-white/10 rounded-2xl p-8 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Free Trial</h3>
              <div className="text-3xl font-bold text-white mb-6">£0</div>
              <ul className="space-y-3 mb-8 flex-1 text-slate-300 text-sm">
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-slate-500 shrink-0" /> 3 Studio listings</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-slate-500 shrink-0" /> 1 Guard risk check</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-slate-500 shrink-0" /> Access to all active Lenses</li>
              </ul>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5">Start free trial</Button>
            </div>

            {/* Studio */}
            <div className="bg-gradient-to-b from-[#0d152a] to-[#040a14] border border-cyan-500/30 rounded-2xl p-8 flex flex-col relative shadow-2xl shadow-cyan-900/20 transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-slate-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">For Sellers</div>
              <h3 className="text-xl font-bold text-cyan-400 mb-2">Studio Starter</h3>
              <div className="text-3xl font-bold text-white mb-1">£9.99<span className="text-lg text-slate-500 font-normal">/mo</span></div>
              <p className="text-sm text-slate-400 mb-6">List faster, sell higher.</p>
              <ul className="space-y-3 mb-8 flex-1 text-slate-300 text-sm">
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" /> 50 Studio listings per month</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" /> AI pricing recommendations</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" /> Missing evidence warnings</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" /> Export directly to platforms</li>
              </ul>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white border-0">Get Studio</Button>
            </div>

            {/* Guard */}
            <div className="bg-[#0d152a] border border-violet-500/30 rounded-2xl p-8 flex flex-col relative">
              <h3 className="text-xl font-bold text-violet-400 mb-2">Guard Passes</h3>
              <div className="text-3xl font-bold text-white mb-1">£1.99<span className="text-lg text-slate-500 font-normal">/check</span></div>
              <p className="text-sm text-slate-400 mb-6">Pay as you go. No subscription.</p>
              <ul className="space-y-3 mb-8 flex-1 text-slate-300 text-sm">
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-violet-500 shrink-0" /> Detailed 5-dimension risk report</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-violet-500 shrink-0" /> Photo & text anomaly detection</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-violet-500 shrink-0" /> Generates questions for sellers</li>
              </ul>
              <Button variant="outline" className="w-full border-violet-500/50 text-violet-100 hover:bg-violet-500/10">Buy a pass</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#040a14]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs">L</div>
            <span className="font-bold text-sm text-slate-300">Mr.FLENS · List-LENS</span>
          </div>
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Mr.FLENS. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300">Privacy</a>
            <a href="#" className="hover:text-slate-300">Terms</a>
            <a href="#" className="hover:text-slate-300">AI Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
