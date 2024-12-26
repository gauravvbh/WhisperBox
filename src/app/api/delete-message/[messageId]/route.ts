import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/Models/User";



export async function DELETE(request: NextRequest, { params }: { params: { messageId: string } }) {
    const messageId = params.messageId;
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user = session?.user as User

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: 'Not authenticated'
        }, {
            status: 401
        })
    }
    try {
        const updatedResult = await UserModel.updateOne(
            { _id: user._id },
            { $pull: { messages: { _id: messageId } } }
        )
        if (updatedResult.modifiedCount == 0) {
            return NextResponse.json({
                success: false,
                message: 'Failed to delete message'
            }, { status: 404 }
            )
        }
        return NextResponse.json({
            success: true,
            message: 'Message deleted successfully'
        }, { status: 200 })
    } catch (error) {
        console.log("Error deleting message", error)
        return NextResponse.json({
            success: false,
            message: 'Error deleting message'
        }, {
            status: 500
        })
    }
}