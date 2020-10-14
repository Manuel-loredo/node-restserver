const express = require('express');
const Usuario = require('../models/usuario');
const {verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
const _ = require('underscore');
const bcrypt = require('bcrypt');

const app = express();

//#############################GET#################################//
app.get('/usuario', verificaToken,(req, res) => {

    let desde = req.query.desde || 0;
        desde = Number(desde);

    let limite = req.query.limite || 5; 
        limite = Number(limite);

   Usuario.find({estado: true}, 'nombre email role estado google img')
            .skip(desde)
            .limit(limite)
            .exec((err, usuarios) => {
                if(err) {
                    return res.status(400).json({
                            ok: false,
                            err: err
                        });
                    }
                    Usuario.count({estado: true}, (err, conteo) => {
                        res.json({
                            ok: true,
                            usuarios: usuarios,
                            cuantos: conteo
                         });   
                    });
                
            })
  });

//#############################GET-FIN#################################//


//#############################POST#################################//
  app.post('/usuario', [verificaToken, verificaAdmin_Role], function (req, res) {
        
    let body = req.body;
  
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if(err) {
        return res.status(400).json({
                ok: false,
                err: err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

      
    });
//#############################POST-FIN##############################//


//#############################PUT#################################// 
    app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {
        
        let id = req.params.id;
        let body = _.pick(req.body,[ 'nombre','email','img','role','estado'] ); 
        
      Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true }, (err, usuarioDB) => {
        
        if(err) {
            return res.status(400).json({
                    ok: false,
                    err: err
                });
            }

        res.json({
            ok:true,
            usuario: usuarioDB
        });

      });
    
    });
 //#############################PUT-FIN#################################//  



 //#############################DELETE#################################// 
    app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {
        let id = req.params.id;
        let cambiaEstado = {
            estado: false
        }
        //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
         Usuario.findByIdAndUpdate(id, cambiaEstado, {new: true }, (err, usuarioBorrado) => {
           
            if(err) {
                return res.status(400).json({
                        ok: false,
                        err: err
                    });
                }

                if(!usuarioBorrado) {
                    return res.status(400).json({
                        ok: false,
                       err: {
                           message: 'Usuario no encontrado'
                       }
                    });
                }

                res.json({
                    ok: true,
                    usuario: usuarioBorrado
                });
        });
    });
//#############################DELETE-FIN#################################// 
  
module.exports = app; 

