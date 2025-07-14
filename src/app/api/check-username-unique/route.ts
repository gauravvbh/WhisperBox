import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Models/User";
import { z } from "zod";
import { userNameValidation } from "@/schemas/signUpSchema";
import { NextRequest, NextResponse } from "next/server";


const usernameQuerySchema = z.object({
    username: userNameValidation
})

export async function GET(request: NextRequest) {
    await dbConnect();

    try {
        console.log(request)
        const { searchParams } = new URL(request.url)
        const queryParams = {
            username: searchParams.get("username")
        }
        const usernameQuery = usernameQuerySchema.safeParse(queryParams);
        if (!usernameQuery.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: usernameQuery.error.format().username?._errors[0] || "Invalid query parameters"
                },
                { status: 400 }
            )
        }

        const { username } = usernameQuery.data;
        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });
        console.log('existingVerifiedUser')
        console.log(existingVerifiedUser)
        if (existingVerifiedUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username is already taken"
                },
                { status: 400 }
            )
        }
        return NextResponse.json(
            {
                success: true,
                message: "Username is available"
            },
            { status: 200 }
        )

    } catch (error) {
        console.error("Error checking username", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error checking username"
            },
            { status: 500 }
        )
    }
}