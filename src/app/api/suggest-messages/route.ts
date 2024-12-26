import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey!);

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });

        const generationConfig = {
            temperature: Math.random() * 0.5 + 1,
            topP: 0.85 + Math.random() * 0.1,
            topK: 64,
            maxOutputTokens: 8000,
            responseMimeType: "text/plain",
        };
        const chatSession = model.startChat({
            generationConfig,
            // safetySettings: Adjust safety settings
            // See https://ai.google.dev/gemini-api/docs/safety-settings
            history: [
            ],
        });

        const result = await chatSession.sendMessage(
            "Generate 3 unique sample anonymous questions for a user to ask another user. Each question should be separated by '||'. Provide only the questions, no extra content."
        );
        const responseText = result.response.text();
        console.log(responseText);
        return NextResponse.json(
            {
                success: true,
                message: "Response generated successfully",
                response: responseText,
            }, { status: 200 }
        )
    } catch (error) {
        console.log("Error generating response:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error generating response",
                error,
            },
            { status: 500 }
        )
    }
}