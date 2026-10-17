import type { Response } from "express"
import { StatusCodes } from "http-status-codes"

export class BadRequestError extends Error{
  public status: number = 400
  constructor(message: string){
    super(message)
  }
}

export class KnownUserError extends Error{
  public status: number = 401
  constructor(message: string){
    super(message)
  }
}

export class UnknownUserError extends Error{
  public status: number = 400
  constructor(message: string){
    super(message)
  }
}

export const gestionErrors = async(error: unknown, res: Response) => {
  if(error instanceof BadRequestError){
    return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: error.message})
  }else if(error instanceof KnownUserError){
    return res.status(StatusCodes.UNAUTHORIZED).json({success: false, message: error.message})
  }else if(error instanceof UnknownUserError){
    return res.status(StatusCodes.BAD_REQUEST).json({success: false, message: error.message})
  }
}