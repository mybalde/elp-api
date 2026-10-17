import { Router} from "express";
import { connexionAccount, disconnexion } from "../controllers/user.controller";

const router = Router()
//Connexion d'un utilisateur
router.post("/login", connexionAccount)
//deconnexion d'un utilisateur
router.post("/logout", disconnexion)

export default router