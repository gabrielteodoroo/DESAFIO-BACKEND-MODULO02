const { query } = require("express");
const { format } = require("date-fns");
const bancodedados = require("../dados/bancodedados.json");

let id = 1;
const cadastrarContaBancaria = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha, saldo } =
        req.body;

    const cadastroValido = validarInformacoesDaConta(
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    );

    if (!cadastroValido) {
        return res.status(400).json("Todos os campos são obrigatórios");
    }

    if (bancodedados.contas.length > 0) {
        const emailOuCpfEncontrada = encontrarContaPeloCpfOuEmail(cpf, email);
        if (emailOuCpfEncontrada) {
            return res
                .status(400)
                .json("Já existe uma conta com cpf ou e-mail informado!");
        }
    }

    const conta = {
        numero: id++,
        saldo: saldo || 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha,
        },
    };

    bancodedados.contas.push(conta);
    escreverArquivos(bancodedados);
    return res.status(201).json();
};

const listarContasBancarias = (req, res) => {
    return res.status(200).json(bancodedados);
};

const atualizarUsuarioDaConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    const { numeroConta } = req.params;
    const inputValido = validarInformacoesDaConta(
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    );
    if (!inputValido) {
        return res.status(400).json("Todos os campos são obrigatórios");
    }
    console.log(numeroConta);
    const contaEncontrada = encontrarContaPeloNumero(numeroConta);

    if (contaEncontrada === -1) {
        return res.status(400).json("Conta não encontrada");
    }

    const validarCpfeEmail = encontrarContaPeloCpfOuEmail(cpf, email);
    if (validarCpfeEmail) {
        return res
            .status(400)
            .json("Já existe uma conta com cpf ou e-mail informado!");
    }

    bancodedados.contas[contaEncontrada].usuario = {
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha,
    };
    escreverArquivos(bancodedados);
    return res.status(204).json();
};

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body;

    const inputValido = validarInformacoesDeDeposito(numero_conta, valor);
    if (!inputValido) {
        return res
            .status(400)
            .json("O número da conta e valor são obrigatórios");
    }

    const contaEncontrada = encontrarContaPeloNumero(numero_conta);
    if (contaEncontrada === -1) {
        return res.status(400).json("Conta não encontrada");
    }

    if (valor <= 0) {
        return res
            .status(400)
            .json("Não é possível depositar valores negativos ou zerados");
    }

    const data = format(new Date(), "MM-dd-yyyy HH:mm:ss");
    const deposito = {
        data,
        numero_conta,
        valor,
    };

    bancodedados.contas[contaEncontrada].saldo += valor;
    bancodedados.depositos.push(deposito);
    escreverArquivos(bancodedados);
    return res.status(204).json();
};

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    const inputValido = validarInformacoesDeSaque(numero_conta, valor, senha);
    if (!inputValido) {
        res.status(400).json("Número da conta, valor e senha são obrigatórios");
    }

    const contaEncontrada = encontrarContaPeloNumero(numero_conta);
    if (contaEncontrada === -1) {
        return res.status(400).json("Conta não encontrada");
    }

    if (bancodedados.contas[contaEncontrada].usuario.senha !== senha) {
        return res.status(401).json("Senha inválida");
    }

    if (
        bancodedados.contas[contaEncontrada].saldo <= 0 ||
        valor > bancodedados.contas[contaEncontrada].saldo
    ) {
        return res.status(400).json("Não há saldo disponível para saque");
    }
    const data = format(new Date(), "MM-dd-yyyy HH:mm:ss");

    const saque = {
        data,
        numero_conta,
        valor,
    };

    bancodedados.contas[contaEncontrada].saldo -= valor;

    bancodedados.saques.push(saque);
    escreverArquivos(bancodedados);
    return res.status(204).json();
};

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } =
        req.body;
    const inputValido = validarInformacoesDeTransferencia(
        numero_conta_origem,
        numero_conta_destino,
        valor,
        senha
    );
    if (!inputValido) {
        return res.status(400).json("Todos os campos são obrigatórios");
    }

    const contaOrigemEncontrada = encontrarContaPeloNumero(numero_conta_origem);
    if (contaOrigemEncontrada === -1) {
        return res.status(400).json("Conta origem não encontrada");
    }

    const contaDestinoEncontrada =
        encontrarContaPeloNumero(numero_conta_destino);
    if (contaDestinoEncontrada === -1) {
        return res.status(400).json("Conta origem não encontrada");
    }

    if (bancodedados.contas[contaOrigemEncontrada].usuario.senha !== senha) {
        return res.status(401).json("Senha inválida");
    }

    if (
        bancodedados.contas[contaOrigemEncontrada].saldo <= 0 ||
        valor > bancodedados.contas[contaOrigemEncontrada].saldo
    ) {
        return res
            .status(400)
            .json("Não há saldo disponível para transferência");
    }
    const data = format(new Date(), "MM-dd-yyyy HH:mm:ss");

    const transferencia = {
        data,
        numero_conta_origem,
        numero_conta_destino,
        valor,
    };

    bancodedados.contas[contaOrigemEncontrada].saldo -= valor;

    bancodedados.contas[contaDestinoEncontrada].saldo += valor;

    bancodedados.transferencias.push(transferencia);
    escreverArquivos(bancodedados);
    return res.status(204).json();
};

