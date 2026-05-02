import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Camera, Zap, FileText, CheckCircle2, Search, ArrowDownCircle, ShieldCheck } from "lucide-react";
export default function PersonaSplit() {
  const [activePersona, setActivePersona] = useState<"seller" | "buyer">("seller");

  return (
    <div className="min-h-screen bg-[#040a14] text-slate-50 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Minimal Sticky Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#040a14]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-400 to-cyan-600 flex items-center justify-center font-bold text-[#040a14]">
            FL
          </div>
          <span className="font-semibold tracking-tight">Mr.FLENS · List-LENS</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10">
            Studio Log in
          </Button>
          <Button variant="ghost" className="text-violet-400 hover:text-violet-300 hover:bg-violet-400/10">
            Guard Log in
          </Button>
        </div>
      </nav>

      {/* Hero: Full-width split */}
      <section className="relative pt-20 h-[80vh] min-h-[600px] flex flex-col md:flex-row items-stretch">
        
        {/* Left: Seller (Cyan) */}
        <div 
          className={`relative flex-1 flex flex-col items-center justify-center p-8 transition-all duration-500 ease-in-out cursor-pointer group ${activePersona === "seller" ? "md:flex-[1.2] opacity-100" : "md:flex-1 opacity-70 hover:opacity-90"}`}
          onClick={() => setActivePersona("seller")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center max-w-md">
            <Badge variant="outline" className="mb-6 border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
              For Sellers
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              I'm selling
            </h1>
            <p className="text-xl text-cyan-100/70 mb-8 font-light">
              Photos → listing in 30s
            </p>
            <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-[#040a14] font-semibold px-8 h-14 rounded-full text-lg w-full md:w-auto shadow-[0_0_30px_rgba(34,211,238,0.3)] group-hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] transition-all">
              Start free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-px h-2/3 bg-gradient-to-b from-transparent via-white/20 to-transparent items-center justify-center">
          <div className="bg-[#040a14] text-white/50 text-sm px-2 py-4 rounded-full border border-white/10 uppercase tracking-widest">
            or
          </div>
        </div>

        {/* Right: Buyer (Violet) */}
        <div 
          className={`relative flex-1 flex flex-col items-center justify-center p-8 transition-all duration-500 ease-in-out cursor-pointer group ${activePersona === "buyer" ? "md:flex-[1.2] opacity-100" : "md:flex-1 opacity-70 hover:opacity-90"}`}
          onClick={() => setActivePersona("buyer")}
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-violet-900/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center max-w-md">
            <Badge variant="outline" className="mb-6 border-violet-500/30 text-violet-400 bg-violet-500/10">
              For Buyers
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              I'm buying
            </h1>
            <p className="text-xl text-violet-100/70 mb-8 font-light">
              AI risk check before you spend
            </p>
            <Button size="lg" className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 h-14 rounded-full text-lg w-full md:w-auto shadow-[0_0_30px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all">
              Check a listing <Search className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <ArrowDownCircle className="w-8 h-8 text-white/30" />
        </div>
      </section>

      {/* Dynamic Content Area based on persona */}
      <div className={`transition-all duration-700 ${activePersona === "seller" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 hidden"}`}>
        
        {/* Studio How it works */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">List smarter with Studio</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Upload a few photos and let our AI specialist Lenses do the heavy lifting. Perfect listings for eBay & Vinted in under 30 seconds.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-10 right-10 h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 -translate-y-1/2 z-0" />
            
            {[
              { icon: Camera, title: "1. Snap it", desc: "Take standard photos of your item. No studio lighting required." },
              { icon: Zap, title: "2. AI Analyzes", desc: "Our Lens identifies the model, condition, and market value instantly." },
              { icon: FileText, title: "3. Auto-drafted", desc: "Get a highly-converting title, description, and specs ready to post." }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl bg-[#0a1224] border border-white/5 shadow-xl">
                <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center mb-6 text-cyan-400">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature showcase with image */}
        <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-[#0a1224] to-[#040a14]">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-400 bg-cyan-500/10">10+ Specialist Lenses</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">AI trained for your specific niche.</h2>
              <p className="text-lg text-slate-400 mb-8">
                Generic AI writes generic listings. Our Lenses are trained on millions of successful sales data for specific categories, knowing exactly what buyers search for.
              </p>
              
              <ul className="space-y-4">
                {[
                  "ShoeLens: Extracts style codes and colorways",
                  "RecordLens: Detects pressings and media grades",
                  "TechLens: Finds exact specs and model numbers",
                  "BookLens: Identifies editions and ISBNs"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-cyan-400 shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="link" className="mt-8 text-cyan-400 p-0 hover:text-cyan-300">
                View all 10 Lenses (and 4 coming soon) <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full" />
              <img 
                src="/__mockup/images/studio-app-mockup.png" 
                alt="ListLens Studio App Interface" 
                className="relative z-10 rounded-2xl border border-white/10 shadow-2xl object-cover"
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, powerful pricing</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="bg-[#0a1224] border-white/5 p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-2 text-white">Free Trial</h3>
              <p className="text-slate-400 mb-6">Test the waters</p>
              <div className="text-4xl font-bold mb-8 text-white">£0</div>
              <ul className="space-y-3 mb-8 flex-1 text-slate-300">
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-slate-500" /> 3 AI-drafted listings</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-slate-500" /> Access to all Lenses</li>
              </ul>
              <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">Start Free Trial</Button>
            </Card>

            <Card className="bg-gradient-to-b from-cyan-950/50 to-[#0a1224] border-cyan-500/30 p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-cyan-500 text-[#040a14] text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <h3 className="text-2xl font-bold mb-2 text-cyan-400">Studio Starter</h3>
              <p className="text-cyan-100/50 mb-6">For serious sellers</p>
              <div className="text-4xl font-bold mb-8 text-white">£9.99<span className="text-lg text-slate-400 font-normal">/mo</span></div>
              <ul className="space-y-3 mb-8 flex-1 text-slate-300">
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-400" /> Unlimited AI listings</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-400" /> Batch processing</li>
                <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-400" /> Auto-pricing suggestions</li>
              </ul>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#040a14] font-bold">Subscribe</Button>
            </Card>
          </div>
        </section>
      </div>

      {/* Switch Prompt */}
      <div className="py-12 border-t border-white/5 flex justify-center">
         <Button 
           variant="ghost" 
           onClick={() => setActivePersona(activePersona === "seller" ? "buyer" : "seller")}
           className={`rounded-full px-6 py-6 border border-white/10 ${activePersona === "seller" ? "text-violet-400 hover:bg-violet-500/10" : "text-cyan-400 hover:bg-cyan-500/10"}`}
         >
           {activePersona === "seller" ? (
             <><ShieldCheck className="mr-2 w-5 h-5" /> Switch to buyer view (Guard) <ArrowRight className="ml-2 w-4 h-4" /></>
           ) : (
             <><Camera className="mr-2 w-5 h-5" /> Switch to seller view (Studio) <ArrowRight className="ml-2 w-4 h-4" /></>
           )}
         </Button>
      </div>

      {/* Buyer Placeholder for mockup completeness if toggled */}
      <div className={`transition-all duration-700 ${activePersona === "buyer" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 hidden"}`}>
         <section className="py-24 px-6 text-center">
            <h2 className="text-3xl font-bold mb-4 text-violet-400">Buy safer with Guard</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">Drop a URL or photo. Get an instant risk report before you spend your money. Just £1.99 per check.</p>
            <img src="/__mockup/images/lens-grid-bg.png" className="w-full max-w-4xl mx-auto rounded-2xl border border-violet-500/20 opacity-50" alt="Guard Analysis" />
         </section>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>© 2026 Mr.FLENS · List-LENS. All rights reserved.</p>
        <p className="mt-2">List smarter. Buy safer.</p>
      </footer>
    </div>
  );
}

