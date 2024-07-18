import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import bcrypt from "bcryptjs"

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail"
import { SuiteContext } from "node:test"

// ------------ Algo --------------
// IF existingUserByEmail EXISTS THEN
//   IF existingUserByEmail.isVerified THEN
//     success: false,
//   ELSE
//     Save the Updated User
//   END IF
// ELSE
//   Create a new User with provided details
//   save the new User
// END IF

export async function POST(req: Request) {
  await dbConnect()

  try {
    // always await the request object for getting data
    const { username, email, password } = await req.json()

    // Checking user exist in DB & also verified
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    })

    if (existingUserVerifiedByUsername) {
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

    const existingUserWithEmail = await UserModel.findOne({ email })

    // Generating Verification code
    const verifyCode = Math.floor(100000 + Math.random() * 90000).toString()

    if (existingUserWithEmail) {
      if (existingUserWithEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exists",
          },
          {
            status: 400,
          }
        )
      } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        existingUserWithEmail.password = hashedPassword
        existingUserWithEmail.verifyCode = verifyCode
        existingUserWithEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
        await existingUserWithEmail.save()
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)

      // Set expiry date for token of 1 hour from the Signup point
      const expiryDate = new Date()
      expiryDate.setHours(expiryDate.getHours() + 1)

      const newUser = await new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      })

      await newUser.save()
    }

    // Send verification Email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    )

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      )
    }

    return Response.json(
      {
        success: true,
        message: "User Registered Successfully. Please verify your email.",
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error("Error registering user:", error)
    return Response.json(
      {
        success: false,
        messsage: "Error registering user",
      },
      {
        status: 500,
      }
    )
  }
}
