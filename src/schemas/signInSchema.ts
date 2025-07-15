import { z } from "zod";



export const signInSchema = z.object({
    username: z.string(), //identifier can be username, email which we will use for login purposes
    password: z.string(),
});