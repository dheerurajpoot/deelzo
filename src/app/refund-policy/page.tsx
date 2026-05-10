import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Clock, AlertTriangle, FileText, Mail, Phone, Zap, XCircle, CheckCircle } from "lucide-react";
import type { Metadata } from "next";
import { EMAIL, PHONE } from "@/lib/constant";

export const metadata: Metadata = {
  title: "Refund Policy | Deelzo",
  description: "Learn about Deelzo's strictly no-refund policy for digital assets and software products.",
};

export default function RefundPolicy() {
  const policySections = [
    {
      title: "Digital Nature",
      icon: Zap,
      content: "All products sold on Deelzo are digital in nature (scripts, software, templates, tools). Unlike physical goods, digital assets are permanently accessible once purchased and cannot be 'returned' in the traditional sense."
    },
    {
      title: "No-Refund Policy",
      icon: XCircle,
      content: "Due to the non-tangible and irrevocable nature of digital downloads, Deelzo maintains a strict NO REFUND policy once a purchase is completed. By making a purchase, you acknowledge and agree to this condition."
    },
    {
      title: "Access Protection",
      icon: Shield,
      content: "We ensure that you receive full access to the product you purchased. If there is a technical failure on our end preventing your download or access, our support team will resolve it within 24-48 hours."
    },
    {
      title: "Pre-Purchase Duty",
      icon: FileText,
      content: "It is the buyer's responsibility to review product descriptions, live demos, requirements, and compatibility before purchase. 'Change of mind' or 'accidental purchase' does not qualify for a refund."
    }
  ];

  return (
    <div className='min-h-screen bg-white'>
      {/* Premium Hero Section */}
      <div className='relative overflow-hidden bg-slate-900 py-20 md:py-32'>
        <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]' />
        <div className='absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px]' />
        
        <div className='max-w-5xl mx-auto px-4 md:px-8 text-center relative z-10'>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest mb-8">
            <Shield size={14} className="text-orange-500" />
            Terms of Purchase
          </div>
          <h1 className='text-4xl md:text-6xl font-black text-white mb-6 tracking-tight'>
            Refund <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Policy</span>
          </h1>
          <p className='text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed'>
            Transparency is key to our marketplace. Please read our digital product return guidelines carefully before completing your transaction.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-6xl mx-auto px-4 md:px-8 -mt-16 pb-24 relative z-20'>
        
        {/* Core Notice Card */}
        <Card className='bg-white border-0 shadow-2xl rounded-[2.5rem] overflow-hidden mb-12'>
          <CardContent className='p-8 md:p-12'>
            <div className='flex flex-col md:flex-row items-center gap-8'>
              <div className='w-24 h-24 rounded-[2rem] bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100'>
                <AlertTriangle size={40} className='text-rose-500' />
              </div>
              <div className="text-center md:text-left">
                <h2 className='text-2xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight'>
                  Strict No-Refund Policy
                </h2>
                <p className='text-slate-500 leading-relaxed text-base md:text-xl'>
                  Since Deelzo offers non-tangible, irrevocable digital products, we <span className="text-slate-900 font-bold underline decoration-rose-500/30">do not issue refunds</span> once the order is accomplished and the product is sent or downloaded. As a customer, you are responsible for understanding this upon purchasing any item at our site.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-16'>
          {policySections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div 
                key={index}
                className='group bg-slate-50/50 border border-slate-100 rounded-[2rem] p-8 hover:bg-white hover:shadow-xl transition-all duration-500'
              >
                <div className='w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                  <Icon size={28} className='text-slate-900' />
                </div>
                <h3 className='text-xl font-black text-slate-900 mb-3'>
                  {section.title}
                </h3>
                <p className='text-slate-500 leading-relaxed font-medium'>
                  {section.content}
                </p>
              </div>
            );
          })}
        </div>

        {/* Exceptions & Support */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <h2 className='text-3xl font-black text-slate-900 tracking-tight'>Exceptions to the Rule</h2>
            <div className="space-y-4">
              {[
                { title: "Technical Non-Functionality", desc: "If the product is completely non-functional and the seller cannot provide a fix within 7 days, a store credit may be issued at our discretion." },
                { title: "Misleading Descriptions", desc: "If the product significantly differs from the description and live demo provided on the product page." },
                { title: "Non-Delivery", desc: "If you fail to receive the download link or license key due to a mailing issue from our side." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 bg-white border border-slate-100 rounded-2xl">
                  <div className="mt-1"><CheckCircle size={20} className="text-emerald-500" /></div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between">
            <div>
              <Mail className="text-orange-400 mb-6" size={32} />
              <h3 className="text-2xl font-black mb-4 tracking-tight">Need Support?</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                If you encounter any issues with your purchase, our support team is available to assist with technical troubleshooting.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Email Registry</p>
                <p className="text-sm font-bold">{EMAIL}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Instant Contact</p>
                <p className="text-sm font-bold">{PHONE}</p>
              </div>
              <Link href="/contact" className="block w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl text-center font-black uppercase text-xs tracking-widest hover:opacity-90 transition-opacity">
                Contact Helpdesk
              </Link>
            </div>
          </div>
        </div>

        {/* Final Disclaimer */}
        <div className='text-center'>
          <p className='text-slate-400 text-sm font-medium'>
            By continuing with your purchase on Deelzo, you agree to these terms. Last updated: May 2026.
          </p>
        </div>
      </div>
    </div>
  );
}