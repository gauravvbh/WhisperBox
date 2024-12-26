import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/options';
import UserModel from '@/Models/User';
import mongoose from 'mongoose';


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
    const userId = new mongoose.Types.ObjectId(user?._id);
    try {
        const userMessages = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } }
        ])
        if (!userMessages || userMessages.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No messages available'
            }, {
                status: 404
            })
        }
        return NextResponse.json(
            {
                success: true,
                messages: userMessages[0].messages
            }, { status: 200 }
        )
    } catch (error) {
        console.error('Error fetching messages', error);
        return NextResponse.json({
            success: false,
            message: 'Error fetching messages'
        }, {
            status: 500
        })
    }
}