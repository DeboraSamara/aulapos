const express = require('express');

const app = express();

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const users = require('./modelos/users');

const jwt = require('jsonwebtoken');

const url = 'mongodb+srv://usuario2021:senha489@cluster0.tb4lv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const bcrypt = require('bcrypt');

const auth = require('./auth');


const options = {
    reconnectTries: Number.MAX_VALUE, reconnectInterval: 500, poolSize: 5, useNewUrlParser: true
}

mongoose.connect(url, options);

mongoose.connection.on('connected', () => {

    console.log("Aplicação conectada ao banco de dados!");

})

mongoose.connection.on('error', (err) => {

    console.log("Erro na conexão com banco de dados:" + err);

})

mongoose.connection.on('disconnected', () => {

    console.log("Aplicação desconectada do banco de dados!");

})


app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

/**app.get('/', (req, res) => {

    let obj = req.query;
    
    res.send(`Hello World! Você enviou nome ${obj.nome} e idade ${obj.idade}`)
    
})**/

app.listen(3000, () => {

    console.log(`Example app listening at http://localhost:3000`)

})

app.get('/', auth, (req, res) => {

    users.find({}, (err, data) => {

        if (err) return res.send({ error: 'Erro na consulta de usuário!' });

        return res.send(data);

    });

})

app.post('/create', auth, (req, res) => {

    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.send({ error: 'Dados insuficientes!' });
    users.findOne({ email }, (err, data) => {
        if (err) return res.send({ error: 'Erro ao buscar usuáio!' });
        if (data) return res.send({ error: 'usuário já cadastrado' });
        users.create(req.body, (err, data) => {
            if (err) return res.send({ error: 'Erro ao criar usuário' });
            data.senha = undefined;
            return res.send({ data, token: createUserToken(data.id) });

        });
    });
})

app.post('/auth', auth, (req, res) => {

    const { email, senha } = req.body;

    if (!email || !senha) return res.send({ error: 'Dados insuficientes!' });

    users.findOne({ email }, (err, data) => {

        if (err) return res.send({ error: 'Erro ao buscar usuário!' });

        if (!data) return res.send({ error: 'Usuário não registrado' });

        bcrypt.compare(senha, data.senha, (err, same) => {

            if (!same) return res.send({ error: 'Erro ao autenticar usuário!' });

            return res.send({ data, token: createUserToken(data.id) });

        });

    });

});

const createUserToken = (userId) => {

    return jwt.sign({ id: userId }, 'umasenha', { expiresIn: '7d' });

}

