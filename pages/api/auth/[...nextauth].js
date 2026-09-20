import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import { prisma } from '../../../lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

// The site is served from several hostnames (custom domain, *.netlify.app and
// per-deploy preview URLs), so a single hard-coded NEXTAUTH_URL cannot be right
// for all of them. Derive the origin from the incoming request instead, and only
// fall back to the configured value for local development.
function originFromRequest(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!host || host.startsWith('localhost') || host.startsWith('127.0.0.1')) return null;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

export default function auth(req, res) {
  const origin = originFromRequest(req);
  if (origin) {
    process.env.NEXTAUTH_URL = origin;
  }
  return NextAuth(req, res, authOptions);
}
