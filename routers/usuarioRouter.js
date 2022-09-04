import express from 'express';
import {
    formularioLogin,
    formularioRTegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticar
} from '../controllers/usuarioController.js'

const router = express.Router();

// render vistas
router.get('/login', formularioLogin)
router.get('/registro', formularioRTegistro)
router.get('/olvide-password', formularioOlvidePassword)

// metodos
router.post('/create_registro', registrar)
router.get('/confirmar/:token', confirmar)
router.post('/olvide-password', resetPassword)
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)
router.post('/login', autenticar)

export default router;