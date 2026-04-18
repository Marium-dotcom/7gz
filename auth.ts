
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { connectToDB } from "./libs/mongoose"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
//   send data to the database whenever a user signs in
})