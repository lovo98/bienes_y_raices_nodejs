import express from 'express';
const router = express.Router();
import {
    admin
} from '../controllers/propiedadController.js';

// vistas
router.get('/mis-propiedades', admin);

export default router;