import UserModel from "@/Models/User";
import dbConnect from "@/lib/dbConnect";
import { Message } from "@/Models/Message";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    await dbConnect();
    const { username, content } = await request.json();
    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 400
                }
            )
        }
        if (!user.isVerified) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User is not verified",
                },
                {
                    status: 403
                }
            )
        }

        if (!user.isAcceptingMessages) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User is not accepting messages",
                },
                {
                    status: 403
                }
            )
        }

        const newMessage = { content, createdAt: new Date() }
        user.messages.push(newMessage as Message)
        await user.save();
        return NextResponse.json(
            {
                success: true,
                message: "Message sent successfully",
            },
            {
                status: 201
            }
        )
    } catch (error) {
        console.error("Error sending message", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error sending message"
            },
            {
                status: 500
            }
        )
    }
}