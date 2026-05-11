"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { EMAIL, BASE_URL } from "@/lib/constant";
import { userContext } from "@/context/userContext";

interface OrderItem {
	product: string;
	snapshot: {
		title: string;
		price: number;
		currency: string;
		category?: string;
		thumbnail?: string;
	};
	quantity: number;
}

interface OrderData {
	_id: string;
	orderId: string;
	user: {
		name: string;
		email: string;
	};
	items?: OrderItem[];
	productSnapshot?: {
		title: string;
		price: number;
		currency: string;
		category?: string;
		thumbnail?: string;
	};
	amount: number;
	discountApplied?: number;
	finalAmount: number;
	currency: string;
	paymentMethod?: string;
	paymentStatus: string;
	transactionId?: string;
	createdAt: string;
	paidAt?: string;
}

export default function InvoiceGenerator({ order, variant = "default" }: { order: OrderData, variant?: "default" | "icon" }) {
	const [isGenerating, setIsGenerating] = React.useState(false);
	const { user: currentUser } = userContext();
	const invoiceRef = useRef<HTMLDivElement>(null);

	// console.log(order);

	const customerName = (typeof order.user === 'object' && order.user?.name) ? order.user.name : (currentUser?.name || "Customer");
	const customerEmail = (typeof order.user === 'object' && order.user?.email) ? order.user.email : (currentUser?.email || "");

	const handleDownload = async () => {
		try {
			setIsGenerating(true);
			
			// Wait for a tick to ensure rendering
			await new Promise(resolve => setTimeout(resolve, 100));

			const element = invoiceRef.current;
			if (!element) return;

			const canvas = await html2canvas(element, {
				scale: 2,
				useCORS: true,
				logging: false,
				backgroundColor: "#ffffff",
				onclone: (clonedDoc) => {
					// Nuke all global stylesheets in the clone to prevent 'lab/oklch' pollution
					const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
					styles.forEach(s => s.remove());

					// Ensure the capture area is visible and styled correctly in the clone
					const clonedElement = clonedDoc.getElementById('invoice-capture-area');
					if (clonedElement) {
						clonedElement.style.position = 'static';
						clonedElement.style.left = '0';
						clonedElement.style.top = '0';
						clonedElement.style.display = 'block';
					}
				}
			});

			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4",
			});

			const imgProps = pdf.getImageProperties(imgData);
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

			pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
			pdf.save(`Invoice-${order.orderId}.pdf`);
			
			toast.success("Invoice downloaded successfully!");
		} catch (error) {
			console.error("Invoice generation error:", error);
			toast.error("Failed to generate invoice");
		} finally {
			setIsGenerating(false);
		}
	};

	// Helper to normalize items (legacy vs new vs direct products)
	const items = (order.items && order.items.length > 0 
		? order.items.map((item: any) => {
			// Handle case where item might be a product document (legacy populated)
			// or the new structure with .snapshot
			if (item.snapshot) return item;
			
			// If it's a legacy populated product
			return {
				product: item._id || "",
				quantity: item.quantity || 1,
				snapshot: {
					title: item.title || "Product",
					price: item.price || 0,
					currency: item.currency || order.currency || "$",
					category: item.category,
					thumbnail: item.thumbnail
				}
			};
		})
		: order.productSnapshot 
			? [{ 
				snapshot: order.productSnapshot, 
				quantity: 1,
				product: ""
			}] 
			: []).filter(item => item && item.snapshot);


	return (
		<>
			{variant === "icon" ? (
				<Button
					variant="ghost"
					size="icon"
					onClick={handleDownload}
					disabled={isGenerating}
					className="hover:text-sky-600 hover:bg-sky-50 transition-all duration-200"
					title="Download Invoice"
				>
					{isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
				</Button>
			) : (
				<Button
					variant="outline"
					size="sm"
					onClick={handleDownload}
					disabled={isGenerating}
					className="border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
				>
					{isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
					{isGenerating ? "Generating..." : "Invoice"}
				</Button>
			)}

			{/* Hidden Invoice Template for Capture */}
			<div className="fixed left-[-9999px] top-[-9999px]">
				<div 
					id="invoice-capture-area"
					ref={invoiceRef}
					style={{ 
						width: "210mm", 
						minHeight: "297mm", 
						backgroundColor: "#ffffff", 
						padding: "48px", 
						color: "#0f172a",
						fontFamily: "Inter, system-ui, sans-serif",
						lineHeight: "1.625",
						position: "relative"
					}}
				>
					{/* Header with Decorative Accent */}
					<div className="absolute top-0 left-0 w-full h-2" style={{ background: 'linear-gradient(to right, #0ea5e9, #2563eb, #4f46e5)' }} />
					
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
						<div>
							<div style={{ marginBottom: '16px' }}>
								<img 
									src="/plogo.png" 
									alt="Logo" 
									style={{ height: '55px', width: 'auto', display: 'block' }} 
								/>
							</div>
							<div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
								<p style={{ margin: '0' }}>{EMAIL}</p>
								<p style={{ margin: '0' }}>{BASE_URL}</p>
							</div>
						</div>
						<div style={{ textAlign: 'right' }}>
							<h2 style={{ fontSize: '48px', fontWeight: '900', color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 16px 0', lineHeight: '1' }}>INVOICE</h2>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
								<p style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
									# <span style={{ fontFamily: 'monospace' }}>{order.orderId}</span>
								</p>
								<p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
									Date: <span style={{ fontWeight: '600', color: '#0f172a' }}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
								</p>
							</div>
						</div>
					</div>

					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: '1fr 1fr', 
						gap: '60px', 
						marginBottom: '60px', 
						paddingTop: '32px', 
						paddingBottom: '32px', 
						borderTop: '1px solid #f1f5f9', 
						borderBottom: '1px solid #f1f5f9' 
					}}>
						<div>
							<h3 style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', margin: 0 }}>Bill To</h3>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
								<p style={{ fontWeight: '800', fontSize: '18px', color: '#0f172a', margin: '0' }}>{customerName}</p>
								<p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>{customerEmail}</p>
							</div>
						</div>
						<div style={{ textAlign: 'right' }}>
							<h3 style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', margin: 0 }}>Payment Details</h3>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
								<p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
									Method: <span style={{ textTransform: 'uppercase', fontWeight: '700' }}>{order.paymentMethod || "Online"}</span>
								</p>
								<p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
									Status: <span style={{ textTransform: 'uppercase', fontWeight: '700', color: '#059669' }}>{order.paymentStatus}</span>
								</p>
								<p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', fontFamily: 'monospace' }}>
									TXN: {order.transactionId || "N/A"}
								</p>
							</div>
						</div>
					</div>

					{/* Items Table */}
					<table style={{ width: '100%', marginBottom: '60px', borderCollapse: 'collapse' }}>
						<thead>
							<tr style={{ borderBottom: '2px solid #0f172a' }}>
								<th style={{ textAlign: 'left', padding: '16px 0', fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Description</th>
								<th style={{ textAlign: 'center', padding: '16px 0', fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Qty</th>
								<th style={{ textAlign: 'right', padding: '16px 0', fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Price</th>
								<th style={{ textAlign: 'right', padding: '16px 0', fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</th>
							</tr>
						</thead>
						<tbody>
							{items.map((item, idx) => (
								<tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
									<td style={{ padding: '20px 0' }}>
										<p style={{ fontWeight: '700', fontSize: '16px', color: '#0f172a', margin: 0 }}>{item.snapshot.title}</p>
									</td>
									<td style={{ textAlign: 'center', padding: '20px 0', fontWeight: '600', color: '#475569' }}>{item.quantity}</td>
									<td style={{ textAlign: 'right', padding: '20px 0', fontWeight: '600', color: '#475569' }}>
										{item.snapshot.currency}{item.snapshot.price.toLocaleString()}
									</td>
									<td style={{ textAlign: 'right', padding: '20px 0', fontWeight: '700', color: '#0f172a' }}>
										{item.snapshot.currency}{(item.snapshot.price * item.quantity).toLocaleString()}
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{/* Summary */}
					<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
						<div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
								<span style={{ fontSize: '14px' }}>Subtotal</span>
								<span style={{ fontWeight: '700' }}>{order.currency}{order.amount.toLocaleString()}</span>
							</div>
							{(order.discountApplied || 0) > 0 && (
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#059669' }}>
									<span style={{ fontSize: '14px' }}>Discount</span>
									<span style={{ fontWeight: '700' }}>-{order.currency}{order.discountApplied?.toLocaleString()}</span>
								</div>
							)}
							<div style={{ paddingTop: '12px', borderTop: '2px solid #0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
								<span style={{ fontSize: '16px', fontWeight: '900', textTransform: 'uppercase' }}>Total Paid</span>
								<span style={{ fontSize: '24px', fontWeight: '900', color: '#059669' }}>
									{order.currency}{order.finalAmount.toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div style={{ marginTop: '120px', paddingTop: '48px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
						<p style={{ fontSize: '10px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '12px' }}>
							Receipt ID: {order._id}
						</p>
						<h4 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0f172a' }}>Thank you for your business</h4>
						<p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '448px', margin: '0 auto' }}>
							This is a computer-generated document. No signature is required.
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
