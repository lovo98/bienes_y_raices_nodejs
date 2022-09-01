import express from 'express';
import { formularioLogin, formularioRTegistro, formularioOlvidePassword } from '../controllers/usuarioController.js'

const router = express.Router();

router.get('/login', formularioLogin)
router.get('/registro', formularioRTegistro)
router.get('/olvide-password', formularioOlvidePassword)

export default router;