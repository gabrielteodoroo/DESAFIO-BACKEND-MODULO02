const senhaBanco = require('../constantes/senha')

const validarSenha = (req, res, next) => {
    const { senha_banco } = req.query

    if(!senha_banco){
        return res.status(401).json("A senha não foi informada")
    }else if(senha_banco !== senhaBanco){
        return res.status(401).json("Senha incorreta")
    }

    next()
}

module.exports = validarSenha