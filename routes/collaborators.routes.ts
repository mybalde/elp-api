import { Router} from "express";
import { requireCollaborators, validateAuth } from "../middlewares/user.middleware";
import { activateUser, deactivateUser } from "../controllers/usersManagement.controller";

const router = Router()

//nécessite une connection du collaborateur
router.use(validateAuth, requireCollaborators)
//Création d'un compte client
//router.post("/creation_account/:idRegister", userCreation)
//activation d'un compte client
router.patch("/activation_account/:idAccount", activateUser)
//désactivation d'un compte client
router.patch("/desactivation_account/:idAccount", deactivateUser)
//changer les informations d'un utilisateur
//router.patch("/update_account/:idAccount", userUpdates)
//visualiser un compte client
//router.get("/get_user/:idAccount",  getUser)
//visualiser tous les comptes
//router.get("/get_users",  getUsersWithFilters)

export default router