"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Star, Download, ChevronDown, Zap, Users, Shield } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const features = [
	"Read Anywhere Offline",
	"1000+ Hindi Books",
	"1000+ Hindi Audio Books",
	"Premium Quality",
	"Mobile Friendly",
	"Lifetime Access",
	"24/7 Premium Support",
	"One time Payment",
	"All Best Selling Books",
	"High Quality Audio and E-Book Format"
];

const topics = [
	"Business and Motivation",
	"Sales and Marketing",
	"Biographies of Billionaires",
	"Self Development and Growth",
	"Success and Passive Income",
	"Investing (Stock Market/Real Estate)",
	"Business Ideas and Startup",
	"History and Spiritual Books",
	"Philosophy and Psychology",
	"Popular Novels",
	"Best Selling Books"
];

const lifeLessons = [
	"कम समय में ज्यादा ज्ञान (Learn more in less time)",
	"समय का सही उपयोग (Proper use of time)",
	"दिमाग की एकाग्रता (Mental focus)",
	"तनाव कम करना (Reduce stress)",
	"सकारात्मक सोच (Positive thinking)",
	"पैसों की समझ (Financial literacy)",
	"सफलता के रहस्य (Secrets of success)"
];

const faqs = [
	{ question: "क्या मुझे Life Time Access मिलेगा?", answer: "जी हाँ, एक बार पेमेंट करने के बाद आपको लाइफटाइम एक्सेस मिलेगा।" },
	{ question: "Payment करने के बाद Books कैसे मिलेगी?", answer: "पेमेंट कंफर्म होते ही आपको तुरंत डाउनलोड लिंक मिल जाएगा, जिसे आप अपने मोबाइल या कंप्यूटर में सेव कर सकते हैं।" },
	{ question: "क्या बुक्स हिंदी में हैं?", answer: "जी हाँ, इस कॉम्बो में सभी ई-बुक्स और ऑडियो बुक्स हिंदी भाषा में उपलब्ध हैं।" },
	{ question: "मेरे पैसे कट गए लेकिन डाउनलोड लिंक नहीं मिला?", answer: "कभी-कभी तकनीकी कारणों से 5-10 मिनट लग सकते हैं। आप हमें हमारे सपोर्ट पर मेल कर सकते हैं।" },
	{ question: "क्या मैं इसे मोबाइल में पढ़/सुन सकता हूँ?", answer: "बिल्कुल! सभी बुक्स मोबाइल-फ्रेंडली फॉर्मेट (PDF/MP3) में हैं।" }
];

