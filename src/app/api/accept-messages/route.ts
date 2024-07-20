import { getServerSession } from "next-auth" // This gives us the session
import { authOptions } from "../auth/[...nextauth]/options" // This options required for the session
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { User } from "next-auth" // This is the type of the user

export async function POST(req: Request) {
  await dbConnect()

  const session = await getServerSession(authOptions) // the server session requires the authOptions to give the session
  //   console.log(session)
  // The below session.user is inserted options.ts
  const user: User = session?.user as User // assertions

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "You are not logged in",
      },
      { status: 401 }
    )
  }

  const userId = user._id
  const { acceptMessages } = await req.json()

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessages: acceptMessages,
      },
      { new: true }
    )

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to update user status to accept messages",
        },
        { status: 401 }
      )
    }

    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
        updatedUser,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log("Failed to update user status to accept messages", error)
    return Response.json(
      {
        success: false,
        message: "Failed to update user status to accept messages",
      },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  await dbConnect()

  await dbConnect()

  const session = await getServerSession(authOptions) // the server session requires the authOptions to give the session
  console.log(session)
  // The below session.user is inserted options.ts
  const user: User = session?.user as User // assertions

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "You are not logged in",
      },
      { status: 401 }
    )
  }

  const userId = user._id

  try {
    const foundUser = await UserModel.findById(userId)

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      )
    }

    return Response.json(
      {
        success: true,
        message: "User found",
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log("Failed to find user", error)
    return Response.json(
      {
        success: false,
        message: "Error in getting user acceptance status",
      },
      { status: 500 }
    )
  }
}
