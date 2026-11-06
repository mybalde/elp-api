import { Router } from "express";
import { handleUserRegistration, requiredClientIdParams } from "../middlewares/user.middleware";
import { createUserAccountSchema } from "../schema/user.schema";
import { creationClientAccountController, verifyTokenController } from "../controllers/user.controller";
import { validateMultipleFiles } from "../middlewares/uploadFile.middleware";
import { uploadMultipleFilesController } from "../controllers/uploadFiles.controller";
import { upload } from "../config/multer";

const router = Router()
router.post("/registration", handleUserRegistration(createUserAccountSchema) ,creationClientAccountController)
router.get("/verify-email", verifyTokenController)
router.post("/upload/:clientId", upload.fields([
  {name: "identity", maxCount: 1},
  {name: "professional_card", maxCount: 1},
  {name: "license_drive", maxCount: 1},
  {name: "ADS", maxCount: 1},
  {name: "logbook", maxCount: 1},
  {name: "proof_of_address", maxCount: 1},
  {name:"health_insurance_card", maxCount: 1},
  {name: "craftmen_s_registration_card", maxCount: 1}
]),requiredClientIdParams, validateMultipleFiles, uploadMultipleFilesController)

export default router