import z from "zod";
import { ActivityType } from "../generated/prisma/enums";

export const createUserAccountSchema = z.object({
  email: z.email("Email required"),
  phone: z.string("Phone number required"),
  firstname: z.string("Firsyname required"),
  lastname: z.string("Lastname required"),
  pswd: z.string("Password required"),
  confirmPswd: z.string("Confirmation password required"),
  activity: z.enum(ActivityType)
})

export type createUserAccountType = z.infer<typeof createUserAccountSchema>