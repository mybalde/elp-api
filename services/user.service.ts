import { prisma } from "../lib/prisma";
import type { clientInfoType, connexionType, filterType, userRegistrationType } from "../schema/user.schema";
import bcrypt from "bcrypt"
import crypto from 'crypto'
import * as jwt from 'jsonwebtoken'
import { BadRequestError, KnownUserError, UnknownUserError } from "../helpers/gestionErrors.helpers";
import type { UserType } from "../generated/prisma/enums";
import { filterFunction } from "../interfaces/FilterInterface";


export const userRegistration = async (data: userRegistrationType) => {
  const {email, name, pswd, confirmpswd} = data

  const userRegistrated = await prisma.userRegistration.findFirst({
    where: {email}
  })
  if(userRegistrated){
    throw new KnownUserError("Cet email est objet d'une demande d'enregistrement.")
  }

  const createdUser = await prisma.user.findFirst({
    where: {email}
  })
  if(createdUser){
    throw new KnownUserError("Cet email est déjà associé à un compte existant.")
  }

  if(pswd!==confirmpswd){
    throw new BadRequestError("Le mot de passe et sa confirmation ne correspondent pas.")
  }
  
  const saltRounds = 10
  const hashedPswd = await bcrypt.hash(pswd, saltRounds)

  const code = crypto.randomInt(1000000, 999999)
  const u = prisma.userRegistration.create({
    data: {
      email,
      name,
      pswd: hashedPswd,
      code
    }
  })

  //envoi de l'email avec le code de confirmation

  return u
}

export const emailConfirmed = async(id: string, enteredCode: number) => {
  const u = await prisma.userRegistration.findUnique({
    where: {id},
    select: { code: true }
  })

  if(!u){
    throw new Error("Aucun enregistrement correspondant à cette id trouvé.")
  }
  if(u.code!==enteredCode){
    throw new Error("Code incorrect.")
  }

  //envoi d'un email de demande de création de l'espace bien pris en compte

  return await prisma.userRegistration.update({
    where: {id},
    data: {
      confirmedEmail: true
    }
  })
}

export const acountCreation = async(idRegistration: string, role: UserType) => {
  const u = await prisma.userRegistration.findUnique({
    where: {id: idRegistration}
  })

  if(!u){
    throw new UnknownUserError("Aucun enregistrement correspondant à cette id trouvé. Impossible de procéder à la création du compte.")
  }
  const {name, email, pswd} = u
  const createdUser = await prisma.user.create({
    data:{
      email,
      name,
      pswd,
      role
    }
  })

  await prisma.userRegistration.update({
    where: {id: idRegistration},
    data: {
      confirmedCreation: true
    }
  })

  return createdUser
}

export const connexion = async(email: string, pswd: string) => {
  const user = await prisma.user.findUnique({
    where: {email}
  })

  if(!user){
    throw new Error("Aucun utiliateur correspondant à cette adresse email trouvé.")
  }

  const result = await bcrypt.compare(pswd, user.pswd)
  if(!result){
    throw new Error("Impossible d'accéder à l'espace client, mot de passe incorrect.")
  }

  const SECRET = process.env.JWT_SECRET
  if(!SECRET){
    throw new Error("Aucune clé secrète dans .env.")
  }
  const token = jwt.sign(
    {userId: user.id, role: user.role},
    SECRET,
    {expiresIn: '1h'}
  )

  return {token, user}
}

export const activationAccount = async(id: string) => {
  return prisma.user.update({
    where: {id},
    data: {
      activate: true
    }
  })
}

export const updatesAccount = async(id: string, data: clientInfoType) => {
  const user = await prisma.user.findUnique({
    where: {id}
  })
  if(!user){
    throw new UnknownUserError("Aucun compte lié à cet id.")
  }

  return await prisma.user.update({
    where: {id},
    data: {data}
  })
}

export const getAllUsers = async(filter: filterType) => {
  const paramsFilter = filterFunction(filter)
  const accounts = await prisma.user.findMany({
    where: paramsFilter
  })
  return accounts
}
