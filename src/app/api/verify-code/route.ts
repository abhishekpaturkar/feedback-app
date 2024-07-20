import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { z } from "zod"
import { verifySchema } from "@/schemas/verifySchema"
export async function POST(req: Request) {
  await dbConnect()

  try {
    const { username, code } = await req.json()
    try {
      verifySchema.shape.code.parse(code)
    } catch (validationError: any) {
      if (validationError instanceof z.ZodError) {
        return Response.json(
          {
            success: false,
            message: "Invalid verification code format",
          },
          { status: 400 }
        )
      }
    }

    const decodedUsername = decodeURIComponent(username)
    const user = await UserModel.findOne({ username: decodedUsername })

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 500 }
      )
    }

    const isCodeValid = user.verifyCode === code
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true
      await user.save()
      return Response.json(
        {
          success: true,
          message: "User Verified successfully",
        },
        { status: 200 }
      )
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code expired, please signup again to get a new code",
        },
        { status: 400 }
      )
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect verification code",
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error verifying code", error)
    return Response.json(
      {
        success: false,
        message: "Error verifying code",
      },
      {
        status: 500,
      }
    )
  }
}
