import type { Request, Response } from "express"
import { creationAccountClient } from "../services/user.service"
import { StatusCodes } from "http-status-codes"
import { gestionErrors } from "../helpers/gestionErrors.helpers"
import { prisma } from "../lib/prisma"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import type { MyData } from "../types/workers.types"
import { mailerQueue } from "../workers/emailworker"
import { mailValidationFunction } from "../htmlFunctions/mailConfirmation"

export const creationClientAccountController = async (req: Request, res: Response) => {
  try {
    const user = await creationAccountClient(req.body)
    console.log("etapefianleok")
    return res.status(StatusCodes.CREATED).json({success: true, message: "Compte client bien créé.", user})
  } catch (error) {
    gestionErrors(error, res)
  }
}

export const verifyTokenController = async(req: Request, res: Response) => {
  try {
    const {email ,token} = req.params
    if(!email || typeof email !== "string"){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Erreur: email"})
    }
    if(!token || typeof token !== "string"){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Token absent."})
    }

    const now = new Date()
    const userData = await prisma.user.findFirst({
      where: {
        email,
        validate_user: false
      },
      select: {
        id: true,
        verify_token: true,
        token_expires_at: true,
        validate_user: true,
        firstname: true,
        lastname: true
      }
    })

    if(!userData){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message:"Compte utilisateur déjà existant."})
    }
    if(userData.token_expires_at < now.toISOString()){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message:"Token expiré."})
    }
    const ok = await bcrypt.compare(userData.verify_token, token)
    if(!ok){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message:"token non correspondant."})
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userData.id
      },
      data: {
        verify_token: "",
        validate_user: true
      }
    })
    const jobData: MyData = {
      to: email,
      subject: "Compte validé",
      html: mailValidationFunction(userData.firstname, userData.lastname)
    }
    mailerQueue.add("Compte valide", jobData)
    return res.status(StatusCodes.OK).json({success: true, updatedUser})
  } catch (error) {
    gestionErrors(error, res)
  }
}

export const login = async(req: Request, res: Response) => {
  try {
    const {email, pswd} = req.body
    if(!email || typeof email === "string"){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message:"email incorrect ou manquant."})
    }
    if(!pswd || typeof pswd === "string"){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message:"type du mot de passe incorrect ou mot de passe manquant."})
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
        validate_user: true
      },
      select: {
        id: true,
        pswd: true,
        role: true
      }
    })
    if(!user){
      return res.status(StatusCodes.NOT_FOUND).json({success: false, message: "Aucun compte client trouvé."})
    }

    const ok = await bcrypt.compare(user.pswd, pswd)
    if(!ok){
      return(res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Mot de passe incorrect."}))
    }

    const JWT_SECRET_KEY = process.env.JWT_SECRET
    if(!JWT_SECRET_KEY){
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success: false, message:"JWT_SECRET_KEY absente du fichier .env."})
    }

    const token = jwt.sign({
      userId: user.id,
      role: user.role
    }, JWT_SECRET_KEY, {expiresIn: "24h"})

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 1000 
    })

    return res.status(StatusCodes.OK).json({success: true, message: "Connexion réussie."})
  } catch (error) {
    gestionErrors(error, res)
  }
}

export const logout = async(req: Request, res: Response) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    return res.status(StatusCodes.OK).json({success: false, message: "Déconnexion réussie."})
  } catch (error) {
   gestionErrors(error, res) 
  }
}