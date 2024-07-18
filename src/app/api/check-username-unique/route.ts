import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { usernameValidation } from "@/schemas/signUpSchema"
import { z } from "zod"

// Checking username
const UsernameQuerySchema = z.object({
  username: usernameValidation,
})

export async function GET(req: Request) {
  await dbConnect()

  try {
    // localhost:3000/api/check-username-unique?username=abhishek
    const { searchParams } = new URL(req.url)

    // This is the syntax for validating with Zod
    const queryParam = {
      username: searchParams.get("username"),
    }

    // validation with zod
    const result = UsernameQuerySchema.safeParse(queryParam)
    // Checking
    // console.log(result)

    if (!result.success) {
      // only getting error for username
      const usernameErrors = result.error.format().username?._errors || []

      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(",")
              : "Invalid query parameters",
        },
        { status: 400 }
      )
    }

    const { username } = result.data
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    })

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        {
          status: 400,
        }
      )
    }

    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error checking username", error)
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      {
        status: 500,
      }
    )
  }
}
