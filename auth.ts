
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
    async session({ session }) {
      if (session.user?.email) {
        await connectToDB()
        const dbUser = await User.findOne({ email: session.user.email }).lean()
        if (dbUser) {
          session.user.role = dbUser.role
        }
      }
      return session
    },
  },
})