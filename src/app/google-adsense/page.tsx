"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Star, ChevronDown, Zap, Users, Shield, TrendingUp, DollarSign, Activity } from "lucide-react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const features = [
  "100% AdSense Approval Strategy",
  "Safe Loading Methods (No Ban)",
  "High CPC Niche Selection",
  "Premium Premium Themes & Plugins",
  "Traffic Arbitrage Secrets",
  "Step-by-Step Video Modules",
  "Lifetime Access & Updates",
  "Secret Traffic Sources",
  "One-Time Payment",
  "Dedicated VIP Support"
];

const topics = [
  "AdSense Approval Masterclass",
  "How to Find $50+ CPC Keywords",
  "Automated Traffic Generation",
  "Safe AdSense Loading Techniques",
  "Avoiding Ad Limits & Bans",
  "Premium WordPress Setup",
  "Content Generation Secrets",
  "Social Media Arbitrage",
  "Scaling to $100/Day"
];

const lifeLessons = [
  "तेजी से AdSense अप्रूवल (Fast AdSense Approval)",
  "सुरक्षित लोडिंग तरीके (Safe Loading Methods)",
  "हाई CPC कीवर्ड्स (High CPC Keywords)",
  "ट्रैफिक आर्बिट्रेज (Traffic Arbitrage)",
  "अकाउंट बैन से बचाव (Protecting Account from Bans)",
  "प्रीमियम थीम्स (Premium Themes Access)",
  "डॉलर में कमाई (Earning in Dollars)"
];

const faqs = [
  { question: "क्या मुझे Life Time Access मिलेगा?", answer: "जी हाँ, एक बार पेमेंट करने के बाद आपको लाइफटाइम एक्सेस मिलेगा।" },
  { question: "क्या यह लोडिंग मेथड सुरक्षित है?", answer: "बिल्कुल, हम आपको 100% सुरक्षित और टेस्टेड तरीके सिखाते हैं जिससे आपके AdSense अकाउंट पर कोई खतरा नहीं होगा।" },
  { question: "Payment करने के बाद कोर्स कैसे मिलेगा?", answer: "पेमेंट कंफर्म होते ही आपको तुरंत वीडियो कोर्स, थीम्स और प्लगइन्स का डाउनलोड लिंक मिल जाएगा।" },
  { question: "क्या मुझे प्रीमियम थीम्स मुफ्त में मिलेंगी?", answer: "हाँ, इस कॉम्बो के साथ आपको GeneratePress, Astra Pro जैसी कई प्रीमियम थीम्स बिल्कुल मुफ्त दी जाएंगी।" },
  { question: "क्या कोर्स हिंदी में है?", answer: "जी हाँ, सभी वीडियो और गाइड आसान हिंदी भाषा में हैं ताकि आप सब कुछ अच्छे से समझ सकें।" }
];

