import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "../generated/prisma/client";
import { acountCreation, activationAccount, connexion, emailConfirmed, getAllUsers, updatesAccount, userRegistration } from "../services/user.service";
import { gestionErrors } from "../helpers/gestionErrors.helpers";
import { clientInformationsSchema, codeSchema, filterSchema } from "../schema/user.schema";
import z from "zod";
import { prisma } from "../lib/prisma";
import strict from "node:assert/strict";

//enregistrement d'un utilisateur client qui crée son espace dédié.
export const userRegistrationController = async (req: Request, res: Response) => {
  try {
    const user = await userRegistration(req.body)
    return res.status(StatusCodes.CREATED).json({success: true, user})
  } catch (error) {
    if(error instanceof Prisma.PrismaClientKnownRequestError){
      if(error.code === 'P2002'){
        console.log("L'email est déjà utilisé.")
        return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Un email correspondant existe déjà."})
      }
    }
    gestionErrors(error, res)
  }
}
//confirmation de l'adresse email
export const emailConfirmation = async(req: Request, res: Response) => {
  try {
    const code = codeSchema.safeParse(req.body)
    if(!code.success){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Erreur dans le type du code", error: code.error})
    }
    const {idRegistration} = req.params
    await emailConfirmed(idRegistration as string, code.data)
    return res.status(StatusCodes.OK).json({success: true, message: "Email confirmé."})
  } catch (error) {
    gestionErrors(error, res)
  }
}
//création d'un utilisateur
//Seul un admin ou un superadmin peut effectuer cette action
export const userCreation = async(req:Request, res: Response) => {
  try {
    //id de l'enregistrement dans la requête 
    const {idRegister} = req.params
    const createdUser = await acountCreation(idRegister as string, req.body)
    return res.status(StatusCodes.CREATED).json({success: true, createdUser})
  } catch (error) {
    gestionErrors(error, res)
  }
}
//Connexion à un compte
export const connexionAccount = async(req: Request, res: Response) => {
  try {
    const {email, pswd} = req.body
    if(!email){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Email manquant."})
    }
    const parsedEmail = z.email().safeParse(email)
    if(!parsedEmail.success){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Email incorrect."})
    }
    if(!pswd){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Mot de passe manquant."})
    }

    const connected = await connexion(parsedEmail.data, pswd)
    res.cookie('token', connected.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'strict',
      maxAge: 3600000
    })
    return res.status(StatusCodes.OK).json({success: true, user: connected.user})
  } catch (error) {
    gestionErrors(error, res)
  }
}
//Activation d'un compte dont il faut un collaborateur pour un client, un admin pour un collaborateur, un superadmin pour un admin
export const activation = async(req: Request, res: Response) => {
  try {
    const {idAccount} = req.params
    const activatedAccount = await activationAccount(idAccount as string)
    return res.status(StatusCodes.OK).json({success: true, activatedAccount})
  } catch (error) {
    if(error instanceof Prisma.PrismaClientUnknownRequestError){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Aucun compte trouvé.", error: error.message})
    }
    gestionErrors(error, res)
  }
}
//désactivation du compte client
export const desactivation = async(req: Request, res: Response) => {
  try {
    const {idAccount} = req.params
    const user = await prisma.user.update({
      where:{id: idAccount as string},
      data: {
        activate: false
      }
    })
    return res.status(StatusCodes.OK).json({success: true, user})
  } catch (error) {
    if(error instanceof Prisma.PrismaClientUnknownRequestError){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Client correspondant à l'id non existant."})
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success: false, message: "Erreur interne du serveur lors de désactivation du compte."})
  }
}
//Changement des informations d'un utilisateur
export const userUpdates = async(req: Request, res: Response) => {
  try {
    const i = clientInformationsSchema.safeParse(req.body)
    if(!i.success){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Erreur dans le type de données à update.", error: i.error})
    }
    req.body = i.data
    const updatedUser = await updatesAccount(req.params.idAccount as string, req.body)
    return res.status(StatusCodes.OK).json({success: true, updatedUser})
  } catch (error) {
    gestionErrors(error, res)
  }
}
//avoir les informations sur un user
export const getUser = async(req: Request, res: Response) => {
  try {
    const {idAccount} = req.params
    const user = await prisma.user.findUnique({
      where: {id: idAccount as string}
    })
    return res.status(StatusCodes.OK).json({success: true, user})
  } catch (error) {
    if(error instanceof Prisma.PrismaClientUnknownRequestError){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Aucun compte associé à cet id."})
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success: false, message: "Une erreur interne est survenue."})
  }
}

export const getUsersWithFilters = async(req: Request, res: Response) => {
  try {
    const filter = filterSchema.safeParse(req.query)
    if(!filter.success){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Erreur dans les querys.", error: filter.error})
    }
    const users = await getAllUsers(filter.data)
    return res.status(StatusCodes.OK).json({success: true, users})
  } catch (error) {
    gestionErrors(error, res)
  }
}
//deconnection
export const disconnexion = async(req: Request, res: Response) => {
  try {
    //à travers le middleware il est certains que la personne est connectée
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'strict'
    })

    return res.status(StatusCodes.OK).json({message: "Déconnexion réussie."})
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "Erreur interne du serveur lors de la déconnexion."})
  }
} 