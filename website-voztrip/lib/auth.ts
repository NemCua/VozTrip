import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const API_URL = process.env.API_URL || "http://localhost:5000";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/login`, {
            username: credentials?.username,
            password: credentials?.password,
          });

          const data = res.data;
          if (data?.token) {
            return {
              id: data.userId,
              token: data.token,
              role: data.role,
              username: data.username,
              userId: data.userId,
              fullName: data.fullName ?? null,
              shopName: data.shopName ?? null,
            };
          }
          return null;
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            (err?.response?.status === 401 ? "Sai tên đăng nhập hoặc mật khẩu" : "Đăng nhập thất bại");
          throw new Error(message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.role = user.role;
        token.username = user.username;
        token.userId = user.userId;
        token.fullName = user.fullName;
        token.shopName = user.shopName;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.role = token.role;
      session.username = token.username;
      session.userId = token.userId;
      session.fullName = token.fullName;
      session.shopName = token.shopName;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
