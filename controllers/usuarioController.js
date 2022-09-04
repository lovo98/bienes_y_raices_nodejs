import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario from "../model/Usuario.js";
import { generarId, generarJWT } from '../helpers/tokens.js';
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js';

// render vistas
const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesion',
        csrfToken: req.csrfToken()
    });
};

const formularioRTegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    });
};

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso',
        csrfToken: req.csrfToken(),
    });
};

// funciones
const registrar = async (req, res) => {
    // validacion
    await check('nombre').notEmpty().withMessage('Nombre requerido').run(req)
    await check('email').isEmail().withMessage('Email no válido').run(req)
    await check('password').isLength({ min: 6 }).withMessage('contraseña no válido').run(req)
    // await check('repetir_password').equals('password').withMessage('No coninciden las contraseñas').run(req)

    let resultado = validationResult(req);

    // verificando mensajes de error
    if (!resultado.isEmpty()) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        });
    }

    // extrayendo datos
    const { nombre, email, password } = req.body

    // verificar usuarios duplicacios
    const existeUsuario = await Usuario.findOne({ where: { email } })
    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'Ya existe un usuario registrado con ese correo' }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        });
    }

    // almacenando usuarios
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    });

    // enviando mensaje de confirmación
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // mostrar mensaje de confirmación
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada',
        mensaje: 'Se ha enviado un correo de confirmación'
    });
};

// comprobando email
const confirmar = async (req, res) => {
    const { token } = req.params;
    // verificamos si el token es valido
    const usuario = await Usuario.findOne({ where: { token } });
    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intentalo de nuevo',
            error: true
        })
    }

    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    return res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta confirmada',
        mensaje: 'Cuenta confirmada con éxito.',
    })
}

// reset password
const resetPassword = async (req, res) => {
    // validacion
    await check('email').isEmail().withMessage('Email no válido').run(req)

    let resultado = validationResult(req);

    // verificando mensajes de error
    if (!resultado.isEmpty()) {
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });
    }

    // Buscando usuario
    const { email } = req.body
    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'Email no existe en la base de datos' }]
        });
    }

    // generar token e enviar email para resetear password
    usuario.token = generarId();
    await usuario.save();

    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    res.render('templates/mensaje', {
        pagina: 'Restablecer tu password',
        mensaje: 'Se ha enviado un correo para restablecer tu password.',
    })

}

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    // verificamos si el token es valido
    const usuario = await Usuario.findOne({ where: { token } });
    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Restablecer password',
            mensaje: 'Hubo un error al restablecer tu password, intentalo de nuevo',
            error: true
        })
    }

    // mostrando formulario para restablecer password;
    return res.render('auth/reset-password', {
        pagina: 'Restablecer tu password',
        csrfToken: req.csrfToken(),
    })
}

const nuevoPassword = async (req, res) => {
    // validacion
    await check('password').isLength({ min: 6 }).withMessage('contraseña no válido').run(req)
    let resultado = validationResult(req);

    // verificando mensajes de error
    if (!resultado.isEmpty()) {
        return res.render('auth/reset-password', {
            pagina: 'Restablecer tu password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        });
    }

    const { token } = req.params
    const { password } = req.body
    // identificar cambios
    const usuario = await Usuario.findOne({ where: { token } })

    // hash
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;
    await usuario.save();

    return res.render('auth/confirmar-cuenta', {
        pagina: 'Password Restablecido',
        mensaje: 'Se ha restablecido tu password con éxito.'
    })

}

const autenticar = async (req, res) => {
    // validacion
    await check('email').isEmail().withMessage('Email no válido').run(req)
    await check('password').notEmpty().withMessage('Password requerido').run(req)

    let resultado = validationResult(req);

    // verificando mensajes de error
    if (!resultado.isEmpty()) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        });
    }

    // comprobar si existe usuario
    const { email, password } = req.body
    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario no existe' }]
        })
    }

    // verificando si la cuenta esta confirmada
    if (!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'Tu cuenta aun no ha sido confirmada' }]
        })
    }

    // comprobando password
    if (!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'Password incorrecto' }]
        })
    }

    // autenticar usuario con json web token
    const token = generarJWT(usuario.id);
    // almacenando token en cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true
    }).redirect('/mis-propiedades');

}

export {
    formularioLogin,
    formularioRTegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticar
}