import type { Request } from "express"
import multer, { type Multer } from "multer"

const ALLOWED_MIME_TYPEs = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg"
]

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024},
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if(ALLOWED_MIME_TYPEs.includes(file.mimetype)){
      cb(null, true)
    }else{
      cb(new Error("Format des fichiers incorrects. Seul les formats PDF, JPG, JPEG et PNG sont acceptés."))
    }
  }
})