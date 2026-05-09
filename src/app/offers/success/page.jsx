"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, FileText, Headphones, BookOpen, Lock, Zap } from "lucide-react";
import Confetti from "react-confetti";
import { EMAIL } from "@/lib/constant";

export default function OffersSuccessPage() {
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
			title: "1000+ Hindi E-Books",
			desc: "High quality PDF files sorted by categories.",
			icon: <FileText className="w-6 h-6 text-white" />,
			url: "https://drive.google.com/drive/folders/1QG-aSpjZ-muhBsv1S8RXcz0QI8pwnvBT?usp=sharing",
			color: "from-blue-500 to-indigo-600",
			shadow: "shadow-blue-500/30"
		},
		{
			title: "Premium Audio Books",
			desc: "Listen to the best-selling audiobooks anywhere.",
			icon: <Headphones className="w-6 h-6 text-white" />,
			url: "https://drive.google.com/drive/folders/1JRHnhUfoketlZfr4uA9yMz3jkujJ3Gsz?usp=sharing",
			color: "from-rose-500 to-red-600",
			shadow: "shadow-rose-500/30"
		},
		{
			title: "Bonus Audio Books",
			desc: "Extra VIP premium audio content.",
			icon: <Zap className="w-6 h-6 text-white" />,
			url: "https://drive.google.com/drive/folders/1z6J2CPV2KGv0MZgy9JYDcDaKU0ritUwc?usp=sharing",
			color: "from-amber-500 to-orange-600",
			shadow: "shadow-amber-500/30"
		},
		{
			title: "Habit Tracker PDF",
			desc: "Printable habit tracker perfectly designed to build a reading habit.",
			icon: <BookOpen className="w-6 h-6 text-white" />,
			url: "https://drive.google.com/drive/folders/1dTjSEPP_ID82ChKmSXgaMMM_Eg7WmeEZ?usp=sharing",
			color: "from-emerald-500 to-green-600",
			shadow: "shadow-emerald-500/30"
		}
	];

	return (
		<div className="min-h-screen bg-slate-900 border-t-8 border-yellow-400 font-sans flex flex-col pb-20 relative overflow-hidden">
			{windowDimension.width > 0 && <Confetti
				width={windowDimension.width}
				height={windowDimension.height}
				recycle={false}
				numberOfPieces={300}
				gravity={0.15}
				colors={['#facc15', '#f43f5e', '#3b82f6', '#10b981']}
			/>}

			{/* Background Effects */}
			<div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
			<div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
			
			<div className="max-w-4xl mx-auto w-full px-4 pt-12 pb-8 text-center relative z-10">
				<motion.div 
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
					className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)] border-4 border-emerald-200">
					<CheckCircle2 className="w-10 h-10 text-white" />
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}>
					<h1 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-md">
						Payment Successful! 🎉
					</h1>
					<p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto">
						Your <strong className="text-white">1000+ Hindi E-Books & Audio Books</strong> mega bundle is securely unlocked. A copy of this link has also been emailed to you.
					</p>
				</motion.div>
			</div>

			<div className="max-w-3xl mx-auto w-full px-4 relative z-10">
				<motion.div 
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-10 shadow-2xl">
					
					<div className="flex items-center gap-2 text-yellow-400 font-bold mb-8 uppercase tracking-wider text-sm border-b border-white/10 pb-4">
						<Lock className="w-4 h-4" /> Lifetime Secure Access
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
								className="group flex flex-col md:flex-row items-center md:items-stretch gap-4 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-2xl p-4 transition-all">
								
								<div className={`w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg ${link.shadow}`}>
									{link.icon}
								</div>
								
								<div className="flex-1 text-center md:text-left py-1">
									<h3 className="text-xl font-bold text-white mb-1">{link.title}</h3>
									<p className="text-slate-400 text-sm font-medium">{link.desc}</p>
								</div>
								
								<div className="shrink-0 flex items-center justify-center w-full md:w-auto mt-2 md:mt-0">
									<div className={`w-full md:w-auto bg-gradient-to-r ${link.color} text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-shadow`}>
										Access Link <ExternalLink className="w-4 h-4" />
									</div>
								</div>
							</motion.a>
						))}
					</div>

					<div className="mt-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-emerald-400 text-sm flex items-start md:items-center gap-3">
						<CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 md:mt-0" />
						<p className="font-medium"><strong>Pro Tip:</strong> We recommend clicking the "Add shortcut to drive" icon while browsing the Google Drive folders to easily save them permanently to your account.</p>
					</div>

					<div className="mt-8 text-center text-slate-500 text-sm">
						If you face any issues, contact us at {EMAIL}
					</div>
				</motion.div>
			</div>
			
			{/* Workaround specifically for lucide-react import error inside map */}
			<Zap className="hidden" />
		</div>
	);
}
