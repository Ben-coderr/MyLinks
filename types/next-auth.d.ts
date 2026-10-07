import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    role: Role;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    username?: string;
  }
}
