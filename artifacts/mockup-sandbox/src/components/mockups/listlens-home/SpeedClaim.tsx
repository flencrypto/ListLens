import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, ShieldCheck, Camera, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import "./_speed-claim.css";

export function SpeedClaim() {
  const [heroTime, setHeroTime] = useState("00:28");

  useEffect(() => {
    // Slight randomization of the final time between 24 and 29 seconds to make it feel live
    const seconds = Math.floor(Math.random() * (29 - 24 + 1)) + 24;
    setHeroTime(`00:${seconds.toString().padStart(2, "0")}`);
  }, []);

  return (
    <div className="speed-claim-page min-h-screen selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#040a14]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-bold text-xl tracking-tight">List-LENS</div>
            <Badge variant="outline" className="font-mono text-xs text-cyan-400 border-cyan-500/20 bg-cyan-500/10">
              STUDIO
            </Badge>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/60 font-mono">
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#lenses" className="hover:text-white transition-colors">Lenses</a>
            <a href="#guard" className="hover:text-white transition-colors">Guard</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-white/40 hidden md:block">0 seconds to sign up</div>
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono rounded-none h-9 px-6">
              Start Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#22d3ee15_0%,transparent_50%)]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 text-sm font-mono text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-flash"></span>
            Live counter stopped
          </div>
          
          <h1 className="text-8xl md:text-[12rem] font-bold font-mono timer-digit tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-6 drop-shadow-2xl">
            {heroTime}
          </h1>
          
          <p className="text-2xl md:text-3xl font-medium text-white/80 mb-12 max-w-2xl mx-auto tracking-tight">
            From photo to listing. <span className="text-cyan-400">Every time.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-lg h-14 px-8 w-full sm:w-auto rounded-none">
              Start listing free
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5 font-mono text-lg h-14 px-8 w-full sm:w-auto rounded-none">
              See the 28s breakdown <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* The Timeline Section */}
      <section id="how" className="py-24 border-b border-white/5 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">The 28-second listing.</h2>
            <p className="text-white/50 font-mono text-sm">Real-time breakdown of an average List-LENS Studio flow.</p>
          </div>

          <div className="space-y-12">
            {/* Phase 1 */}
            <div className="relative pl-8 md:pl-0">
              <div className="md:grid md:grid-cols-[1fr_2fr] gap-8 items-start">
                <div className="mb-4 md:mb-0 md:text-right md:pr-8 border-l-2 md:border-l-0 md:border-r-2 border-white/10 py-2">
                  <div className="font-mono text-2xl font-bold text-white/40 mb-1">0:00–0:05</div>
                  <div className="text-cyan-400 font-mono text-sm">5 SECONDS</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-none relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <div className="h-full bg-cyan-500/30 w-[15%]"></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-white/10 p-3 flex-shrink-0">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Upload photos</h3>
                      <p className="text-white/60 text-sm mb-4">Snap or select 3–8 images of your item. No cropping or editing required.</p>
                      <div className="bg-black/50 border border-white/5 p-3 flex items-center gap-3 font-mono text-xs text-white/50">
                        <CheckCircle2 className="w-4 h-4 text-cyan-500/50" />
                        <span>Backgrounds automatically neutralized</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative pl-8 md:pl-0">
              <div className="md:grid md:grid-cols-[1fr_2fr] gap-8 items-start">
                <div className="mb-4 md:mb-0 md:text-right md:pr-8 border-l-2 md:border-l-0 md:border-r-2 border-white/10 py-2">
                  <div className="font-mono text-2xl font-bold text-white/80 mb-1">0:05–0:12</div>
                  <div className="text-cyan-400 font-mono text-sm">7 SECONDS</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-none relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <div className="h-full bg-cyan-500/60 w-[40%]"></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-cyan-500/20 p-3 flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">AI Visual Analysis</h3>
                      <p className="text-white/60 text-sm mb-4">Our specialized Lenses read the item, identifying specific traits that general AI misses.</p>
                      <div className="bg-black/50 border border-white/5 p-3 flex items-center gap-3 font-mono text-xs text-white/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                        <span>RecordLens reads matrix etchings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative pl-8 md:pl-0">
              <div className="md:grid md:grid-cols-[1fr_2fr] gap-8 items-start">
                <div className="mb-4 md:mb-0 md:text-right md:pr-8 border-l-2 md:border-l-0 md:border-r-2 border-cyan-500 py-2">
                  <div className="font-mono text-3xl font-bold text-white mb-1">0:12–0:28</div>
                  <div className="text-cyan-400 font-mono text-sm font-bold">16 SECONDS</div>
                </div>
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 md:p-8 rounded-none relative shadow-[0_0_30px_-10px_rgba(34,211,238,0.15)]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <div className="h-full bg-cyan-500 w-[100%]"></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-white text-black p-3 flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-cyan-50">Draft Generated</h3>
                      <p className="text-white/70 text-sm mb-4">Title, description, condition, item specifics, and suggested pricing bands are ready to review.</p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                        <div className="bg-black/40 border border-white/10 p-2 text-white/60 flex justify-between">
                          <span>Title</span> <span className="text-cyan-400">Done</span>
                        </div>
                        <div className="bg-black/40 border border-white/10 p-2 text-white/60 flex justify-between">
                          <span>Desc.</span> <span className="text-cyan-400">Done</span>
                        </div>
                        <div className="bg-black/40 border border-white/10 p-2 text-white/60 flex justify-between">
                          <span>Price</span> <span className="text-cyan-400">Done</span>
                        </div>
                        <div className="bg-black/40 border border-white/10 p-2 text-white/60 flex justify-between">
                          <span>Specifics</span> <span className="text-cyan-400">Done</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lenses Horizontal Scroll */}
      <section id="lenses" className="py-20 border-b border-white/5 overflow-hidden">
        <div className="container mx-auto px-4 mb-10">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold mb-2">10 Specialist Lenses</h2>
              <p className="text-white/50 text-sm">General AI doesn't know vintage from modern. Our Lenses do.</p>
            </div>
            <div className="font-mono text-xs text-white/30 hidden sm:block">SCROLL →</div>
          </div>
        </div>
        
        <div className="flex overflow-x-auto pb-8 px-4 gap-4 no-scrollbar container mx-auto">
          {['ShoeLens', 'RecordLens', 'TechLens', 'BookLens', 'AntiquesLens', 'AutographLens', 'ToyLens'].map((lens, i) => (
            <div key={lens} className="min-w-[280px] bg-white/[0.03] border border-white/10 p-6 rounded-none flex flex-col hover:bg-white/[0.05] transition-colors cursor-pointer group">
              <div className="font-mono text-xs text-white/40 mb-4">{String(i + 1).padStart(2, '0')}</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">{lens}</h3>
              <div className="mt-auto pt-8 flex items-center justify-between font-mono text-xs text-white/50">
                <span>View details</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
          <div className="min-w-[280px] border border-dashed border-white/20 p-6 rounded-none flex flex-col justify-center items-center text-center">
            <div className="font-mono text-sm text-white/40">+4 Coming Soon</div>
          </div>
        </div>
      </section>

      {/* Guard Section (Honest contrast) */}
      <section id="guard" className="py-24 border-b border-white/5 bg-violet-950/10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge variant="outline" className="font-mono text-xs text-violet-400 border-violet-500/20 bg-violet-500/10 mb-6">
            GUARD
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Buyers: Guard checks take ~45 seconds.</h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Studio is fast because sellers need speed. Guard is thorough because buyers need certainty. We analyze URLs or photos against known risk factors.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 font-mono text-sm max-w-3xl mx-auto">
            <div className="border border-violet-500/20 bg-violet-500/5 p-4">
              <div className="text-violet-400 mb-1">Authenticity</div>
              <div className="text-white/60">Pattern matching</div>
            </div>
            <div className="border border-violet-500/20 bg-violet-500/5 p-4">
              <div className="text-violet-400 mb-1">Pricing</div>
              <div className="text-white/60">Market analysis</div>
            </div>
            <div className="border border-violet-500/20 bg-violet-500/5 p-4">
              <div className="text-violet-400 mb-1">Seller</div>
              <div className="text-white/60">Risk dimensions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Ethos */}
      <section className="py-20 border-b border-white/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-mono text-sm text-white/50 tracking-widest uppercase mb-4">Our Commitment</h2>
          <p className="text-2xl font-medium text-white/90">Evidence-led. Never over-claims.</p>
        </div>
      </section>

      {/* Pricing Compact */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-white/10 p-8 flex flex-col bg-white/[0.02]">
              <div className="font-mono text-sm text-white/50 mb-2">TRY IT</div>
              <h3 className="text-2xl font-bold mb-4">Free Trial</h3>
              <div className="text-3xl font-mono mb-6">£0</div>
              <ul className="space-y-3 mb-8 text-sm text-white/70 font-mono flex-grow">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-white/30" /> 3 Studio listings</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-white/30" /> All 10 Lenses</li>
              </ul>
              <Button className="w-full bg-white text-black hover:bg-white/90 rounded-none font-mono">0s to start</Button>
            </div>
            
            <div className="border border-cyan-500/30 p-8 flex flex-col bg-cyan-500/5 relative">
              <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] font-mono px-2 py-1 font-bold">SELLER</div>
              <div className="font-mono text-sm text-cyan-400 mb-2">STUDIO</div>
              <h3 className="text-2xl font-bold mb-4">Starter</h3>
              <div className="text-3xl font-mono mb-6">£9.99<span className="text-sm text-white/50">/mo</span></div>
              <ul className="space-y-3 mb-8 text-sm text-white/70 font-mono flex-grow">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Unlimited listings</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Batch processing</li>
              </ul>
              <Button className="w-full bg-cyan-500 text-black hover:bg-cyan-400 rounded-none font-mono">Upgrade</Button>
            </div>

            <div className="border border-violet-500/30 p-8 flex flex-col bg-violet-500/5 relative">
              <div className="absolute top-0 right-0 bg-violet-500 text-white text-[10px] font-mono px-2 py-1 font-bold">BUYER</div>
              <div className="font-mono text-sm text-violet-400 mb-2">GUARD</div>
              <h3 className="text-2xl font-bold mb-4">Check</h3>
              <div className="text-3xl font-mono mb-6">£1.99<span className="text-sm text-white/50">/ea</span></div>
              <ul className="space-y-3 mb-8 text-sm text-white/70 font-mono flex-grow">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-400" /> Full risk report</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-400" /> Authenticity signals</li>
              </ul>
              <Button className="w-full bg-violet-500 text-white hover:bg-violet-400 rounded-none font-mono">Buy Credits</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-mono mb-8">Ready? Your first listing is 30 seconds away.</h2>
          <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-lg h-14 px-12 rounded-none mb-16">
            Start the clock
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-sm text-white/40 font-mono">
            <div>© {new Date().getFullYear()} List-LENS</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