const excluirConta = (req, res) => {
    const { numeroConta } = req.params;

    const conta = encontrarContaPeloNumero(numeroConta);
    if (conta === -1) {
        return res.status(400).json("Conta não encontrada");
    }

    if (bancodedados.contas[conta].saldo > 0) {
        return res
            .status(400)
            .json("A conta só pode ser removida se o saldo for zero!");
    }

    bancodedados.contas.splice(conta, 1);
    escreverArquivos(bancodedados);
    return res.status(204).json();
};

const saldo = (req, res) => {
    const { numero_conta, senha } = req.query;

    const inputValido = verificarInputNumeroSenha(numero_conta, senha);
    if (!inputValido) {
        return res.status(400).json("Número da conta e senha são obrigatórios");
    }

    const contaEncontrada = encontrarContaPeloNumero(numero_conta);
    if (contaEncontrada === -1) {
        return res.status(400).json("Conta não encontrada");
    }

    if (bancodedados.contas[contaEncontrada].usuario.senha !== senha) {
        return res.status(401).json("Senha inválida");
    }

    return res
        .status(200)
        .json(`Saldo:${bancodedados.contas[contaEncontrada].saldo}`);
};

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;

    const inputValido = verificarInputNumeroSenha(numero_conta, senha);
    if (!inputValido) {
        return res.status(400).json("Número da conta e senha são obrigatórios");
    }

    const contaEncontrada = encontrarContaPeloNumero(numero_conta);
    if (contaEncontrada === -1) {
        return res.status(400).json("Conta não encontrada");
    }

    if (bancodedados.contas[contaEncontrada].usuario.senha !== senha) {
        return res.status(401).json("Senha inválida");
    }

    const transferenciaEncontrada = verificarTransferencias(numero_conta);

    let transferenciaEnviada = [];
    let transferenciaRecebida = [];
    const depositoEncontrado = verificarDepositos(numero_conta);
    const saqueEncontrado = verificarSaques(numero_conta);

    for (const item of transferenciaEncontrada) {
        if (item.numero_conta_origem == numero_conta) {
            transferenciaEnviada.push(item);
        } else if (item.numero_conta_destino == numero_conta) {
            transferenciaRecebida.push(item);
        }
    }

    const extrato = {
        depositos: depositoEncontrado,
        saques: saqueEncontrado,
        transferenciasEnviadas: transferenciaEnviada,
        transferenciaRecebida: transferenciaRecebida,
    };

    return res.status(200).json(extrato);
};

const verificarSaques = (numeroConta) => {
    let saques = [];
    bancodedados.saques.forEach((saque) => {
        if (saque.numero_conta === numeroConta) {
            saques.push(saque);
        }
    });
    return saques;
};

const verificarDepositos = (numeroConta) => {
    let depositos = [];
    bancodedados.depositos.forEach((deposito) => {
        if (deposito.numero_conta === numeroConta) {
            depositos.push(deposito);
        }
    });
    return depositos;
};

const verificarTransferencias = (numero) => {
    let transferencias = [];
    bancodedados.transferencias.forEach((transferencia) => {
        if (
            transferencia.numero_conta_origem == numero ||
            transferencia.numero_conta_destino == numero
        ) {
            transferencias.push(transferencia);
        }
    });
    return transferencias;
};

const verificarInputNumeroSenha = (numero_conta, senha) => {
    if (!numero_conta || !senha) {
        return false;
    }
    return true;
};

const encontrarContaPeloNumero = (numero) => {
    const contaEncontrada = bancodedados.contas.findIndex((conta) => {
        return conta.numero === Number(numero);
    });
    return contaEncontrada;
};

const encontrarContaPeloCpfOuEmail = (cpf, email) => {
    const cpfOuEmailEncontrado = bancodedados.contas.find((conta) => {
        if (conta.usuario.cpf === cpf || conta.usuario.email === email) {
            return conta;
        } else {
            return undefined;
        }
    });

    return cpfOuEmailEncontrado;
};

const validarInformacoesDeSaque = (numero_conta, valor, senha) => {
    if (!numero_conta || !valor || !senha) {
        return false;
    }
    return true;
};

const validarInformacoesDeTransferencia = (
    numero_conta_origem,
    numero_conta_destino,
    valor,
    senha
) => {
    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return false;
    }
    return true;
};

const validarInformacoesDeDeposito = (numero_conta, valor) => {
    if (!numero_conta || !valor) {
        return false;
    }
    return true;
};

const validarInformacoesDaConta = (
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    senha
) => {
    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return false;
    }
    return true;
};

const escreverArquivos = async (bancodedados) => {
    const fs = require("fs/promises");

    await fs.writeFile(
        "./src/dados/bancodedados.json",
        JSON.stringify(bancodedados)
    );
};

module.exports = {
    listarContasBancarias,
    cadastrarContaBancaria,
    atualizarUsuarioDaConta,
    depositar,
    sacar,
    transferir,
    saldo,
    excluirConta,
    extrato,
};
