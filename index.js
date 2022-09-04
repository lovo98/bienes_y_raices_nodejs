// importaciones
import express from 'express';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
// routers
import usuarioRouter from './routers/usuarioRouter.js';
// database
import db from './config/db.js';

// constantes de la app
const app = express();
const port = process.env.PORT || 3000;

// habilitando lectura json
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(cookieParser())
app.use(csurf({ cookie: true }))

// conexion a la db
try {
    await db.authenticate();
    db.sync();
    console.log("Conexion a la base de datos exitosa");
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
