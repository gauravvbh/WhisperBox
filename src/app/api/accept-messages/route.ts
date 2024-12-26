import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/options';
import UserModel from '@/Models/User';

export async function POST(request: NextRequest) {
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user = session?.user

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: 'Unauthorized'
        }, {
            status: 401
        })
    }
    const userId = user?._id;
    const acceptMessages = await request.json();
    console.log("acceptMessages",acceptMessages)

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages.acceptMessages },
            { new: true }
        )
        if (!updatedUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found'
                },
                { status: 404 }
            )
        }
        return NextResponse.json(
            {
                success: true,
                message: 'Message acceptance status updated successfully',
                updatedUser
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error updating accept messages', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error updating accept messages'
            },
            { status: 500 }
        )
    }
}

export async function GET() {
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user = session?.user

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: 'Unauthorized'
        }, {
            status: 401
        })
    }
    const userId = user?._id;

    try {
        const foundUser = await UserModel.findById(userId);
        if (!foundUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found'
                },
                { status: 404 }
            )
        }
        return NextResponse.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessages
            }, { status: 200 }
        )
    } catch (error) {
        console.error('Error fetching user', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error fetching user'
            },
            { status: 500 }
        )
    }
}