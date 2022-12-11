const express = require('express')
const { 
    cadastrarContaBancaria,
    listarContasBancarias,
    atualizarUsuarioDaConta,
    depositar,
    sacar,
    transferir,
    saldo,
    excluirConta,
    extrato
    } = require('../controladores/contasbancarias')
const validarSenha = require('../middlewares/validarsenha')

const roteador = express()



roteador.post('/contas', cadastrarContaBancaria)
roteador.delete('/contas/:numeroConta', excluirConta)
roteador.put('/contas/:numeroConta/usuario', atualizarUsuarioDaConta)
roteador.post('/transacoes/depositar', depositar)
roteador.post('/transacoes/sacar', sacar)
roteador.post('/transacoes/transferir', transferir)
roteador.get('/contas/saldo', saldo)
roteador.get('/contas/extrato',extrato)
roteador.use(validarSenha)
roteador.get('/contas', listarContasBancarias)



module.exports = roteador