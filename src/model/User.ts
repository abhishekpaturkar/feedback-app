import mongoose, { Schema, Document } from "mongoose"

export interface Message extends Document {
  content: string
  createdAt: Date
}

const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
})

export interface User extends Document {
  username: string
  email: string
  password: string
  verifyCode: string
  verifyCodeExpiry: Date
  isVerified: boolean
  isAcceptingMessage: boolean
  messages: Message[]
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/.+@.+\..+/, "please use valid email format"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verifyCode: {
    type: String,
    required: [true, "Verify code is required"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify code expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
})

// The below is required as nextjs runs on edge, it doesn't know the app is running for the first time or not
// mongoose.models.User as mongoose.Model<User> -> Already present in schema
// This below "||" checks if the model is already present in db or not
// if not them it will create a new model
// if yes return that model

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema)

export default UserModel
