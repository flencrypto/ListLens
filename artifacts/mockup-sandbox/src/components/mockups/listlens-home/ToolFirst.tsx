import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Sparkles, ShieldCheck, CheckCircle2, ChevronRight, UploadCloud, Camera, Tag, AlertTriangle, Zap, Search, Music, Watch, Book, Gamepad2, Shirt } from "lucide-react";
import "./_group.css";

export default function ToolFirst() {
  const [step, setStep] = useState(0);

  // Auto-advance the fake UI
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 1500);
      return () => clearTimeout(timer);
    } else if (step === 1) {
      const timer = setTimeout(() => setStep(2), 2000);
      return () => clearTimeout(timer);
    } else if (step === 2) {
      const timer = setTimeout(() => setStep(3), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [step]);

  return (
    <div className="min-h-[100dvh] bg-[#040a14] text-white selection:bg-[#22d3ee] selection:text-black font-sans flex flex-col">
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-[#040a14]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22d3ee] to-[#8b5cf6] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">List-LENS</span>
          </div>
          <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 font-medium">
            Sign up free
          </Button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col">
        {/* HERO: The Tool First */}
        <section className="relative pt-20 pb-32 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#22d3ee]/10 via-[#040a14] to-[#040a14] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
            
            <div className="text-center mb-12 animate-slide-up">
              <Badge variant="outline" className="border-[#22d3ee]/30 text-[#22d3ee] bg-[#22d3ee]/10 mb-6 px-4 py-1.5 text-sm rounded-full">
                Try Studio instantly
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Watch the AI build your listing.
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                No sign up required to try. Select a Lens, add photos, and get a complete, optimized listing in seconds.
              </p>
            </div>

            {/* Fake In-Browser UI */}
            <div className="w-full max-w-4xl bg-[#0a1222] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up delay-200 shadow-[#22d3ee]/10">
              
              {/* Fake Header */}
              <div className="h-14 border-b border-white/10 flex items-center px-6 bg-[#0f192b] justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  <div className="h-4 w-[1px] bg-white/10 mx-2" />
                  <span className="text-sm text-gray-400 font-medium">Studio Simulator</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30">ShoeLens Active</Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 min-h-[500px] divide-x divide-white/10">
                {/* Left Panel: Inputs */}
                <div className="p-8 flex flex-col gap-8 bg-[#0a1222]">
                  
                  {/* Step 1: Category */}
                  <div className={`transition-all duration-500 ${step >= 0 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">1. Select Lens</h3>
                      {step >= 1 && <CheckCircle2 className="w-4 h-4 text-green-400 animate-fade-in" />}
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <button className="px-4 py-2 rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee] text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> ShoeLens
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-medium flex items-center gap-2 opacity-50 cursor-not-allowed">
                        <Music className="w-4 h-4" /> RecordLens
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-medium flex items-center gap-2 opacity-50 cursor-not-allowed">
                        <Watch className="w-4 h-4" /> TechLens
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Upload */}
                  <div className={`transition-all duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-30 blur-[2px]'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">2. Add Photos</h3>
                      {step >= 2 && <CheckCircle2 className="w-4 h-4 text-green-400 animate-fade-in" />}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden relative group">
                        <img src="/__mockup/images/shoe-mockup-1.png" alt="Shoe Profile" className="w-full h-full object-cover" />
                        {step >= 2 && (
                          <div className="absolute inset-0 bg-[#22d3ee]/10 flex items-center justify-center animate-fade-in">
                            <div className="bg-[#040a14]/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-[#22d3ee] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Processed
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden relative">
                        <img src="/__mockup/images/shoe-mockup-2.png" alt="Shoe Sole" className="w-full h-full object-cover" />
                        {step >= 2 && (
                          <div className="absolute inset-0 bg-[#22d3ee]/10 flex items-center justify-center animate-fade-in delay-100">
                            <div className="bg-[#040a14]/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-[#22d3ee] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Processed
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Action */}
                  <div className={`mt-auto transition-all duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-30 blur-[2px]'}`}>
                     <Button className="w-full py-6 text-lg rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] hover:opacity-90 transition-opacity font-bold shadow-lg shadow-[#22d3ee]/20 text-white border-0"
                       disabled={step < 2}>
                       {step === 2 ? (
                         <span className="flex items-center gap-2">
                           <Sparkles className="w-5 h-5 animate-pulse-slow" /> Generating Listing...
                         </span>
                       ) : (
                         "Listing Ready"
                       )}
                     </Button>
                  </div>

                </div>

                {/* Right Panel: Output */}
                <div className="bg-[#040a14] p-8 relative flex flex-col fake-ui-scroll overflow-y-auto max-h-[600px]">
                  {step < 3 ? (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                      {step === 2 ? (
                         <>
                           <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#22d3ee] animate-spin" />
                           <p className="text-[#22d3ee] font-medium animate-pulse">Analysing images & market data...</p>
                         </>
                      ) : (
                        <>
                          <Sparkles className="w-12 h-12 text-white/10" />
                          <p className="text-gray-500 font-medium">Output will appear here</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6 animate-slide-up">
                      
                      {/* Price Band */}
                      <div className="flex items-start justify-between bg-[#22d3ee]/10 border border-[#22d3ee]/20 rounded-xl p-4 animate-fade-in delay-100">
                        <div>
                          <p className="text-[#22d3ee] text-sm font-semibold mb-1 flex items-center gap-2">
                            <Tag className="w-4 h-4" /> Market Value Estimate
                          </p>
                          <div className="text-2xl font-bold text-white">£145 - £165</div>
                          <p className="text-xs text-gray-400 mt-1">Based on 24 recent sales</p>
                        </div>
                        <Badge className="bg-[#22d3ee] text-[#040a14] hover:bg-[#22d3ee]">High Demand</Badge>
                      </div>

                      {/* Title */}
                      <div className="animate-fade-in delay-200">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Optimized Title (80 chars)</label>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium text-lg leading-tight">
                          Nike Air Jordan 1 Retro High OG 'Chicago' 2015 - UK 9 / US 10 - Excellent Cond
                        </div>
                      </div>

                      {/* Description */}
                      <div className="animate-fade-in delay-300 flex-grow">
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Generated Description</label>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm leading-relaxed space-y-4">
                          <p><strong>Condition:</strong> Excellent pre-owned condition. Uppers show minimal creasing. Soles have 95% tread remaining with slight heel drag.</p>
                          <p><strong>Details:</strong> 100% authentic Jordan 1 'Chicago' from the 2015 release. Classic varsity red, white and black colorway. Premium leather construction.</p>
                          <p><strong>Included:</strong> Original box and spare laces included.</p>
                        </div>
                      </div>

                      {/* Warnings */}
                      <div className="animate-fade-in delay-400">
                        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-yellow-500 text-sm font-medium">Missing Evidence</p>
                            <p className="text-xs text-yellow-500/80 mt-1">Consider adding a photo of the size tag and inside stitching to improve buyer trust.</p>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-xl font-medium py-6 animate-fade-in delay-500 mt-4">
                        Export to eBay
                      </Button>

                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 text-center animate-slide-up delay-700">
               <Button onClick={() => setStep(0)} variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full">
                 <Zap className="w-4 h-4 mr-2" /> Replay Demo
               </Button>
            </div>

          </div>
        </section>

        {/* What Just Happened Section */}
        <section className="py-24 bg-gradient-to-b from-[#040a14] to-[#0a1222] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">What just happened?</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                You just saw Studio in action. It's one half of the List-LENS platform. We build tools for both sides of the resale market.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Studio Card */}
              <Card className="bg-gradient-to-br from-[#0a1222] to-[#0a1222] border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="w-32 h-32 text-[#22d3ee]" />
                </div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-[#22d3ee]/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-[#22d3ee]" />
                  </div>
                  <CardTitle className="text-2xl text-white">Studio <span className="text-gray-500 text-lg font-normal ml-2">For Sellers</span></CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    Turn 3 photos into a high-converting listing in under 30 seconds.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#22d3ee] shrink-0" />
                      <span>AI auto-detects brand, model, and condition.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#22d3ee] shrink-0" />
                      <span>Generates SEO-optimized titles and rich descriptions.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#22d3ee] shrink-0" />
                      <span>Provides instant market valuation and pricing strategy.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Guard Card */}
              <Card className="bg-gradient-to-br from-[#0a1222] to-[#0a1222] border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShieldCheck className="w-32 h-32 text-[#8b5cf6]" />
                </div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6 text-[#8b5cf6]" />
                  </div>
                  <CardTitle className="text-2xl text-white">Guard <span className="text-gray-500 text-lg font-normal ml-2">For Buyers</span></CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    Paste a URL or upload photos to instantly verify authenticity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#8b5cf6] shrink-0" />
                      <span>Deep AI analysis of stitching, tags, and materials.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#8b5cf6] shrink-0" />
                      <span>Flags missing evidence and high-risk seller patterns.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#8b5cf6] shrink-0" />
                      <span>Probabilistic risk report—never just "fake" or "real".</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Lenses Grid */}
        <section className="py-24 bg-[#040a14]">
          <div className="max-w-7xl mx-auto px-6">
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
               <div>
                 <h2 className="text-3xl font-bold tracking-tight mb-4">10 Specialist Lenses</h2>
                 <p className="text-gray-400 max-w-xl">
                   Generic AI doesn't know the difference between a 1985 Chicago and a 2015 Retro. Our Lenses do.
                 </p>
               </div>
               <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 shrink-0">
                 View all Lenses
               </Button>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { name: "ShoeLens", icon: Sparkles, color: "text-[#22d3ee]", bg: "bg-[#22d3ee]/10", active: true },
                  { name: "RecordLens", icon: Music, color: "text-orange-400", bg: "bg-orange-400/10", active: true },
                  { name: "TechLens", icon: Gamepad2, color: "text-green-400", bg: "bg-green-400/10", active: true },
                  { name: "BookLens", icon: Book, color: "text-yellow-400", bg: "bg-yellow-400/10", active: true },
                  { name: "WatchLens", icon: Watch, color: "text-blue-400", bg: "bg-blue-400/10", active: true },
                  { name: "AntiquesLens", icon: Search, color: "text-stone-400", bg: "bg-stone-400/10", active: true },
                  { name: "ClothingLens", icon: Shirt, color: "text-pink-400", bg: "bg-pink-400/10", active: true },
                  { name: "CardLens", icon: Search, color: "text-gray-400", bg: "bg-white/5", active: false, label: "Coming Soon" },
                  { name: "AutoLens", icon: Search, color: "text-gray-400", bg: "bg-white/5", active: false, label: "Coming Soon" },
                  { name: "ToyLens", icon: Search, color: "text-gray-400", bg: "bg-white/5", active: false, label: "Coming Soon" },
                ].map((lens, i) => (
                  <Card key={i} className={`bg-[#0a1222] border-white/5 ${lens.active ? 'hover:border-white/20 cursor-pointer transition-colors' : 'opacity-60'}`}>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4 h-full">
                      <div className={`w-12 h-12 rounded-full ${lens.bg} flex items-center justify-center`}>
                        <lens.icon className={`w-6 h-6 ${lens.color}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{lens.name}</div>
                        {!lens.active && <div className="text-xs text-gray-500 mt-1">{lens.label}</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
             </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 bg-gradient-to-b from-[#0a1222] to-[#040a14] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Simple, transparent pricing.</h2>
              <p className="text-xl text-gray-400">Start free. Upgrade when you need more.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free */}
              <Card className="bg-[#040a14] border-white/10 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Free Trial</CardTitle>
                  <div className="text-4xl font-bold text-white mt-4 mb-2">£0</div>
                  <CardDescription>Perfect for testing the water.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-gray-500" /> 3 Studio Listings</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-gray-500" /> 1 Guard Check</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-gray-500" /> All Lenses included</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white">Start Free</Button>
                </CardFooter>
              </Card>

              {/* Studio Starter */}
              <Card className="bg-[#0a1222] border-[#22d3ee]/30 relative flex flex-col transform md:-translate-y-4 shadow-xl shadow-[#22d3ee]/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-[#22d3ee] text-[#040a14] hover:bg-[#22d3ee]">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-[#22d3ee]">Studio Starter</CardTitle>
                  <div className="text-4xl font-bold text-white mt-4 mb-2">£9.99<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                  <CardDescription>For regular sellers.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#22d3ee]" /> 50 Studio Listings/mo</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#22d3ee]" /> Advanced pricing insights</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#22d3ee]" /> Priority generation</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#22d3ee] hover:bg-[#22d3ee]/90 text-[#040a14] font-bold">Subscribe</Button>
                </CardFooter>
              </Card>

              {/* Guard PAYG */}
              <Card className="bg-[#040a14] border-white/10 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl text-[#8b5cf6]">Guard Check</CardTitle>
                  <div className="text-4xl font-bold text-white mt-4 mb-2">£1.99<span className="text-lg text-gray-500 font-normal">/ea</span></div>
                  <CardDescription>Pay as you go peace of mind.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#8b5cf6]" /> Single detailed risk report</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#8b5cf6]" /> Evidence highlighting</li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-[#8b5cf6]" /> Shareable link</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white">Buy Credits</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 relative overflow-hidden">
           <div className="absolute inset-0 bg-[#22d3ee]/5" />
           <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
             <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">List smarter. Buy safer.</h2>
             <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6 rounded-full font-medium">
                 Create free account <ChevronRight className="w-5 h-5 ml-2" />
               </Button>
               <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full font-medium">
                 Explore Lenses
               </Button>
             </div>
           </div>
        </section>
      </main>

      <footer className="py-8 border-t border-white/10 text-center text-sm text-gray-500">
         <p>© {new Date().getFullYear()} Mr.FLENS · List-LENS. All rights reserved.</p>
      </footer>
    </div>
  );
}
