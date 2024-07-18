import "next-auth"
import { DefaultSession } from "next-auth"

// Modifying the User interface in the next-auth to use in Signin route to make token more powerfull
declare module "next-auth" {
  interface User {
    _id?: string
    isVerified?: boolean
    isAcceptingMessages?: boolean
    username?: string
  }

  interface Session {
    user: {
      _id?: string
      isVerified?: boolean
      isAcceptingMessages?: boolean
      username?: string
    } & DefaultSession["user"]
  }
}

// alternate way for the above
declare module "next-auth/jwt" {
  interface JWT {
    _id?: string
    isVerified?: boolean
    isAcceptingMessages?: boolean
    username?: string
  }
}
