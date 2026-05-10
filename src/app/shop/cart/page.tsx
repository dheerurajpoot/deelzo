"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
	ShoppingCart,
	Trash2,
	ArrowLeft,
	ArrowRight,
	ShoppingBag,
	ShieldCheck,
	Zap,
	Download,
	Loader2,
} from "lucide-react";
import Image from "next/image";

export default function CartPage() {
	const { cart, removeFromCart, getCartTotal, itemCount, loading } = useCart();

	const subtotal = getCartTotal();

	if (loading && itemCount === 0) {
		return (
			<div className="min-h-[70vh] flex items-center justify-center">
				<Loader2 className="animate-spin text-sky-500" size={48} />
			</div>
		);
	}

	if (itemCount === 0) {
		return (
			<div className='min-h-[70vh] flex flex-col items-center justify-center px-4'>
				<div className='w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6'>
					<ShoppingCart size={40} className='text-slate-300' />
				</div>
				<h1 className='text-2xl font-bold text-slate-900 mb-2'>Your cart is empty</h1>
				<p className='text-slate-500 mb-8 max-w-md text-center'>
					Explore our marketplace to find premium digital assets and tools to supercharge your workflow.
				</p>
				<Link href='/shop'>
					<Button className='bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-xl transition-all'>
						<ArrowLeft className='mr-2' size={18} />
						Browse Marketplace
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-slate-50/50 py-6 md:py-12'>
			<div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8'>
				<div className='flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10'>
					<div>
						<nav className="flex items-center gap-2 text-sm text-slate-400 mb-2">
							<Link href="/shop" className="hover:text-sky-600 transition-colors">Shop</Link>
							<span>/</span>
							<span className="text-slate-600 font-medium">Cart</span>
						</nav>
						<h1 className='text-3xl md:text-4xl font-black text-slate-900 tracking-tight'>Shopping Cart</h1>
						<p className='text-slate-500 mt-1'>Managed and synchronized across your account</p>
					</div>
					<div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm inline-flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
						<span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{itemCount} Items Ready</span>
					</div>
				</div>

				<div className='grid lg:grid-cols-3 gap-3 md:gap-10'>
					{/* Cart Items List */}
					<div className='lg:col-span-2 space-y-6'>
						{cart.map((item) => (
							<div key={item._id} className='relative bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 transition-all hover:border-sky-200 hover:shadow-xl hover:shadow-sky-500/5 group'>
								<div className='flex items-center gap-6'>
									<div className='relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-slate-50 rounded-md overflow-hidden border border-slate-100'>
										{item.thumbnail ? (
											<Image
												src={item.thumbnail}
												alt={item.title}
												fill
												className='object-cover group-hover:scale-105 transition-transform duration-500'
											/>
										) : (
											<div className='w-full h-full flex items-center justify-center'>
												<ShoppingBag size={32} className='text-slate-200' />
											</div>
										)}
									</div>

									<div className='flex-1 min-w-0'>
										<div className='flex justify-between items-start gap-4'>
											<div>
												<p className='text-[10px] font-black text-sky-600 uppercase tracking-[0.2em] mb-1'>
													{item.category}
												</p>
												<Link href={`/shop/${item.slug}`}>
													<h3 className='text-sm md:text-xl font-bold text-slate-900 hover:text-sky-600 transition-colors leading-tight'>
														{item.title}
													</h3>
												</Link>
											</div>
											<button
												onClick={() => removeFromCart(item._id)}
												className='p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all'
												title='Remove'>
												<Trash2 size={20} />
											</button>
										</div>
										
										<div className='flex items-center justify-between mt-6'>
											<div className='flex gap-4'>
												{/* <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
													<ShieldCheck size={14} className="text-emerald-500" />
													LIFETIME LICENSE
												</div> */}
												<div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
													<Zap size={14} className="text-amber-500" />
													INSTANT DOWNLOAD
												</div>
											</div>
											<div className='text-2xl font-black text-slate-900'>
												<span className="text-sm font-medium text-slate-400 mr-1">{item.currency}</span>
												{item.price.toLocaleString()}
											</div>
										</div>
									</div>
								</div>
							</div>
						))}

						<Link href='/shop' className='inline-flex items-center text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors py-2 group'>
							<ArrowLeft size={16} className='mr-2 group-hover:-translate-x-1 transition-transform' />
							CONTINUE SHOPPING
						</Link>
					</div>

					{/* Order Summary */}
					<div className='relative'>
						<div className='sticky top-24 space-y-6'>
							<div className='bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/20'>
								<h2 className='text-xl font-bold mb-8 flex items-center gap-2'>
									Order Summary
									<div className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/60">SECURE</div>
								</h2>
								
								<div className='space-y-4'>
									<div className='flex justify-between text-white/60 text-sm'>
										<span>Subtotal ({itemCount} items)</span>
										<span className='font-bold text-white'>{cart[0]?.currency || 'USD'} {subtotal.toLocaleString()}</span>
									</div>
									<div className='flex justify-between text-white/60 text-sm'>
										<span>Platform Fee</span>
										<span className='text-emerald-400 font-bold uppercase text-[10px] tracking-widest'>Waived</span>
									</div>
									
									<div className='pt-6 mt-6 border-t border-white/10'>
										<div className='flex justify-between items-end'>
											<div>
												<p className='text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1'>Total Amount</p>
												<p className='text-4xl font-black'>
													<span className="text-lg font-medium text-white/40 mr-1">{cart[0]?.currency || 'USD'}</span>
													{subtotal.toLocaleString()}
												</p>
											</div>
										</div>
									</div>

									<Link href='/shop/checkout' className='block pt-6'>
										<Button className='w-full bg-white hover:bg-slate-100 text-slate-900 py-8 rounded-2xl text-lg font-black transition-all hover:scale-[1.02] active:scale-95 group'>
											PROCEED TO CHECKOUT
											<ArrowRight size={20} className='ml-2 group-hover:translate-x-1 transition-transform' />
										</Button>
									</Link>

									<div className='grid grid-cols-3 gap-4 mt-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500'>
										<Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" width={60} height={20} className="mx-auto" />
										<Image src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original" alt="Visa" width={60} height={20} className="mx-auto" />
										<Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width={60} height={20} className="mx-auto" />
									</div>
								</div>
							</div>

							<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
										<ShieldCheck size={20} />
									</div>
									<div>
										<h4 className="text-sm font-bold text-slate-900">Encrypted Transactions</h4>
										<p className="text-xs text-slate-500 mt-0.5">Your payment is secured with industry-standard 256-bit SSL encryption.</p>
									</div>
								</div>
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 flex-shrink-0">
										<Download size={20} />
									</div>
									<div>
										<h4 className="text-sm font-bold text-slate-900">Instant Digital Delivery</h4>
										<p className="text-xs text-slate-500 mt-0.5">Access your assets immediately in your dashboard after a successful payment.</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
