import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Models/User";
import { sendVerificationEmail } from "@/utils/sendVerificationEmail";
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const { username, email, password } = await request.json();
        const existingVerifiedUserByUsername = await UserModel.findOne({ username, isVerified: true });
        if (existingVerifiedUserByUsername) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username is already taken or Username already registered and verified",
                },
                {
                    status: 400
                }
            )
        }
        const existingUserByEmail = await UserModel.findOne({ email });
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "User already exists with this email address",
                    },
                    {
                        status: 400
                    }
                )
            }
            else {
                const hashedPassword = await bcrypt.hash(password, 10);
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 1);

                existingUserByEmail.username = username;
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = expiryDate;
                await existingUserByEmail.save();
            }
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            });
            await newUser.save();
        }
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        if (!emailResponse.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: emailResponse.message
                },
                {
                    status: 500
                }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully. Please verify your email"
            },
            {
                status: 201
            }
        )

    } catch (error) {
        console.error("Error registering user", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to register user",
            },
            {
                status: 500
            }
        )
    }
}