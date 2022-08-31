const formularioLogin = (req, res) => {
    res.render('auth/login', {
        autenticado: false
    });
};

const formularioRTegistro = (req, res) => {
    res.render('auth/registro', {
        autenticado: false
    });
};

export {
    formularioLogin,
    formularioRTegistro
}