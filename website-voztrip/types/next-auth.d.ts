import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    role: "seller" | "admin";
    username: string;
    userId: string;
    fullName: string | null;
    shopName: string | null;
  }
  interface User {
    token: string;
    role: "seller" | "admin";
    username: string;
    userId: string;
    fullName: string | null;
    shopName: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    role: "seller" | "admin";
    username: string;
    userId: string;
    fullName: string | null;
    shopName: string | null;
  }
}