export default function BookOfferPage() {
	const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 15, seconds: 0 });
	const [openFaq, setOpenFaq] = useState(0);
	const [showCheckoutModal, setShowCheckoutModal] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [formData, setFormData] = useState({
		firstname: "",
		email: "",
		phone: ""
	});

	const handleOpenCheckout = (e) => {
		e.preventDefault();
		setShowCheckoutModal(true);
	};

	const handleCheckoutSubmit = async (e) => {
		e.preventDefault();
		if (!formData.firstname || !formData.email || !formData.phone) {
			toast.error("Please fill in all details");
			return;
		}

		try {
			setIsProcessing(true);
			const payload = {
				amount: 99,
				productinfo: "1000+ Hindi E-Books and Audio Books Combo",
				firstname: formData.firstname,
				email: formData.email,
				phone: formData.phone,
				userId: "guest", // Placeholder for unauthenticated user
				productId: "hindi_ebook_combo_99",
				finalAmount: 99,
				isOfferPurchase: true,
			};

			const response = await axios.post("/api/payu/initiate", payload);

			if (response.data.success) {
				const { hash, txnid, key, udf1, udf2, udf3 } = response.data;
				
				const form = document.createElement("form");
				form.action = "https://secure.payu.in/_payment"; 
				form.method = "POST";
				
				const createInput = (name, value) => {
					const input = document.createElement("input");
					input.type = "hidden";
					input.name = name;
					input.value = value;
					return input;
				};

				form.appendChild(createInput("key", key));
				form.appendChild(createInput("txnid", txnid));
				form.appendChild(createInput("amount", payload.amount));
				form.appendChild(createInput("productinfo", payload.productinfo));
				form.appendChild(createInput("firstname", payload.firstname));
				form.appendChild(createInput("email", payload.email));
				form.appendChild(createInput("phone", payload.phone));
				
				const baseUrl = window.location.origin;
				// Adjust this to point to the actual success processing route from the main shop API
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
		} catch (error) {
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

	const padZero = (num) => num.toString().padStart(2, '0');

	return (
		<div className="min-h-screen bg-slate-50 font-sans selection:bg-rose-500 selection:text-white pb-20 md:pb-0">
			{/* Top Warning Bar */}
			<div className="bg-yellow-400 text-black text-center py-2 px-4 text-[11px] md:text-sm font-bold shadow-md relative z-10 hidden sm:block">
				रातों-रात कोई भी सफल नहीं होता, अगर आपको सफल होना है तो आपको आज से ही शुरुआत करनी होगी!
			</div>

			{/* Hero Section */}
			<section className="bg-black text-white py-12 px-4 relative overflow-hidden">
				<div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
				<div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
				
				<div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
					<motion.h1 
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-center mb-4 leading-tight">
						<span className="text-yellow-400 drop-shadow-lg">1000+ E-Books</span> and Audio Books<br/>
						<span className="text-emerald-400 drop-shadow-lg text-2xl md:text-3xl mt-2 inline-block">जो आपकी जिंदगी बदल देंगी</span>
					</motion.h1>

					<div className="grid lg:grid-cols-2 gap-10 mt-8 w-full items-center">
						<motion.div 
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="relative rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl shadow-rose-500/20 group">
							<div className="absolute -top-1 -left-1 bg-red-600 text-white font-bold px-4 py-1 rounded-br-2xl z-20 shadow-lg">
								Top Rated 🔥
							</div>
							<div className="aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-8 relative">
								<div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
								<div className="text-center z-10">
									<h3 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl mb-4 text-shadow-lg leading-tight">अमीरों की सीक्रेट बुक्स 📚</h3>
									<p className="text-lg text-yellow-400 font-bold border-2 border-yellow-400 inline-block px-6 py-2 rounded-full bg-black/50 backdrop-blur-sm">हिंदी ऑडियो और ई-बुक्स</p>
								</div>
							</div>
						</motion.div>

						<motion.div 
							initial={{ x: 20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ delay: 0.4 }}
							className="flex flex-col justify-center">
							
							<div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl mb-8">
								<h3 className="text-yellow-400 font-bold text-xl mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
									<CheckCircle2 className="w-5 h-5 text-yellow-400" />
									इस पैकेज में आपको क्या मिलेगा:
								</h3>
								<div className="grid md:grid-cols-2 gap-3">
									{features.map((feature, idx) => (
										<div key={idx} className="flex items-center gap-2 group">
											<div className="bg-emerald-500/20 p-0.5 rounded-full">
												<CheckCircle2 className="w-4 h-4 text-emerald-400" />
											</div>
											<span className="text-gray-200 text-sm font-medium">{feature}</span>
										</div>
									))}
								</div>
							</div>

							<div className="text-center flex flex-col items-center">
								<p className="text-emerald-400 font-bold mb-2 animate-pulse bg-emerald-900/40 px-4 py-1 rounded-full border border-emerald-500/20">सीमित समय के लिए स्पेशल ऑफर!</p>
								<motion.button 
									onClick={handleOpenCheckout}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="bg-gradient-to-b from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-2xl font-black py-4 px-12 rounded-full shadow-[0_0_40px_rgba(225,29,72,0.5)] border-2 border-rose-300 transition-all w-full md:max-w-sm flex flex-col items-center group relative overflow-hidden">
									<span className="relative z-10">JUST ₹99/- ONLY</span>
									<span className="text-[10px] font-medium opacity-80 mt-1 uppercase tracking-widest relative z-10">Instant Download Access</span>
									<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
								</motion.button>
								<p className="mt-4 text-gray-400 font-medium flex items-center justify-center gap-2">
									Original Price: <span className="line-through text-red-500/80 font-bold text-lg">₹9,999</span>
								</p>
							</div>

						</motion.div>
					</div>
				</div>
			</section>

			{/* Book Categories Showcase */}
			<section className="py-16 md:py-24 px-4 bg-white relative overflow-hidden">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-5xl font-black text-rose-600 mb-4 drop-shadow-sm">
							1000+ किताबें <span className="text-slate-800">कौन सी श्रेणी की होंगी?</span>
						</h2>
						<div className="w-24 h-1.5 bg-yellow-400 mx-auto rounded-full"></div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-20">
						<Image src="/offers/img1.jpg" alt="Offer" width={500} height={500} />
						<Image src="/offers/img3.jpg" alt="Offer" width={500} height={500} />
						<Image src="/offers/img4.jpg" alt="Offer" width={500} height={500} />
						<Image src="/offers/img5.jpg" alt="Offer" width={500} height={500} />
					</div>

					{/* Topics List with Yellow Accent */}
					<div className="bg-[#111] border-2 border-yellow-500/20 rounded-[2rem] p-8 md:p-14 shadow-2xl relative overflow-hidden group">
						<div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-400/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-yellow-400/10 transition-colors duration-1000"></div>
						
						<h3 className="text-2xl md:text-3xl font-black text-yellow-400 mb-10 text-center border-b border-yellow-500/20 pb-4 mx-auto uppercase tracking-wide">
							What you'll get in this combo
						</h3>
						
						<div className="grid md:grid-cols-2 gap-y-5 gap-x-12 max-w-4xl mx-auto">
							{topics.map((topic, idx) => (
								<motion.div 
									initial={{ opacity: 0, x: -20 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ delay: idx * 0.05 }}
									key={idx} className="flex items-center gap-4 bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all border border-white/5">
									<div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-1.5 shadow-md">
										<CheckCircle2 className="w-4 h-4 text-white" />
									</div>
									<span className="text-slate-300 font-semibold">{topic}</span>
								</motion.div>
							))}
						</div>
						
						<div className="mt-14 text-center relative z-10 bg-white/5 rounded-2xl p-6 border border-white/10 max-w-2xl mx-auto">
							<p className="text-emerald-400 font-bold mb-6 text-lg">जी हाँ! यह सभी ई-बुक्स और ऑडियो बुक्स आपको मिलेंगी, वह भी सिर्फ एक बार पेमेंट करके।</p>
							<motion.button 
								onClick={handleOpenCheckout}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="bg-gradient-to-r from-rose-600 to-red-700 text-white font-black py-4 px-12 rounded-full shadow-[0_10px_30px_rgba(225,29,72,0.4)] hover:shadow-[0_15px_40px_rgba(225,29,72,0.6)] border border-rose-400/50 text-xl md:text-2xl transition-all block w-max mx-auto text-center w-full">
								BUY NOW @ JUST ₹99/- 🔥
							</motion.button>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Edge */}
			<section className="py-12 bg-white border-t border-slate-100 relative">
				<div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
					<motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}>
						<div className="text-5xl font-black text-rose-600 mb-2 drop-shadow-sm">28,889</div>
						<div className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"><Users className="w-4 h-4"/> Happy Readers</div>
					</motion.div>
					<motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="pt-8 md:pt-0">
						<div className="text-5xl font-black text-yellow-500 mb-2 flex justify-center items-center gap-2 drop-shadow-sm">
							4.9 <Star className="w-8 h-8 fill-yellow-500 text-yellow-500"/>
						</div>
						<div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Customer Rating</div>
					</motion.div>
					<motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="pt-8 md:pt-0">
						<div className="text-5xl font-black text-emerald-500 mb-2 drop-shadow-sm">1,000+</div>
						<div className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"><Download className="w-4 h-4"/> eBooks Included</div>
					</motion.div>
				</div>
			</section>

			{/* Importance of Books */}
			<section className="py-24 bg-gradient-to-b from-[#7A0016] to-[#4A000A] text-white relative">
				<div className="absolute inset-x-0 top-0 h-10 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 20%, 0 100%)' }}></div>
				<div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000&auto=format&fit=crop')] opacity-[0.05] bg-cover bg-center mix-blend-overlay"></div>
				
				<div className="max-w-4xl mx-auto px-4 text-center relative z-10 pt-10">
					<h2 className="text-3xl md:text-5xl font-black mb-8 text-yellow-400 drop-shadow-md tracking-tight">जीवन में किताब का महत्व</h2>
					<p className="text-lg md:text-2xl font-medium mb-12 text-rose-100 leading-relaxed max-w-3xl mx-auto">
						"जीवन में आप जो भी बनना चाहते हैं या करना चाहते हैं, वो सब कुछ 1 किताब में पहले से लिखा हुआ है, आपको बस वो किताब ढूंढने और पढ़ने की देरी है।"
						<br/><br/>
						<span className="text-white font-bold bg-white/10 px-6 py-3 rounded-xl inline-block shadow-lg border border-white/5 backdrop-blur-md">आप जब भी 1 किताब पढ़ते हैं तो आपकी जिंदगी में कुछ ना कुछ बदलाव जरूर आता है।</span>
					</p>

					<div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 border border-white/10 shadow-2xl mt-16 max-w-3xl mx-auto relative">
						<div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-[#7A0016] font-black px-8 py-3 rounded-full shadow-xl whitespace-nowrap text-lg md:text-xl border-4 border-[#7A0016]">
							किताबें आपको क्या सिखाती हैं?
						</div>
						
						<div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-left mt-8">
							{lifeLessons.map((lesson, idx) => (
								<motion.div 
									initial={{ opacity: 0, y: 10 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: idx * 0.1 }}
									key={idx} className="flex items-center gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
									<Star className="w-5 h-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
									<span className="text-[15px] md:text-base font-medium text-rose-50">{lesson}</span>
								</motion.div>
							))}
						</div>
					</div>

					<div className="mt-16 bg-black/30 rounded-3xl  p-8 border border-white/10 inline-block">
						<p className="text-yellow-400 font-bold text-lg md:text-xl mb-6">इन सभी किताबों को पढ़ने के लिए आपको हजारों रुपये खर्च करने पड़ सकते हैं!</p>
						<motion.button 
							onClick={handleOpenCheckout}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="bg-white text-[#7A0016] hover:bg-yellow-400 font-black py-4 px-4 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] text-lg md:text-2xl transition-all border-4 border-white/20 block mt-6 mx-auto sm:mx-0">
							<span className="relative z-10">GRAB ALL FOR JUST ₹99/- 🔥</span>
						</motion.button>
						<p className="mt-6 font-medium text-rose-300 text-sm">ऑफर कुछ ही समय के लिए उपलब्ध है। अभी डाउनलोड करें!</p>
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<section className="py-24 px-4 bg-slate-50 relative overflow-hidden">
				<div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl"></div>
				<div className="max-w-5xl mx-auto relative z-10">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-[#7A0016] to-rose-600 bg-clip-text text-transparent inline-block pb-2 drop-shadow-sm">
							eBooks खरीद कर लोगों ने क्या कहा?
						</h2>
						<div className="w-24 h-1.5 bg-rose-500 mx-auto rounded-full mt-4"></div>
					</div>

					<div className="grid md:grid-cols-2 gap-8 mb-20">
						{/* Facebook Commment Style */}
						<div className="space-y-6">
							<div className="bg-white p-6 rounded-2xl shadow-[0_5px_30px_rgba(0,0,0,0.05)] border border-slate-100 relative">
								<div className="absolute top-4 right-4 text-blue-600 font-bold text-lg bg-blue-50 w-8 h-8 flex items-center justify-center rounded-full">f</div>
								<div className="flex items-start gap-4 mb-4">
									<div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-blue-100">
										<img src="https://i.pravatar.cc/100?img=11" alt="avatar" />
									</div>
									<div>
										<h4 className="font-bold text-slate-800 flex items-center gap-1">Manish Kumar <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500" /></h4>
										<p className="text-xs text-slate-500 font-medium">2 days ago</p>
									</div>
								</div>
								<p className="text-slate-700 font-medium leading-relaxed">"This collection is unbelievable! I paid 99 Rs thinking it might be a scam, but I received the Google Drive link instantly. The audiobooks are very clear and helpful."</p>
								<div className="flex gap-4 mt-4 pt-4 border-t border-slate-100 text-slate-500 text-sm font-semibold">
									<span className="text-blue-600 cursor-pointer hover:underline flex items-center gap-1">Like (142)</span>
									<span className="cursor-pointer hover:underline">Reply</span>
								</div>
							</div>

							<div className="bg-white p-6 rounded-2xl shadow-[0_5px_30px_rgba(0,0,0,0.05)] border border-slate-100 relative ml-0 md:ml-8">
								<div className="absolute top-4 right-4 text-pink-600 font-bold text-lg bg-pink-50 w-8 h-8 flex items-center justify-center rounded-full">ig</div>
								<div className="flex items-start gap-4 mb-4">
									<div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-pink-100">
										<img src="https://i.pravatar.cc/100?img=32" alt="avatar" />
									</div>
									<div>
										<h4 className="font-bold text-slate-800 flex items-center gap-1">Riya Sharma</h4>
										<p className="text-xs text-slate-500 font-medium">1 week ago</p>
									</div>
								</div>
								<p className="text-slate-700 font-medium leading-relaxed">"As a student, buying physical books is expensive. This 99Rs deal is literally a lifesaver. Reading 'Rich Dad Poor Dad' in Hindi right now. Highly recommended!! ❤️😍"</p>
							</div>
						</div>

						<div className="space-y-6">
							<div className="bg-white p-6 rounded-2xl shadow-[0_5px_30px_rgba(0,0,0,0.05)] border border-slate-100 relative">
								<div className="absolute top-4 right-4 text-blue-600 font-bold text-lg bg-blue-50 w-8 h-8 flex items-center justify-center rounded-full">f</div>
								<div className="flex items-start gap-4 mb-4">
									<div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-blue-100">
										<img src="https://i.pravatar.cc/100?img=68" alt="avatar" />
									</div>
									<div>
										<h4 className="font-bold text-slate-800 flex items-center gap-1">Sanjay Singh <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500" /></h4>
										<p className="text-xs text-slate-500 font-medium">Yesterday</p>
									</div>
								</div>
								<p className="text-slate-700 font-medium leading-relaxed">"Quality is 10/10. All folders are well organized by topic. Started listening to the business audiobooks during my commute to work. Best 99 rupees spent."</p>
								<div className="flex gap-4 mt-4 pt-4 border-t border-slate-100 text-slate-500 text-sm font-semibold">
									<span className="text-blue-600 cursor-pointer hover:underline flex items-center gap-1">Like (89)</span>
									<span className="cursor-pointer hover:underline">Reply</span>
								</div>
							</div>
							
							<div className="bg-white p-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-2 border-yellow-400/20 flex flex-col items-center justify-center text-center mt-8 h-[220px]">
								<div className="flex gap-1 mb-4 bg-slate-50 px-4 py-2 rounded-full">
									{[...Array(5)].map((_, i) => <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />)}
								</div>
								<h3 className="text-3xl font-black text-slate-800 mb-2 drop-shadow-sm">4.9 Out Of 5 Rating</h3>
								<p className="text-slate-500 font-medium mb-4">Based on 28,000+ Reviews</p>
								<div className="bg-emerald-50 text-emerald-700 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
									<CheckCircle2 className="w-3 h-3" /> 100% Verified Buyers
								</div>
							</div>
						</div>
					</div>

					{/* Countdown CTA box */}
					<div className="flex flex-col items-center bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_20px_60px_rgba(225,29,72,0.15)] border border-rose-100 max-w-3xl mx-auto relative overflow-hidden">
						<div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-yellow-400 via-rose-500 to-rose-700"></div>
						
						<h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 border-b-2 border-slate-100 pb-4 inline-block px-8">ऑफर समाप्त होने में समय:</h3>
						
						<div className="flex gap-3 md:gap-6 mb-10 w-full justify-center">
							<div className="flex flex-col items-center w-20 md:w-24">
								<div className="w-full aspect-square bg-slate-900 rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-black text-white shadow-inner shadow-black/50 border-b-4 border-slate-700">
									{padZero(timeLeft.hours)}
								</div>
								<span className="text-sm font-bold text-slate-500 mt-3 uppercase tracking-wider">Hours</span>
							</div>
							<div className="text-4xl md:text-6xl font-black text-slate-300 mt-2">:</div>
							<div className="flex flex-col items-center w-20 md:w-24">
								<div className="w-full aspect-square bg-slate-900 rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-black text-white shadow-inner shadow-black/50 border-b-4 border-slate-700">
									{padZero(timeLeft.minutes)}
								</div>
								<span className="text-sm font-bold text-slate-500 mt-3 uppercase tracking-wider">Minutes</span>
							</div>
							<div className="text-4xl md:text-6xl font-black text-slate-300 mt-2">:</div>
							<div className="flex flex-col items-center w-20 md:w-24">
								<div className="w-full aspect-square bg-rose-600 rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-black text-white shadow-inner shadow-rose-900/50 border-b-4 border-rose-800 relative overflow-hidden">
									{padZero(timeLeft.seconds)}
								</div>
								<span className="text-sm font-bold text-slate-500 mt-3 uppercase tracking-wider">Seconds</span>
							</div>
						</div>
						
						<motion.button 
							onClick={handleOpenCheckout}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="bg-gradient-to-r from-red-600 to-rose-700 text-white font-black py-4 md:py-5 px-12 rounded-full shadow-[0_15px_40px_rgba(225,29,72,0.4)] hover:shadow-[0_20px_50px_rgba(225,29,72,0.5)] border border-rose-400 text-xl md:text-2xl w-full max-w-sm flex items-center justify-center gap-3 transition-all relative overflow-hidden group">
							<Download className="w-6 h-6 md:w-7 md:h-7 relative z-10" /> 
							<span className="relative z-10">JUST ₹99/- ONLY</span>
							<div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
						</motion.button>
					</div>
				</div>
			</section>

			{/* Value Section */}
			<section className="py-24 bg-black text-white relative border-y-8 border-yellow-400">
				<div className="absolute inset-0 bg-gradient-to-t from-black via-rose-950/20 to-black"></div>
				<div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop')] opacity-[0.03] bg-cover mix-blend-overlay"></div>
				
				<div className="max-w-5xl mx-auto px-4 text-center relative z-10">
					<h2 className="text-3xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-white drop-shadow-lg">
						आपके पास 2 OPTION हैं, आप क्या चुनेंगे?
					</h2>
					<div className="flex justify-center mb-4">
						<Image src="/offers/img6.jpg" alt="Offer" width={600} height={600} />
					</div>
					
					

					<div className="bg-gradient-to-b from-slate-900 to-black rounded-[3rem] p-8 md:p-16 border-t border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
						<div className="absolute top-0 right-0 p-8 opacity-10"><Zap className="w-48 h-48 text-yellow-500 rotate-12" /></div>
						
						<h3 className="text-2xl md:text-4xl font-black text-white mb-6 drop-shadow-lg leading-tight relative z-10">
							1000 से ज्यादा Hindi E-Books and Audio Books
						</h3>
						
						<div className="bg-yellow-400/10 border-y border-yellow-400/30 py-6 my-8 relative z-10">
							<p className="text-xl md:text-3xl text-yellow-400 font-black leading-relaxed">
								15,000₹ से ज्यादा वैल्यू का डाटा Download करें<br/><span className="text-white mt-2 inline-block">वह भी सिर्फ 99/- में!</span>
							</p>
						</div>
						
						{/* Price Display */}
						<div className="bg-white text-slate-900 rounded-2xl p-6 inline-flex items-center justify-center gap-6 mb-10 mx-auto shadow-[0_10px_30px_rgba(255,255,255,0.1)] border-4 border-slate-200 relative z-10">
							<span className="font-mono font-black text-4xl md:text-6xl text-[#111] tracking-tighter">₹99<span className="text-2xl md:text-4xl text-slate-400">/-</span></span>
							<div className="h-16 w-1 bg-slate-200 rounded-full"></div>
							<div className="text-left">
								<span className="text-sm font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded">One Time Fee</span>
								<br/>
								<span className="text-lg md:text-xl font-bold text-slate-600 mt-1 inline-block">Lifetime Access!</span>
							</div>
						</div>
						
						<div className="relative z-10 max-w-sm mx-auto">
							<p className="text-emerald-400 font-black text-xl mb-4 bg-emerald-900/40 py-2 rounded-xl border border-emerald-500/20">परंतु 'सिर्फ 99/- में'</p>
							<motion.button 
								onClick={handleOpenCheckout}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="bg-yellow-400 text-black hover:bg-yellow-500 font-black py-4 md:py-5 px-12 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.4)] border-4 border-yellow-200 text-xl md:text-2xl w-full block text-center">
								<span className="relative z-10">DOWNLOAD NOW</span>
							</motion.button>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-12 bg-white px-4 relative">
				<div className="max-w-3xl mx-auto">
					<div className="text-center mb-6">
						<h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-4 inline-block drop-shadow-sm">
							अक्सर पूछे जाने वाले सवाल (FAQs)
						</h2>
						<div className="w-24 h-1.5 bg-yellow-400 mx-auto rounded-full mt-2"></div>
					</div>

					<div className="space-y-4">
						{faqs.map((faq, idx) => (
							<div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300">
								<button 
									onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
									className="w-full text-left p-6 font-bold text-slate-800 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
									<span className="text-lg pr-4">{faq.question}</span>
									<span className={`transform transition-transform bg-slate-100 p-2 rounded-full flex-shrink-0 ${openFaq === idx ? 'rotate-180 text-rose-500 bg-rose-50' : 'text-slate-500'}`}>
										<ChevronDown className="w-5 h-5" />
									</span>
								</button>
								<AnimatePresence>
									{openFaq === idx && (
										<motion.div 
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											className="px-6 pb-6 text-slate-600 bg-white font-medium border-t border-slate-100 pt-4 leading-relaxed">
											{faq.answer}
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						))}
					</div>
				</div>
				<div className="text-center mt-20 text-slate-400 text-sm font-medium">
					<p>© 2026 E-Books Combo Offer. All rights reserved.</p>
					<div className="flex justify-center gap-4 mt-4 text-xs">
						<span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
						<span className="hover:text-slate-600 cursor-pointer">Terms & Conditions</span>
						<span className="hover:text-slate-600 cursor-pointer">Refund Policy</span>
					</div>
				</div>
			</section>

			{/* Floating CTA for Mobile */}
			<div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 md:hidden flex justify-between items-center">
				<div>
					<div className="text-xs text-slate-400 font-bold line-through">₹9,999 Original</div>
					<div className="text-xl font-black text-rose-600">₹99/- Only</div>
				</div>
				<button 
					onClick={handleOpenCheckout}
					className="bg-gradient-to-r from-rose-600 to-red-600 text-white font-black uppercase tracking-wide py-3 px-8 rounded-full shadow-lg shadow-rose-500/40 active:scale-95 transition-transform">
					Buy Now
				</button>
			</div>

			{/* Checkout Modal */}
			<AnimatePresence>
				{showCheckoutModal && (
					<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
						<motion.div 
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-100">
							
							{/* Header */}
							<div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white relative">
								<button 
									onClick={() => setShowCheckoutModal(false)}
									className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
								</button>
								<h3 className="text-2xl font-black mb-1 text-yellow-400">Checkout</h3>
								<p className="text-slate-300 font-medium text-sm">Fill details to get instant download access</p>
							</div>

							{/* Form */}
							<form onSubmit={handleCheckoutSubmit} className="p-6">
								<div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
									<div>
										<h4 className="font-bold text-slate-800">1000+ E-Books Combo</h4>
										<p className="text-xs text-slate-500 font-medium">Lifetime Access</p>
									</div>
									<div className="text-2xl font-black text-rose-600">₹99</div>
								</div>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
										<input 
											type="text" 
											required
											value={formData.firstname}
											onChange={e => setFormData({...formData, firstname: e.target.value})}
											className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-slate-400 font-medium"
											placeholder="e.g. Rahul Kumar"
										/>
									</div>
									<div>
										<label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
										<input 
											type="email" 
											required
											value={formData.email}
											onChange={e => setFormData({...formData, email: e.target.value})}
											className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-slate-400 font-medium"
											placeholder="Books will be sent here"
										/>
									</div>
									<div>
										<label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
										<input 
											type="tel" 
											required
											value={formData.phone}
											onChange={e => setFormData({...formData, phone: e.target.value})}
											className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-slate-400 font-medium"
											placeholder="10-digit mobile number"
										/>
									</div>
								</div>

								<button 
									type="submit"
									disabled={isProcessing}
									className="w-full mt-8 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black uppercase tracking-wider py-4 rounded-xl shadow-[0_10px_20px_rgba(225,29,72,0.2)] hover:shadow-[0_15px_30px_rgba(225,29,72,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
									{isProcessing ? (
										<><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
									) : (
										<>Pay Securely <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></>
									)}
								</button>
								
								<div className="mt-6 flex items-center justify-center gap-4 text-slate-400">
									<div className="flex items-center gap-1.5"><Shield size={14} className="text-emerald-500" /><span className="text-xs font-semibold">100% Secure</span></div>
									<div className="flex items-center gap-1.5"><Zap size={14} className="text-amber-500" /><span className="text-xs font-semibold">Instant Access</span></div>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
}
