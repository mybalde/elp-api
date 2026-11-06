//création du compte utilisateur et envoi du mail de confirmation de l'adresse email

import { BadRequestError } from "../helpers/gestionErrors.helpers";
import { prisma } from "../lib/prisma";
import type { createUserAccountType } from "../schema/user.schema";
import bcrypt from "bcrypt"
import { mailerQueue } from "../workers/emailworker";
import type { MyData } from "../types/workers.types";
import { mailConfirmationFunction } from "../htmlFunctions/mailConfirmation";

export const creationAccountClient = async (data: createUserAccountType) => {
  const {email, pswd, confirmPswd, ...userData } = data

  console.log("etape 3 ok")
  const userCreated = await prisma.user.findFirst({
    where:{
      email,
      validate_user: true
    }
  })
  console.log("etape 3 ok")

  if(userCreated){
     throw new BadRequestError("Un compte utilisteur est déjà associé à ces informations.")
  }

  const now = new Date()
  const user = await prisma.user.findFirst({
    where: {
      email,
      token_expires_at: {gte: now.toISOString()}
    }
  })

  console.log("etape 4 ok")
  if(user){
    throw new BadRequestError("L'email est en attente de confirmation")
  }
  if(pswd !== confirmPswd){
    throw new BadRequestError("Le mot de passe et la confirmation du mot de passe ne sont pas les même.")
  }

  const hash = await bcrypt.hash(pswd, 13)
  const verify_token = crypto.randomUUID()
  const hashed_token = await bcrypt.hash(verify_token, 13)
  const token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const createdUser = await prisma.user.create({
    data: {
      ...userData,
      email,
      pswd: hash,
      verify_token: hashed_token,
      token_expires_at,
    }
  })

  const jobData: MyData = {
    to: email,
    subject: "Confimation email",
    html: mailConfirmationFunction(email,verify_token)
  }
  mailerQueue.add("Verification email", jobData)

  return createdUser
}