
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { connectToDB } from "./libs/mongoose"
import User from "./libs/models/user"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      await connectToDB()
      let existing = await User.findOne({ email: user.email })
      if (!existing) {
        existing = await User.create({ name: user.name, email: user.email })
      }

      // Blocked user
      if (existing.isBlocked) return '/suspended'

      // Inactive doctor
      if (existing.role === 'doctor') {
        const { default: Doctor } = await import('@/libs/models/doctor')
        const doctor = await Doctor.findOne({ user: existing._id }).lean()
        if (doctor && !doctor.isActive) return '/suspended'
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