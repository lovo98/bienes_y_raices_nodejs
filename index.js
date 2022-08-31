// importaciones
import express from 'express';

// routers
import usuarioRouter from './routers/usuarioRouter.js';

// constantes de la app
const app = express();
const port = 3000;

// habilitar pug
app.set('view engine', 'pug');
app.set('views', './views')

// declaracion de routing
app.use('/auth', usuarioRouter)

app.listen(port, () => {
    console.log(`servidor en el puerto ${port}`);
});
