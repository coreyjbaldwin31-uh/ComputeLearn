import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: "STUDENT" | "INSTRUCTOR" | "TA";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "STUDENT" | "INSTRUCTOR" | "TA";
  }
}
