import { z } from "zod";



export const signInSchema = z.object({
    identifier: z.string(), //identifier can be username, email which we will use for login purposes
    password: z.string(),
});