import CredentialsProvider from 'next-auth/providers/credentials'
import { NextAuthOptions } from 'next-auth'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/Models/User'


interface Credentials {
    identifier: string;
    password: string;
}

interface UserType {
    _id: string;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    username: string;
    email: string;
}


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            async authorize(credentials: Credentials): Promise<UserType> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    })

                    if (!user) {
                        throw new Error('No user found with this credentials')
                    }
                    if (!user.isVerified) {

                        throw new Error('User is not verified.Please verify your credentials')
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (isPasswordCorrect) {
                        console.log('Authenticated user:', user);
                        return {
                            _id: user._id,
                            isVerified: user.isVerified,
                            isAcceptingMessages: user.isAcceptingMessages,
                            username: user.username,
                            email: user.email
                        };
                    } else {
                        throw new Error('Invalid password')
                    }
                }
                catch (error: unknown) {
                    if (error instanceof Error) {
                        throw new Error(error.message || 'Authentication failed');
                    }
                    throw new Error('Authentication failed');
                }
            },
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            }

        })
    ],
    callbacks: {
        async session({ session, token }) {
            console.log('Session before:', session);
            console.log('Token:', token);

            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
                session.user.name = token.username; // Setting name
                session.user.email = token.email; // Setting email if needed

                session.user.image = typeof token.image === 'string' ? token.image : null;
            }

            console.log('Session after:', session);
            return session;
        },
        async jwt({ token, user }) {
            console.log('JWT before:', token);

            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
                token.email = user.email; // Ensure this is set
                token.image = user.image || null; // Ensure image is defined
            }

            console.log('JWT after:', token);
            return token;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/sign-in")) return '/dashboard'
            return baseUrl
        }
    },
    pages: {
        signIn: '/sign-in'
    },
    session: {
        strategy: 'jwt'
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET_KEY as string,

}