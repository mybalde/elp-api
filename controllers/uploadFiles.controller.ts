import type { Request, Response } from "express";
import { uploadMultipleFiles, uploadSingleFileService } from "../services/uploadFiles.service";
import { StatusCodes } from "http-status-codes";
import { gestionErrors } from "../helpers/gestionErrors.helpers";

export const uploadSingleFileController = async(req: Request, res: Response) => {
  try {
    //le type de champs du fichier est déjà validé à travers le middleware
    const {clientId} = req.params
    const file = req.file as Express.Multer.File 

    await uploadSingleFileService(clientId as string, file)
  } catch (error) {
    gestionErrors(error, res)
  }
}

export const uploadMultipleFilesController = async(req: Request, res: Response) => {
  try {
    const {clientId} = req.params
    const files = req.files as {
      [fieldname: string] : Express.Multer.File[]
    }

    await uploadMultipleFiles(clientId as string, files)
  } catch (error) {
    
  }
}