import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import { gestionErrors } from "../helpers/gestionErrors.helpers";

export const activateUser = async(req: Request, res: Response) => {
  try {
    const {clientId} = req.params
    const client = await prisma.user.update({
      where: {id: clientId as string},
      data:{
        activate: true
      }
    })

    return res.status(StatusCodes.OK).json({success: true, message: "Compte client actif", client})
  } catch (error) {
    gestionErrors(error, res)
  }
}

export const deactivateUser = async(req: Request, res: Response) => {
  try {
    const {clientId} = req.params
    const client = await prisma.user.update({
      where: {id: clientId as string},
      data:{
        activate: false
      }
    })

    return res.status(StatusCodes.OK).json({success: true, message: "Compte client inactif", client})
  } catch (error) {
    gestionErrors(error, res)
  }
}