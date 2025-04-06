import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth"; // Use import type
import GoogleProvider from "next-auth/providers/google";
import type { User } from "next-auth"; 
import type { JWT } from "next-auth/jwt"; // Keep type imports if needed elsewhere, adjust if not

// Define authOptions with NextAuthOptions type for v4
const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      // Ensure environment variables are defined and non-empty
      clientId: process.env.GOOGLE_CLIENT_ID ?? "", 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login", // This remains the same
    // Add error page if needed for v4, e.g., error: '/auth/error', 
  },
  callbacks: {
    // Note: v4 callback structure might differ slightly, especially JWT/session interaction
    // Review v4 docs if more complex logic is needed here.
    async session({ session, token }) {
      // Example: Add user ID from token to session
      if (session?.user && token?.sub) {
        // The way to extend the Session User type might differ in v4
        // This is a common pattern, but verify based on v4 docs/types
        (session.user as User & { id: string }).id = token.sub;
      }
      return session;
    },
    // Add jwt callback if you need to customize the JWT token
    // async jwt({ token, user }) {
    //   if (user) {
    //     token.id = user.id;
    //   }
    //   return token;
    // }
  },
  // The secret is automatically picked up from NEXTAUTH_SECRET env var in v4
  // No need to explicitly define 'secret: process.env.NEXTAUTH_SECRET' here usually
  // session: { // Example: Define session strategy if needed (default is 'jwt')
  //   strategy: "jwt", 
  // },
};

// Export the handler directly for App Router in v4
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