export default function GoogleAdsensePage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 15, seconds: 0 });
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    email: "",
    phone: ""
  });

  const handleOpenCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstname || !formData.email || !formData.phone) {
      toast.error("Please fill in all details");
      return;
    }

    try {
      setIsProcessing(true);
      const payload = {
        amount: 299,
        productinfo: "Google AdSense Loading and Approval Course",
        firstname: formData.firstname,
        email: formData.email,
        phone: formData.phone,
        userId: "guest",
        productId: "adsense_course_299",
        finalAmount: 299,
        isOfferPurchase: true,
      };

      const response = await axios.post("/api/payu/initiate", payload);

      if (response.data.success) {
        const { hash, txnid, key, udf1, udf2, udf3 } = response.data;
        
        const form = document.createElement("form");
        form.action = "https://secure.payu.in/_payment"; 
        form.method = "POST";
        
        const createInput = (name: string, value: string) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          return input;
        };

        form.appendChild(createInput("key", key));
        form.appendChild(createInput("txnid", txnid));
        form.appendChild(createInput("amount", payload.amount.toString()));
        form.appendChild(createInput("productinfo", payload.productinfo));
        form.appendChild(createInput("firstname", payload.firstname));
        form.appendChild(createInput("email", payload.email));
        form.appendChild(createInput("phone", payload.phone));
        
        const baseUrl = window.location.origin;
        form.appendChild(createInput("surl", `${baseUrl}/api/payu/offers-callback`));
        form.appendChild(createInput("furl", `${baseUrl}/api/payu/offers-callback`));
        form.appendChild(createInput("hash", hash));
        
        form.appendChild(createInput("udf1", udf1));
        form.appendChild(createInput("udf2", udf2));
        form.appendChild(createInput("udf3", udf3));

        document.body.appendChild(form);
        form.submit();
      } else {
        toast.error(response.data.message || "Failed to initiate payment");
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("PayU initiation error:", error);
      toast.error(error.response?.data?.message || "Failed to connect to payment gateway");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 15, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const padZero = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#0a0a0d] font-sans selection:bg-emerald-500 selection:text-white pb-20 md:pb-0 text-slate-300">
      {/* Top Warning Bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white text-center py-2 px-4 text-[11px] md:text-sm font-bold shadow-md relative z-10 hidden sm:block uppercase tracking-wider">
        🚀 Start Earning $100/Day with our Secret AdSense Loading Protocol! Offer Ends Soon.
      </div>

      {/* Hero Section */}
      <section className="bg-[#0a0a0d] py-16 px-4 relative overflow-hidden">
        {/* Deep Tech Background Accents */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="mb-6 flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/30 px-4 py-1.5 rounded-full">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping absolute"></span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 relative"></span>
            <span className="text-emerald-400 font-bold text-sm tracking-wide">100% WORKING IN 2026</span>
          </motion.div>

          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-center mb-6 leading-tight text-white tracking-tight">
            Google AdSense <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
              Loading & Approval
            </span> <br/>
            Masterclass
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-2xl text-slate-400 text-center max-w-3xl mb-10 font-medium leading-relaxed">
            The only blueprint you need to get fast AdSense approvals and safely scale your earnings using underground traffic arbitrage methods.
          </motion.p>

          <div className="grid lg:grid-cols-2 gap-10 w-full items-center mt-4">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.15)] group bg-[#13131a] p-2">
              <div className="absolute -top-1 -left-1 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-black px-5 py-2 rounded-br-2xl z-20 shadow-lg uppercase text-xs tracking-wider">
                Unreleased Secret 🔥
              </div>
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center border border-white/5">
                {/* Simulated Video Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-blue-900/20"></div>
                <div className="absolute bg-[url('/offers/adsense.jpg')] bg-cover bg-center inset-0"></div>
                <div className="z-10 bg-white/10 backdrop-blur-md w-20 h-20 rounded-full flex items-center justify-center border border-white/20 cursor-pointer hover:scale-105 transition-transform">
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-2"></div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col justify-center">
              
              <div className="bg-[#13131a] rounded-2xl p-6 border border-white/10 shadow-xl mb-8">
                <h3 className="text-white font-bold text-xl mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                  What You'll Unlock Today:
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 group">
                      <div className="bg-emerald-500/20 p-1 rounded-full mt-0.5 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="text-slate-300 text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <motion.button 
                  onClick={handleOpenCheckout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-[#0a0a0d] text-xl font-black py-4 px-12 rounded-xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all w-full md:max-w-md flex flex-col items-center relative overflow-hidden group">
                  <span className="relative z-10 flex items-center gap-2">JOIN NOW FOR JUST ₹299 <Zap className="w-5 h-5"/></span>
                  <span className="text-[11px] font-bold opacity-70 mt-1 uppercase tracking-widest relative z-10">Instant Access Setup</span>
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </motion.button>
                <div className="mt-4 flex items-center gap-3">
                  <p className="text-slate-500 font-medium">Regular Price: <span className="line-through text-rose-500/80 font-bold ml-1">₹4,999</span></p>
                  <span className="h-1 w-1 rounded-full bg-slate-600"></span>
                  <p className="text-emerald-400 font-bold">Save 94%</p>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Edge */}
      <section className="py-12 bg-[#0f0f13] border-y border-white/5 relative z-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}>
            <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">₹1.2Cr+</div>
            <div className="text-emerald-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"><DollarSign className="w-4 h-4"/> Earnings Generated</div>
          </motion.div>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="pt-8 md:pt-0">
            <div className="text-4xl md:text-5xl font-black text-white mb-2 flex justify-center items-center gap-2">
              98%
            </div>
            <div className="text-blue-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"><Activity className="w-4 h-4"/> Success Rate</div>
          </motion.div>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="pt-8 md:pt-0">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">5,400+</div>
            <div className="text-rose-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"><Users className="w-4 h-4"/> Active Students</div>
          </motion.div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-20 md:py-28 px-4 bg-[#0a0a0d] relative overflow-hidden">
        {/* Abstract Glowing Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Inside The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Masterclass</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Everything you need to bypass Google's strict policies and start printing money safely.</p>
          </div>

          <div className="bg-[#13131a] border border-white/10 rounded-[2rem] p-8 md:p-14 shadow-2xl relative overflow-hidden group">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  key={idx} 
                  className="flex items-start gap-4 bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all duration-300">
                  <div className="bg-emerald-900/30 rounded-xl p-2 shrink-0 border border-emerald-500/20">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold leading-snug">{topic}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <p className="text-emerald-400 font-bold mb-6 text-lg bg-emerald-900/20 inline-block px-6 py-2 rounded-full border border-emerald-500/20">🔥 Includes $500+ Worth of Premium WP Themes & Plugins</p>
              <motion.button 
                onClick={handleOpenCheckout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-black font-black py-4 px-12 rounded-xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.2)] text-xl md:text-2xl transition-all block w-full md:w-max mx-auto">
                GET INSTANT ACCESS - ₹299
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Importance of Course */}
      <section className="py-24 bg-gradient-to-b from-[#13131a] to-[#0a0a0d] text-white relative border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-8 text-white tracking-tight">Why Do 99% Beginners Fail in AdSense?</h2>
          <p className="text-lg md:text-xl font-medium mb-12 text-slate-400 leading-relaxed max-w-3xl mx-auto">
            Most people waste months struggling to get AdSense approval, and even if they do, they get slapped with <strong className="text-rose-400">Ad Limits</strong> or <strong className="text-rose-400">Account Bans</strong> because they use outdated, risky methods.
            <br/><br/>
            <span className="text-emerald-400 font-bold">This masterclass reveals the exact underground protocols 6-figure bloggers use to stay under the radar and load safely.</span>
          </p>

          <div className="bg-[#0a0a0d] rounded-3xl p-8 border border-white/10 mt-16 max-w-3xl mx-auto relative shadow-2xl">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-black font-black px-6 py-2 rounded-full shadow-lg whitespace-nowrap text-sm md:text-base border-4 border-[#0a0a0d]">
              What You Will Learn
            </div>
            
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-left mt-8">
              {lifeLessons.map((lesson, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} className="flex items-center gap-3 bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-[14px] md:text-sm font-semibold text-slate-200">{lesson}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-[#050508] relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white inline-block pb-2 tracking-tight">
              Real Results From Students
            </h2>
            <div className="w-24 h-1.5 bg-blue-500 mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* Dark Mode Reviews */}
            <div className="space-y-6">
              <div className="bg-[#13131a] p-6 rounded-2xl border border-white/5 relative">
                <div className="absolute top-4 right-4"><Star className="w-6 h-6 text-yellow-500 fill-yellow-500"/></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex-shrink-0 overflow-hidden">
                    <img src="https://i.pravatar.cc/100?img=11" alt="avatar" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1">Vikas Sharma <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /></h4>
                    <p className="text-xs text-slate-400">Earned $450 in First Month</p>
                  </div>
                </div>
                <p className="text-slate-300 font-medium leading-relaxed">"Applied the loading methods and my CPC went from $0.02 to $1.4. The traffic arbitrage module alone is worth 10x the price of this course. Safe and effective."</p>
              </div>

              <div className="bg-[#13131a] p-6 rounded-2xl border border-white/5 relative ml-0 md:ml-8">
                <div className="absolute top-4 right-4"><Star className="w-6 h-6 text-yellow-500 fill-yellow-500"/></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex-shrink-0 overflow-hidden">
                    <img src="https://i.pravatar.cc/100?img=32" alt="avatar" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1">Neha Patel <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /></h4>
                    <p className="text-xs text-slate-400">Got Approval in 4 Days</p>
                  </div>
                </div>
                <p className="text-slate-300 font-medium leading-relaxed">"I was rejected 4 times by AdSense for 'Low Value Content'. Watched the approval module, made the exact changes, and got approved in just 4 days! Thanks a lot!"</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#13131a] p-6 rounded-2xl border border-white/5 relative">
                <div className="absolute top-4 right-4"><Star className="w-6 h-6 text-yellow-500 fill-yellow-500"/></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex-shrink-0 overflow-hidden">
                    <img src="https://i.pravatar.cc/100?img=68" alt="avatar" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1">Rohan K. <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /></h4>
                    <p className="text-xs text-slate-400">Scaled to $50/Day</p>
                  </div>
                </div>
                <p className="text-slate-300 font-medium leading-relaxed">"The premium themes included in the bundle are legit. Installed GeneratePress Pro, used their niche strategy, and my site speed + layout got me instant approval."</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-900/20 to-blue-900/20 p-8 rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center text-center h-[220px]">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />)}
                </div>
                <h3 className="text-3xl font-black text-white mb-2">4.9/5 Rating</h3>
                <p className="text-emerald-400 font-medium mb-4">Over 5,400+ Students</p>
                <div className="bg-white/10 text-white px-4 py-1.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-1 border border-white/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Buyers
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown CTA box */}
      <section className="py-16 bg-[#0a0a0d] relative">
        <div className="flex flex-col items-center bg-gradient-to-b from-[#13131a] to-[#0a0a0d] p-8 md:p-14 rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.1)] border border-emerald-500/20 max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500"></div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Price Increases to ₹4,999 In:</h3>
          
          <div className="flex gap-4 md:gap-6 mb-12 w-full justify-center">
            <div className="flex flex-col items-center w-20 md:w-28">
              <div className="w-full aspect-square bg-[#050508] rounded-2xl flex items-center justify-center text-4xl md:text-6xl font-black text-white border border-white/10 shadow-inner">
                {padZero(timeLeft.hours)}
              </div>
              <span className="text-xs font-bold text-slate-500 mt-3 uppercase tracking-wider">Hours</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-slate-600 mt-2">:</div>
            <div className="flex flex-col items-center w-20 md:w-28">
              <div className="w-full aspect-square bg-[#050508] rounded-2xl flex items-center justify-center text-4xl md:text-6xl font-black text-white border border-white/10 shadow-inner">
                {padZero(timeLeft.minutes)}
              </div>
              <span className="text-xs font-bold text-slate-500 mt-3 uppercase tracking-wider">Minutes</span>
            </div>
            <div className="text-4xl md:text-6xl font-black text-slate-600 mt-2">:</div>
            <div className="flex flex-col items-center w-20 md:w-28">
              <div className="w-full aspect-square bg-emerald-900/40 rounded-2xl flex items-center justify-center text-4xl md:text-6xl font-black text-emerald-400 border border-emerald-500/30">
                {padZero(timeLeft.seconds)}
              </div>
              <span className="text-xs font-bold text-slate-500 mt-3 uppercase tracking-wider">Seconds</span>
            </div>
          </div>
          
          <div className="w-full max-w-sm">
            <motion.button 
              onClick={handleOpenCheckout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-emerald-500 text-black font-black py-5 px-12 rounded-xl text-xl w-full flex items-center justify-center gap-3 transition-all hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              UNLOCK COURSE - ₹299
            </motion.button>
            <p className="text-center text-slate-500 mt-4 text-sm flex items-center justify-center gap-2">
              <Shield className="w-4 h-4"/> Secure PayU Checkout
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#050508] px-4 relative border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#13131a] rounded-2xl border border-white/5 overflow-hidden transition-all">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-6 font-bold text-white flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                  <span className="text-lg pr-4">{faq.question}</span>
                  <span className={`transform transition-transform bg-white/5 p-2 rounded-full flex-shrink-0 ${openFaq === idx ? 'rotate-180 text-emerald-400' : 'text-slate-500'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-slate-400 bg-[#13131a] font-medium pt-2 leading-relaxed">
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-20 text-slate-600 text-sm font-medium">
          <p>© 2026 AdSense Masterclass. All rights reserved.</p>
        </div>
      </section>

      {/* Floating CTA for Mobile */}
			<div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 md:hidden flex justify-between items-center">
				<div>
					<div className="text-xs text-slate-400 font-bold line-through">₹9,999 Original</div>
					<div className="text-xl font-black text-emerald-600">₹299/- Only</div>
				</div>
				<button 
					onClick={handleOpenCheckout}
					className="bg-gradient-to-r from-emerald-600 to-emerald-600 text-white font-black uppercase tracking-wide py-3 px-8 rounded-full shadow-lg shadow-emerald-500/40 active:scale-95 transition-transform">
					Buy Now
				</button>
			</div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#13131a] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden relative border border-white/10">
              
              {/* Header */}
              <div className="bg-[#1a1a24] p-6 text-white relative border-b border-white/5">
                <button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <h3 className="text-2xl font-black mb-1 text-white">Complete Purchase</h3>
                <p className="text-emerald-400 font-medium text-sm">Secure your spot & get instant access</p>
              </div>

              {/* Form */}
              <form onSubmit={handleCheckoutSubmit} className="p-6">
                <div className="flex justify-between items-center mb-6 bg-[#0a0a0d] p-4 rounded-xl border border-white/5">
                  <div>
                    <h4 className="font-bold text-white text-sm">AdSense Masterclass</h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">+ Premium Themes & Plugins</p>
                  </div>
                  <div className="text-2xl font-black text-white">₹299</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.firstname}
                      onChange={e => setFormData({...formData, firstname: e.target.value})}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#0a0a0d] border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 text-white font-medium"
                      placeholder="e.g. Rahul Kumar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#0a0a0d] border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 text-white font-medium"
                      placeholder="Course access will be sent here"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-1.5">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#0a0a0d] border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 text-white font-medium"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-8 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <>Pay Securely <Shield className="w-5 h-5" /></>
                  )}
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-4 text-slate-500">
                  <div className="flex items-center gap-1.5"><Shield size={14} className="text-emerald-500" /><span className="text-xs font-semibold">256-bit Secure</span></div>
                  <div className="flex items-center gap-1.5"><Zap size={14} className="text-blue-500" /><span className="text-xs font-semibold">Instant Delivery</span></div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
