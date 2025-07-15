
import { verificationEmailTemplate } from "../../emails/verificationEmailTemplate";
import { ApiResponse } from "../types/ApiResponses";
import nodemailer from "nodemailer";

// Fail fast if env vars are missing
if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    throw new Error("GMAIL_USER and GMAIL_PASS must be set in environment variables");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {

        const info = await transporter.sendMail({
            from: `"Mystery Message" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Mystery Message | Verification Email",
            text: `Hello ${username},\n\nYour verification code is: ${verifyCode}\n\nThank you!`,
            html: verificationEmailTemplate(username, verifyCode),
        });

        console.log("Email sent: ", info.messageId);

        return {
            success: true,
            message: "Verification email sent successfully",
        };
    } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        return {
            success: false,
            message: "Failed to send verification email",
        };
    }
}
