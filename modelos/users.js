const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bcrypt = require('bcrypt');


const UserSchema = new Schema({

    nome: { type: String, required: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    senha: { type: String, required: true }

});

UserSchema.pre('save', function (next) {

    let user = this;

    bcrypt.hash(user.senha, 10, (err, encrypted) => {

        user.senha = encrypted;

        return next();

    });

});

module.exports = mongoose.model('User', UserSchema);
