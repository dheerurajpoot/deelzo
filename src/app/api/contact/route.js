import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/emails";
import { EMAIL } from "@/lib/constant";

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Prepare email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #4f46e5;">Message Details</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #4f46e5;">
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This message was sent from the contact form on your website.
        </p>
      </div>
    `;

    // Send email to the admin/support email
    await sendEmail({
      to: EMAIL,
      subject: `Contact Form: ${subject}`,
      html: emailContent,
    });

    // Optionally, send a confirmation email to the user
    try {
      await sendEmail({
        to: email,
        subject: "Thank You for Contacting Us",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thank You!</h2>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #4f46e5;">Your Message</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #4f46e5;">
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
            <p style="color: #6b7280;">
              Best regards,<br>
              The Deelzo Team
            </p>
          </div>
        `,
      });
    } catch (confirmationError) {
      // If sending confirmation fails, log it but don't fail the whole request
      console.error("Failed to send confirmation email:", confirmationError);
    }

    return NextResponse.json({
      message: "Message sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { message: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}