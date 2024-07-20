import { getServerSession } from "next-auth" // This gives us the session
import { authOptions } from "../auth/[...nextauth]/options" // This options required for the session
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { User } from "next-auth" // This is the type of the user
import mongoose from "mongoose"

export async function GET(req: Request) {
  await dbConnect()
  const session = await getServerSession(authOptions)
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

  // Convert the user._id to a MongoDB ObjectId as Agregation Pipeline requires it (not implicite conversion)
  const userId = new mongoose.Types.ObjectId(user._id)

  // -------- Agregation Piipeline --------
  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ])

    if (!user || user.length === 0) {
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
        messages: user[0].messages,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log("An unexpected error occurred : ", error)
    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    )
  }
}
