import type { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { type ZodType } from "zod"
import * as jwt from 'jsonwebtoken'
import type { UserType } from "../generated/prisma/enums";

export interface MyPayload extends jwt.JwtPayload {
  userId: string;
  role: UserType;
}


export const handleUserRegistration = (Schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = Schema.safeParse(req.body)
    if(!result.success){
      console.log(result.error.message)
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Un ou plusieurs champs manquent ou contiennent des erreurs.",
        errors: result.error.issues.map((issue) => {
          field: issue.path
          type: issue.code
          message: issue.message
        })})
    }

    req.body = result.data
    next()
  }
}

export const validateAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ')? header.slice(7) : null
  if(!token) return res.status(StatusCodes.UNAUTHORIZED).json({error: "Token manquant."})
  
  try{
    const SECRET = process.env.JWT_SECRET
    if(!SECRET){
      throw new Error("[CRITIQUE] Aucune clé secrète dans .env.")
    }
    const decoded = jwt.verify(token, SECRET) as MyPayload

    req.user!.userId = decoded.userId
    req.user!.role = decoded.role
    next();
  }catch{
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Token invalide ou expiré' });
  }
}

export const requireCollaborators = (req: Request, res: Response, next: NextFunction) => {
  if(!req.user){
    return res.status(StatusCodes.UNAUTHORIZED).json({success: false, message: "Utilisateur non connecté."})
  }
  const {role, userId} = req.user
  if(role!=="ADMIN" && role!=="SUPERADMIN" && role!=="COLLABORATOR"){
    return res.status(StatusCodes.UNAUTHORIZED).json({success: false, message: "Seul un admin ou un superadmin peut effectuer cette action."})
  }
  if(userId!==req.params.idColab){
    return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Le user connectté n'est celui qui effectue l'action. Error dans les params de l'url."})
  }
  next()
}