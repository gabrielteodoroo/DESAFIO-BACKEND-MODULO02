# Projeto Banco Digital

Este projeto implementa as funcionalidades de um banco digital que permite a criação de contas bancárias, depósitos, saques, transferências, consultas de saldo e emissão de extrato bancário.

## Endpoints

-   Listar contas bancárias
-   Criar conta bancária	
-   Atualizar os dados do usuário da conta bancária
-   Excluir uma conta bancária
-   Depósitar em uma conta bancária
-   Sacar de uma conta bancária
-   Transferir valores entre contas bancárias
-   Consultar saldo da conta bancária
-   Emitir extrato bancário

## Listar contas bancárias.

Lista todas as contas bancárias.<br>

```
// Request
// GET /contas

// status 200 OK

[
    {
        "numero": "1",
        "saldo": 0,
        "usuario": {
            "nome": "Foo Bar",
            "cpf": "00011122233",
            "data_nascimento": "2021-03-15",
            "telefone": "71999998888",
            "email": "foo@bar.com",
            "senha": "1234"
        }
    },
    {
        "numero": "2",
        "saldo": 1000,
        "usuario": {
            "nome": "Foo Bar 2",
            "cpf": "00011122234",
            "data_nascimento": "2021-03-15",
            "telefone": "71999998888",
            "email": "foo@bar2.com",
            "senha": "12345"
        }
    }
]
```

## Criar conta bancária

Cria uma conta bancária<br>

```
// Request
// POST /contas
// body JSON

{
    "nome": "Foo Bar 2",
    "cpf": "00011122234",
    "data_nascimento": "2021-03-15",
    "telefone": "71999998888",
    "email": "foo@bar2.com",
    "senha": "12345"
}

// Response
// Status 201 CREATED
```

## Atualizar usuário da conta bancária

Atualiza o usuário da conta bancária que foi passada.<br>

```
// Request
// PUT /contas/:numeroConta/usuario

{
    "nome": "Foo Bar 3",
    "cpf": "99911122234",
    "data_nascimento": "2021-03-15",
    "telefone": "71999998888",
    "email": "foo@bar3.com",
    "senha": "12345"
{
```

## Excluir conta

Exclui uma conta.<br>

```
// Request
// DELETE /contas/:numeroConta

// status 200 OK
```

## Depositar

Faz o deposito na conta bancária<br>

```
// POST /transacoes/depositar

{
	"numero_conta": "1",
	"valor": 1900
}

// statu 200 OK
```

## Sacar

Faz um saque

```
/ POST /transacoes/sacar
{
	"numero_conta": "1",
	"valor": 1900,
    "senha": "123456"
}

// status 200 OK
```

## Transferir

Faz uma transferência.<br>

```
// POST /transacoes/transferir
{
	"numero_conta_origem": "1",
	"numero_conta_destino": "2",
	"valor": 200,
	"senha": "123456"
}

// status 200 OK
```
## Saldo

Exibe o saldo da conta.<br>

```
// GET /contas/saldo?numero_conta=123&senha=123

// status 200 OK
```

## Extrato

Exibe o extrato da conta.<br>

```
// GET /contas/extrato?numero_conta=123&senha=123

// status 200 OK




















