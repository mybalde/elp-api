import { Router} from "express";
import { login, logout } from "../controllers/user.controller";

const router = Router()
//Connexion d'un utilisateur
router.post("/login", login)
//deconnexion d'un utilisateur
router.post("/logout", logout)

export default router