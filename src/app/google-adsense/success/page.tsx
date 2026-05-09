"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, Video, ShieldCheck, FileText, Download, Zap } from "lucide-react";
import Confetti from "react-confetti";
import { EMAIL } from "@/lib/constant";

export default function GoogleAdsenseSuccessPage() {
  const [windowDimension, setWindowDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowDimension({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const downloadLinks = [
    {
      title: "Safe Loading & Arbitration Methods",
      desc: "Private strategies to load AdSense safely & avoid limits.",
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
      url: "https://drive.google.com/file/d/1gZ1weEjcYeraMFeB4pMiro6Xa9acmgyD/view?usp=sharing",
      color: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/30"
    },
    {
      title: "AdSense Approval Script/Method",
      desc: "Step-by-step video setup guide to secure quick approvals without rejections.",
      icon: <Video className="w-6 h-6 text-white" />,
      url: "https://drive.google.com/file/d/19YQDf3qCuzx1UzFLi5-J49xIS9ChE2Su/view?usp=sharing", // Update URL as needed
      color: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/30"
    },
    {
      title: "AdSense Approval Video Tutorials",
      desc: "Step-by-step video tutorials to secure quick approvals without rejections.",
      icon: <Download className="w-6 h-6 text-white" />,
      url: "https://youtube.com/playlist?list=PLrwGRGmMFZHeNk8YF2zz5oqM-kZtpk_qH&si=ToFfv3DF7Qz0Qlwm",
      color: "from-rose-500 to-red-600",
      shadow: "shadow-rose-500/30"
    },
  ];

  return (
    <div className="min-h-screen bg-[#050508] border-t-8 border-emerald-500 font-sans flex flex-col pb-20 relative overflow-hidden">
      {windowDimension.width > 0 && <Confetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={false}
        numberOfPieces={300}
        gravity={0.15}
        colors={['#10b981', '#3b82f6', '#0ea5e9', '#6ee7b7']}
      />}

      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto w-full px-4 pt-12 pb-8 text-center relative z-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)] border-4 border-white/10">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-md tracking-tight">
            Purchase Successful! 🚀
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto">
            Your <strong className="text-emerald-400">AdSense Masterclass & Premium Toolkit</strong> is securely unlocked. A copy of this link has also been emailed to you.
          </p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#13131a] rounded-3xl border border-white/10 p-6 md:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
          
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-8 uppercase tracking-wider text-sm border-b border-white/10 pb-4">
            <ShieldCheck className="w-5 h-5" /> Lifetime Secure Access Granted
          </div>

          <div className="grid gap-4">
            {downloadLinks.map((link, idx) => (
              <motion.a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (idx * 0.1) }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex flex-col md:flex-row items-center md:items-stretch gap-4 bg-[#0a0a0d] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.02] rounded-2xl p-4 transition-all">
                
                <div className={`w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg ${link.shadow}`}>
                  {link.icon}
                </div>
                
                <div className="flex-1 text-center md:text-left py-1">
                  <h3 className="text-lg font-bold text-white mb-1 leading-snug">{link.title}</h3>
                  <p className="text-slate-500 text-sm font-medium">{link.desc}</p>
                </div>
                
                <div className="shrink-0 flex items-center justify-center w-full md:w-auto mt-2 md:mt-0">
                  <div className={`w-full md:w-auto bg-gradient-to-r ${link.color} text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-shadow shadow-lg ${link.shadow}`}>
                    Access <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="mt-10 bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-5 text-emerald-400 text-sm flex items-start md:items-center gap-3">
            <Zap className="w-5 h-5 shrink-0 mt-0.5 md:mt-0" />
            <p className="font-medium"><strong>Pro Tip:</strong> Click the "Add shortcut to drive" icon while browsing the Google Drive folders to permanently attach them to your own Google account for easy syncing.</p>
          </div>

          <div className="mt-8 text-center text-slate-500 text-sm">
            For support or queries, contact us at <a href={`mailto:${EMAIL}`} className="text-emerald-400 hover:underline">{EMAIL}</a>
          </div>
        </motion.div>
      </div>
      
      {/* Workaround specifically for lucide-react import error inside map */}
      <Video className="hidden" />
    </div>
  );
}
