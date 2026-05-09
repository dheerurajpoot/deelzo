import nodemailer from "nodemailer";

const companyName = process.env.COMPANY_NAME;

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "smtp.gmail.com",
	port: Number.parseInt(process.env.SMTP_PORT || "587"),
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

export async function sendEmail({
	to,
	subject,
	html,
}: {
	to: string;
	subject: string;
	html: string;
}) {
	try {
		await transporter.sendMail({
			from: `"Deelzo" <${process.env.SMTP_USER}>`,
			to,
			subject,
			html,
		});
		return { success: true };
	} catch (error) {
		console.error("Email sending error:", error);
		return { success: false, error };
	}
}

export function generateOTPEmail(otp: string): string {
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email - ${companyName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing:2px;">${companyName}</h1>
        <p style="color: #e0f2fe; margin: 8px 0 0 0; font-size: 18px;">Verify your email address</p>
      </div>
      <div style="background: #f7fafc; padding: 28px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #2563eb; margin-top: 0;">Welcome to ${companyName}!</h2>
        <p style="margin: 0 0 18px 0;">Thank you for signing up on ${companyName}. To complete your registration, please enter the code below on the verification page:</p>
        <div style="background: white; border: 2px solid #06b6d4; border-radius: 8px; padding: 20px; text-align: center; margin: 22px 0;">
          <h3 style="margin: 0; color: #2563eb; font-size: 34px; letter-spacing: 8px;">${otp}</h3>
        </div>
        <p style="margin-bottom:0;">This code expires in 10 minutes for your security.</p>
        <p style="font-size: 14px; color: #64748b; margin-top:2.2em;">If you didn't request this verification, please ignore this message.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">
        <p style="font-size: 15px; color: #64748b;">
          Regards,<br>
          The ${companyName} Team
        </p>
      </div>
    </body>
    </html>
  `;
}

export function generatePasswordResetEmail(resetLink: string): string {
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password - ${companyName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing:2px;">${companyName}</h1>
        <p style="color: #e0f2fe; margin: 8px 0 0 0; font-size: 18px;">Password Reset Request</p>
      </div>
      <div style="background: #f7fafc; padding: 28px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #2563eb; margin-top: 0;">Reset Your Password</h2>
        <p style="margin: 0 0 12px 0;">We received a request to reset your password for your ${companyName} account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="margin-bottom:0;">This link will expire in 1 hour for security reasons.</p>
        <p style="font-size: 14px; color: #64748b; margin-top:2.2em;">If you did not request a password reset, you can ignore this email—your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">
        <p style="font-size: 15px; color: #64748b;">
          Regards,<br>
          The ${companyName} Team
        </p>
      </div>
    </body>
    </html>
  `;
}

export function generateNewBidEmail(
	listingTitle: string,
	bidAmount: number,
	bidderName: string,
	listingLink: string
): string {
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Bid Received - ${companyName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing:2px;">${companyName}</h1>
        <p style="color: #e0f2fe; margin: 8px 0 0 0; font-size: 18px;">New Bid Received</p>
      </div>
      <div style="background: #f7fafc; padding: 28px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #2563eb; margin-top: 0;">New Bid on Your Listing</h2>
        <p>Hello,</p>
        <p>You've received a new bid on your listing <strong>${listingTitle}</strong> from ${bidderName}.</p>
        <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 24px; color: #2563eb; font-weight: bold;">$${bidAmount.toLocaleString()}</p>
          <p style="margin: 8px 0 0 0; color: #64748b;">Bid Amount</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${listingLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Listing</a>
        </div>
        <p>You'll be notified if you receive any higher bids.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">
        <p style="font-size: 15px; color: #64748b;">
          Regards,<br>
          The ${companyName} Team
        </p>
      </div>
    </body>
    </html>
  `;
}

export function generateNewListingNotification(
	listingTitle: string,
	sellerName: string,
	listingLink: string
): string {
	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Listing - ${companyName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing:2px;">${companyName}</h1>
        <p style="color: #e0f2fe; margin: 8px 0 0 0; font-size: 18px;">New Listing Alert</p>
      </div>
      <div style="background: #f7fafc; padding: 28px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #2563eb; margin-top: 0;">New Listing Requires Approval</h2>
        <p>Hello Admin,</p>
        <p>A new listing has been created by <strong>${sellerName}</strong> and is pending your review.</p>
        <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 24px; color: #2563eb; font-weight: bold;">${listingTitle}</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${listingLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Review Listing</a>
        </div>
        <p>Please review this listing at your earliest convenience to ensure it meets our community guidelines.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">
        <p style="font-size: 15px; color: #64748b;">
          Regards,<br>
          The ${companyName} Team
        </p>
      </div>
    </body>
    </html>
  `;
}

export function generateListingStatusUpdate(
	listingTitle: string,
	status: string,
	adminNote?: string
): string {
	const statusMessages: { [key: string]: string } = {
		active: "Your listing has been approved and is now live on Deelzo!",
		inactive: "Your listing has been deactivated by an administrator.",
		rejected:
			"Your listing has been rejected as it does not meet our community guidelines.",
		sold: "Your listing has been marked as sold. Thank you for using Deelzo!",
		pending: "Your listing is under review by our team.",
	};

	const statusIcons: { [key: string]: string } = {
		active: "✅",
		inactive: "⏸️",
		rejected: "❌",
		sold: "🏆",
		pending: "⏳",
	};

	return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Listing Update - ${companyName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing:2px;">${companyName}</h1>
        <p style="color: #e0f2fe; margin: 8px 0 0 0; font-size: 18px;">Listing Status Update</p>
      </div>
      <div style="background: #f7fafc; padding: 28px; border-radius: 0 0 12px 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; margin-bottom: 16px;">${
				statusIcons[status] || "📋"
			}</div>
          <h2 style="color: #2563eb; margin: 0 0 8px 0;">${
				status.charAt(0).toUpperCase() + status.slice(1)
			}: ${listingTitle}</h2>
        </div>
        
        <p>${
			statusMessages[status] ||
			"The status of your listing has been updated."
		}</p>
        
        ${
			adminNote
				? `
        <div style="background: #fff8e1; border-left: 4px solid #ffc107; padding: 12px; margin: 16px 0; border-radius: 0 4px 4px 0;">
          <p style="margin: 0; color: #5d4037; font-style: italic;">${adminNote}</p>
        </div>
        `
				: ""
		}
        
        <div style="margin: 24px 0; text-align: center;">
          <a href="${
				process.env.NEXT_PUBLIC_APP_URL
			}/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View My Listings</a>
        </div>
        
        <p>If you have any questions or need further assistance, please don't hesitate to contact our support team.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">
        <p style="font-size: 15px; color: #64748b;">
          Regards,<br>
          The ${companyName} Team
        </p>
      </div>
    </body>
    </html>
  `;
}
