import { UserRole } from '@/libs/models/user'

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role?: UserRole
    }
  }
}
