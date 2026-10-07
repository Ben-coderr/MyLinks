import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isOnDashboard = pathname.startsWith("/dashboard");
      const isOnAdmin = pathname.startsWith("/admin");
      const isAuthPage = pathname === "/login" || pathname === "/register";

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        if (auth?.user?.role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      if (trigger === "update" && session) {
        if (session.username) token.username = session.username;
        if (session.role) token.role = session.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = token.role as any;
        session.user.username = (token.username as string) || "";
      }
      return session;
    },
  },
  providers: [],
};
