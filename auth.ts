
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { connectToDB } from "./libs/mongoose"
import User from "./libs/models/user"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      await connectToDB()
      const existing = await User.findOne({ email: user.email })
      if (!existing) {
        await User.create({
          name: user.name,
          email: user.email,
        })
      }
      return true
    },
  },
})