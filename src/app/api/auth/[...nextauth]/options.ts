import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions, User } from 'next-auth'; // Import User from next-auth
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/Models/User';

// Extend the NextAuth.js User type to include your custom properties
interface UserType extends User {
    _id?: string; // Make _id optional as 'id' will be the primary identifier
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
    email?: string; // Make email optional as it's already in the base User type, but ensure it's handled
    image?: string | null;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            // The authorize function should return Promise<User | null>
            async authorize(credentials: Record<"username" | "password", string> | undefined): Promise<User | null> {
                await dbConnect();
                console.log('credentials')
                console.log(credentials)
                try {
                    if (!credentials) {
                        throw new Error('No credentials provided');
                    }

                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.username },
                            { username: credentials.username }
                        ]
                    });
                    console.log('user')
                    console.log(user)

                    if (!user || user == null) {
                        throw new Error('No user found with this email or username');
                    }
                    if (!user.isVerified) {
                        throw new Error('User is not verified. Please verify your account');
                    }

                    // Ensure user.password exists before comparing
                    if (!user.password) {
                        throw new Error('User password not found in database');
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (isPasswordCorrect) {
                        console.log('Authenticated user:', user);
                        // Return an object that conforms to the NextAuth.js User type
                        return {
                            id: user._id as string, // NextAuth.js expects an 'id' property
                            name: user.username,
                            email: user.email,
                            // Add other custom properties if needed for the token/session but ensure 'id' is present
                            isVerified: user.isVerified,
                            isAcceptingMessages: user.isAcceptingMessages,
                            username: user.username, // Keep for custom usage in callbacks
                        };
                    } else {
                        throw new Error('Invalid password');
                    }
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        // Return null to indicate authentication failure, and let NextAuth handle the error display
                        console.error('Authentication Error:', error.message);
                        return null; // Important: Return null on authentication failure
                    }
                    console.error('Unknown Authentication Error:', error);
                    return null; // Important: Return null on authentication failure
                }
            },
            credentials: {
                username: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            console.log('Session before:', session);
            console.log('Token:', token);

            if (token) {
                // Ensure session.user properties are defined before assigning
                if (!session.user) {
                    session.user = {};
                }
                session.user._id = token.id as string;
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
                // When a user successfully authenticates, their data from the authorize function
                // is available in the 'user' object here.
                token.id = user.id; // Assign the 'id' from the user object
                token._id = user._id; // Your custom _id
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
                token.email = user.email;
                token.image = user.image || null;
            }

            console.log('JWT after:', token);
            return token;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/sign-in")) return '/dashboard';
            return baseUrl;
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
};





// import CredentialsProvider from 'next-auth/providers/credentials'
// import { NextAuthOptions } from 'next-auth'
// import bcrypt from 'bcryptjs'
// import dbConnect from '@/lib/dbConnect'
// import UserModel from '@/Models/User'


// interface Credentials {
//     identifier: string;
//     password: string;
// }

// interface UserType {
//     _id: string;
//     isVerified: boolean;
//     isAcceptingMessages: boolean;
//     username: string;
//     email: string;
// }


// export const authOptions: NextAuthOptions = {
//     providers: [
//         CredentialsProvider({
//             id: "credentials",
//             name: "Credentials",
//             async authorize(credentials: Credentials): Promise<UserType> {
//                 await dbConnect();
//                 try {
//                     const user = await UserModel.findOne({
//                         $or: [
//                             { email: credentials.identifier },
//                             { username: credentials.identifier }
//                         ]
//                     })

//                     if (!user) {
//                         throw new Error('No user found with this credentials')
//                     }
//                     if (!user.isVerified) {

//                         throw new Error('User is not verified.Please verify your credentials')
//                     }
//                     const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
//                     if (isPasswordCorrect) {
//                         console.log('Authenticated user:', user);
//                         return {
//                             _id: user._id as  string,
//                             isVerified: user.isVerified,
//                             isAcceptingMessages: user.isAcceptingMessages,
//                             username: user.username,
//                             email: user.email
//                         };
//                     } else {
//                         throw new Error('Invalid password')
//                     }
//                 }
//                 catch (error: unknown) {
//                     if (error instanceof Error) {
//                         throw new Error(error.message || 'Authentication failed');
//                     }
//                     throw new Error('Authentication failed');
//                 }
//             },
//             credentials: {
//                 username: { label: "Username", type: "text" },
//                 password: { label: "Password", type: "password" }
//             }

//         })
//     ],
//     callbacks: {
//         async session({ session, token }) {
//             console.log('Session before:', session);
//             console.log('Token:', token);

//             if (token) {
//                 session.user._id = token._id;
//                 session.user.isVerified = token.isVerified;
//                 session.user.isAcceptingMessages = token.isAcceptingMessages;
//                 session.user.username = token.username;
//                 session.user.name = token.username; // Setting name
//                 session.user.email = token.email; // Setting email if needed

//                 session.user.image = typeof token.image === 'string' ? token.image : null;
//             }

//             console.log('Session after:', session);
//             return session;
//         },
//         async jwt({ token, user }) {
//             console.log('JWT before:', token);

//             if (user) {
//                 token._id = user._id?.toString();
//                 token.isVerified = user.isVerified;
//                 token.isAcceptingMessages = user.isAcceptingMessages;
//                 token.username = user.username;
//                 token.email = user.email; // Ensure this is set
//                 token.image = user.image || null; // Ensure image is defined
//             }

//             console.log('JWT after:', token);
//             return token;
//         },
//         async redirect({ url, baseUrl }) {
//             if (url.startsWith("/sign-in")) return '/dashboard'
//             return baseUrl
//         }
//     },
//     pages: {
//         signIn: '/sign-in'
//     },
//     session: {
//         strategy: 'jwt'
//     },
//     jwt: {
//         secret: process.env.JWT_SECRET,
//     },
//     secret: process.env.NEXTAUTH_SECRET_KEY as string,

// }