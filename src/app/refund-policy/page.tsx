import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Clock, CreditCard, FileText, Mail, Phone } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import { EMAIL, PHONE } from "@/lib/constant";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Learn about Deelzo's refund policy for digital assets and services.",
};

export default function RefundPolicy() {
  const policySections = [
    {
      title: "General Policy",
      icon: FileText,
      content: "Our refund policy applies to digital assets purchased through the Deelzo platform. Due to the nature of digital products, refunds are subject to specific conditions outlined below. All refund requests must be made within the specified timeframes and meet the eligibility criteria."
    },
    {
      title: "Eligibility Criteria",
      icon: Shield,
      content: "Refunds may be granted under the following circumstances: (1) Technical issues preventing access to the purchased asset that cannot be resolved within 48 hours, (2) Misrepresentation of the asset's features or capabilities as described in the listing, (3) Unauthorized access to your account resulting in unauthorized purchases, or (4) Duplicate purchases made accidentally within 24 hours."
    },
    {
      title: "Non-Eligible Cases",
      icon: Clock,
      content: "Refunds are generally not provided for: (1) Change of mind after purchase, (2) Failure to review asset details before purchase, (3) Issues arising from buyer's own technical setup or hosting environment, (4) Assets that have been downloaded or accessed by the buyer, or (5) Purchases made more than 7 days ago."
    },
    {
      title: "Refund Process",
      icon: CreditCard,
      content: "To request a refund, contact our support team within 7 days of purchase with your order details and reason for refund. Our team will review your request and respond within 2-3 business days. If approved, refunds will be processed to the original payment method within 5-10 business days, though processing times may vary depending on your financial institution."
    }
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100'>
      {/* Hero Section */}
      <div className='relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 py-16 md:py-20'>
        <div className='absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl' />
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl' />
        <div className='max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4'>
            Refund Policy
          </h1>
          <p className='text-white/90 text-lg md:text-xl max-w-3xl mx-auto'>
            Understand our fair and transparent refund policy designed to protect both buyers and sellers on our platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16'>
        {/* Policy Summary Card */}
        <Card className='bg-white border border-slate-200 shadow-lg mb-12'>
          <CardContent className='p-8'>
            <div className='flex items-start gap-4 mb-6'>
              <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0'>
                <Shield size={24} className='text-white' />
              </div>
              <div>
                <h2 className='text-2xl md:text-3xl font-bold text-slate-900 mb-3'>
                  Our Commitment to Fairness
                </h2>
                <p className='text-slate-600 leading-relaxed text-base md:text-lg'>
                  At Deelzo, we strive to maintain a balance between protecting buyers from misrepresented assets 
                  and ensuring sellers are fairly compensated for legitimate transactions. Our refund policy reflects 
                  this commitment to fairness and transparency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policy Sections */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16'>
          {policySections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card 
                key={index}
                className='bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
              >
                <CardContent className='p-6 md:p-8'>
                  <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center mb-4'>
                    <Icon size={24} className='text-white' />
                  </div>
                  <h3 className='text-xl font-bold text-slate-900 mb-3'>
                    {section.title}
                  </h3>
                  <p className='text-slate-600 leading-relaxed'>
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Policy */}
        <Card className='bg-white border border-slate-200 shadow-lg mb-12'>
          <CardContent className='p-8'>
            <h2 className='text-2xl md:text-3xl font-bold text-slate-900 mb-6'>
              Detailed Refund Conditions
            </h2>
            
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold text-slate-800 mb-3'>Digital Asset Refunds</h3>
                <ul className='list-disc pl-5 space-y-2 text-slate-600'>
                  <li>Digital assets that have not been downloaded or accessed may be eligible for refund within 7 days of purchase</li>
                  <li>Assets that have been downloaded or used are generally not eligible for refunds</li>
                  <li>If an asset doesn't match its description, a refund may be issued after verification</li>
                  <li>Refunds for digital assets are processed within 5-10 business days</li>
                </ul>
              </div>
              
              <div>
                <h3 className='text-lg font-semibold text-slate-800 mb-3'>Service-Based Purchases</h3>
                <ul className='list-disc pl-5 space-y-2 text-slate-600'>
                  <li>Services that have not commenced may be eligible for full refund within 7 days</li>
                  <li>Services in progress may be eligible for partial refund based on work completed</li>
                  <li>Completed services are generally not eligible for refunds</li>
                  <li>All service refund requests require detailed justification</li>
                </ul>
              </div>
              
              <div>
                <h3 className='text-lg font-semibold text-slate-800 mb-3'>Technical Issues</h3>
                <ul className='list-disc pl-5 space-y-2 text-slate-600'>
                  <li>Refunds due to technical issues require proof of the problem</li>
                  <li>Buyers must allow reasonable time for technical issues to be resolved</li>
                  <li>If issues persist beyond 48 hours, refund eligibility increases</li>
                  <li>We may require remote access to troubleshoot before approving refunds</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className='bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-lg'>
          <CardContent className='p-8'>
            <h2 className='text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center'>
              Need Assistance with a Refund?
            </h2>
            <p className='text-slate-600 text-center mb-8 max-w-2xl mx-auto'>
              Our support team is ready to assist you with any refund requests or questions about our policy.
            </p>
            
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='text-center p-6 bg-white rounded-xl border border-slate-200'>
                <Mail size={24} className='text-slate-700 mx-auto mb-3' />
                <h3 className='font-semibold text-slate-800 mb-2'>Email Support</h3>
                <p className='text-slate-600'>{EMAIL}</p>
              </div>
              
              <div className='text-center p-6 bg-white rounded-xl border border-slate-200'>
                <Phone size={24} className='text-slate-700 mx-auto mb-3' />
                <h3 className='font-semibold text-slate-800 mb-2'>Phone Support</h3>
                <p className='text-slate-600'>{PHONE}</p>
              </div>
              
              <div className='text-center p-6 bg-white rounded-xl border border-slate-200'>
                <FileText size={24} className='text-slate-700 mx-auto mb-3' />
                <h3 className='font-semibold text-slate-800 mb-2'>Submit Request</h3>
                <Link href="/contact" className='text-emerald-600 hover:underline font-medium'>
                  Contact Form
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className='bg-amber-50 border border-amber-200 shadow-lg mt-8'>
          <CardContent className='p-6 md:p-8'>
            <div className='flex items-start gap-4'>
              <div className='w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0'>
                <FileText size={24} className='text-amber-700' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-amber-800 mb-2'>Important Notice</h3>
                <p className='text-amber-700'>
                  This refund policy is subject to change. Please review this page periodically for updates. 
                  Continued use of our services constitutes acceptance of any changes to this policy. 
                  For specific questions about your situation, please contact our support team directly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}