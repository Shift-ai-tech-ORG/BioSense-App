import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    hasConsented: boolean
    onboardingDone: boolean
  }
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      hasConsented: boolean
      onboardingDone: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    hasConsented: boolean
    onboardingDone: boolean
  }
}
