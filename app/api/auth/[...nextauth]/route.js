import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser } from '@/lib/db'

const handler = NextAuth({
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const { email, password } = credentials

        // Get user from database
        const user = await getUserByEmail(email)

        if (!user) {
          throw new Error('No user found with this email')
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash)

        if (!isValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          email: user.email,
        }
      }
    }),

    // Google OAuth (for Google Ads connection)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/adwords',
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    }),
  ],

  callbacks: {
    async jwt({ token, account, user }) {
      // On sign in, add access token and refresh token
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      
      if (user) {
        token.id = user.id
      }

      return token
    },

    async session({ session, token }) {
      // Add user ID and tokens to session
      session.user.id = token.id
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      
      return session
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
