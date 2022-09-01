// importaciones
import express from 'express';
// routers
import usuarioRouter from './routers/usuarioRouter.js';
// database
import db from './config/db.js';

// constantes de la app
const app = express();
const port = 3000;

// conexion a la db
try {
    await db.authenticate();
    console.log("Done database");
} catch (error) {
    console.log("error db", error);
}

// habilitar pug
app.set('view engine', 'pug');
app.set('views', './views');

// CARPETA PUBLICA 
app.use(express.static('public'));

// declaracion de routing
app.use('/auth', usuarioRouter)

app.listen(port, () => {
    console.log(`servidor en el puerto ${port}`);
});
