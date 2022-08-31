import express from 'express';
import { formularioLogin, formularioRTegistro } from '../controllers/usuarioController.js'

const router = express.Router();

router.get('/login', formularioLogin)
router.get('/registro', formularioRTegistro)

export default router;