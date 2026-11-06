import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const ALLOWED_FILE_TYPES = [
  "identity",
  "professional_card",
  "license_drive",
  "ADS",
  "logbook",
  "proof_of_address",
  "health_insurance_card",
  "craftmen_s_registration_card"
]

type fieldnameType = typeof ALLOWED_FILE_TYPES[number]

export const validateSingleFile = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file
  const documentType = req.body.documentType
  if(!file){
    return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Aucun fichier sélectionné."})
  }
  if(!ALLOWED_FILE_TYPES.includes(documentType as fieldnameType)){
    return res.status(StatusCodes.BAD_REQUEST).json({success: false, message:"Le type de champs est incorrect."})
  }

  next()
}

export const validateMultipleFiles = (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as { [fieldname: string] : Express.Multer.File[]}
  if(!files){
    return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: "Aucun fichier sélectionné."})
  }

  for(const [key, value] of Object.entries(files)){
    if(!ALLOWED_FILE_TYPES.includes(key as fieldnameType)){
      return res.status(StatusCodes.BAD_REQUEST).json({success: false, message:"Le type de champs est incorrect."})
    }
  }
  next()
}
