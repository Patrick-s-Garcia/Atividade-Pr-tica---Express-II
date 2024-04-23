import express, { json, request, response } from "express";
import cors from "cors"
import bcrypt from "bcrypt"
import { emit } from "nodemon";

const app = express()

app.use(cors())

app.use(express.json())

app.listen(3333, () => console.log("Servidor rodando na porta 3333"))


let administrador = []


let carros = []

let proximoCarro = 1

let proximapessoa = 1


app.post('/carros', (request, response) => {
    const modelo = request.body.modelo
    const marca = request.body.marca
    const ano = request.body.ano
    const cor = request.body.cor
    const preco = Number(request.body.preco)

    if(!modelo){
        response.status(400).send('Passe um modelo válido')
    }
    if(!marca){
        response.status(400).send('Passe uma marca válida')
    }
    if(!ano){
        response.status(400).send('Passe um ano válido')
    }
    if(!cor){
        response.status(400).send('Passe uma cor válida')
    }
    if(!preco){
        response.status(400).send('Passe um valor válido')
    }

    let novoCarro = {
        id : proximoCarro,
        modelo : modelo,
        marca : marca,
        ano : ano,
        cor : cor,
        preco : preco
    }

    carros.push(novoCarro)

    proximoCarro ++ 

    response.status(201).send(`
    O veículo ${modelo} foi criado com sucesso! 
    `)

})

app.get('/carros', (request, response) => {

    if(carros.length === 0){
        response.status(400).send(JSON.stringify("Mensagem: Não existem carros registrados."))
    }
    const dadosMapeados = carros.map((carro) => `| ID: ${carro.id} | Modelo: ${carro.modelo} | Marca: ${carro.marca} | Ano: ${carro.ano} | Cor: ${carro.cor} | Preço: ${carro.preco} |` )

    response.status(200).send(dadosMapeados)
})

app.get('/filtrocarros/:marcaBuscada', (request, response) => {

    const marca = request.params.marcaBuscada
   
    if(!marca){
        response.status(400).send(JSON.stringify("Mensagem: Informe uma marca válida."))
    }

    const marcaVerificada = carros.find((item) => item.marca === marca )

    if(!marcaVerificada){
        response.status(400).send(JSON.stringify("Mensagem: Não existem carros registrados."))
    }
    const marcaFiltrada = carros.filter((carro) => carro.marca === marca  )

    if (marcaFiltrada.length === 0) {
        response.status(400).send("Mensagem: Não existem carros registrados para essa marca.");
        return;
    }


    response.status(200).send(marcaFiltrada.map(carro => `| ID: ${carro.id} | Modelo: ${carro.modelo} | Marca: ${carro.marca} | Ano: ${carro.ano} | Cor: ${carro.cor} | Preço: ${carro.preco} |`))
})

app.put('/carros/:idBuscado', (request, response) => {

    const novaCor = request.body.novaCor
    const novoPreco = request.body.novoPreco

    const id = Number(request.params.idBuscado)
   
    if(!id){
        response.status(400).send(JSON.stringify("Mensagem: Informe um id válido."))
    }

    const idVerificado = carros.findIndex((item) => item.id === id )

    if(idVerificado === -1){
        response.status(400).send(JSON.stringify("Veículo, não encontrado."))
    }
    else{
        carros[idVerificado].cor = novaCor
        carros[idVerificado].preco = novoPreco
    }


    response.status(200).send(`Veículo atualizado => | ID: ${carros[idVerificado].id} | Modelo: ${carros[idVerificado].modelo} | Marca: ${carros[idVerificado].marca} | Ano: ${carros[idVerificado].ano} | Cor: ${carros[idVerificado].cor} | Preço: ${carros[idVerificado].preco} |`)
})

app.delete('/carros/:idBuscado', (request, response) => {

    const id = Number(request.params.idBuscado)
   
    if(!id){
        response.status(400).send(JSON.stringify("Mensagem: Informe um id válido."))
    }

    const idVerificado = carros.findIndex((item) => item.id === id )

    if(idVerificado === -1){
        response.status(400).send(JSON.stringify("Veículo, não encontrado."))
    }
    else{
        carros.splice(idVerificado,1)
    }


    response.status(200).send(`Veículo deletado com sucesso. `)
})

app.post('/signup',async (request,response)=>{

    const data = request.body
  
    const email = data.email
    const senhaDigitada = data.senhaDigitada
  
    if(!email){
      response.status(400).send(JSON.stringify({ Mensagem: "Favor inserir um email válido" }))
    }
  
    if(!senhaDigitada){
      response.status(400).send(JSON.stringify({ Mensagem: "Favor inserir uma senha válida" }))
    }
  
    const verificarEmail = administrador.find((admin)=> admin.email === email)
  
    if(verificarEmail){
      response.status(400).send(JSON.stringify({ Mensagem: "Email já cadastrado no nosso banco de dados" }))
    }
  
    const senhaCriptografada = await bcrypt.hash(senhaDigitada,10)
    
    let novoAdministrador ={
      id : proximapessoa,
      email : data.email, 
      senhaDigitada :senhaCriptografada
    }
  
    administrador.push(novoAdministrador)
  
    proximapessoa++
  
    response.status(201).send(JSON.stringify({ Mensagem: `administrador cadastrado com sucesso! email: ${email}` }))
  
  })
  

app.post('/login',async(request,response)=>{

    const data = request.body 
  
    const email = data.email 
    const senha = data.senha
  
    if(!email){
      response.status(400).send(JSON.stringify({ Mensagem: "Favor inserir um email válido" }))
    }
  
    if(!senha){
      response.status(400).send(JSON.stringify({ Mensagem: "Favor inserir uma senha válida" }))
    }
  
  
    const verificarEmail = administrador.find(admin =>admin.email === email)
  
    if(!verificarEmail){ 
        response.status(400).send(JSON.stringify({ Mensagem: "email incorreto!" }))
      }

    const senhaMatch = await bcrypt.compare(senha, verificarEmail.senhaDigitada)
  
    if(!senhaMatch){ 
      response.status(400).send(JSON.stringify({ Mensagem: "Senha incorreta!" }))
    }
  
  
    response.status(200).send(JSON.stringify({ Mensagem: `Email ${email}, logado com sucesso!` }))
  
  })