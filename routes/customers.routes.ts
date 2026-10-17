import { Router } from "express";
import { emailConfirmation, userRegistrationController } from "../controllers/user.controller";
import { handleUserRegistration } from "../middlewares/user.middleware";
import { userRegistrationSchema } from "../schema/user.schema";

const router = Router()
//Demande d'enregistrement
router.post("/registration", handleUserRegistration(userRegistrationSchema) ,userRegistrationController)
//Confirmation email
router.post("/email_confirmation", emailConfirmation)

export default router