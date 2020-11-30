const express = require('express');
const Categoria = require('../models/categoria');
const {verificaToken, verificaAdmin_Role} = require('../middlewares/autenticacion');
const app = express();

//Recordar que tenemos que importar nuestras rutas en el index.js
//para poder utilizar nuestro archivo de categorias

//======================================================================================================
//Mostrar Todas las categorias
//======================================================================================================
 app.get('/categoria', verificaToken, (req, res) => {
       
    Categoria.find({})
                .sort('descripcion')
                 .populate('usuario', 'nombre email') //revisa que ObjectId existen en la categoria
                 .exec((err, categorias) => {
                     //si sucede un error
                if(err) {

                    return res.status(500).json({
                            ok: false,
                            err: err
                        });

                    }

                    res.json({
                        ok: true,
                        categorias
                    });

                 });

 });

//======================================================================================================
//Mostrar una categoria por ID
//======================================================================================================
    app.get('/categoria/:id', verificaToken, (req, res) => {
        
        //guardamos el id que recibimos por medio del url
          let id = req.params.id;
         Categoria.findById(id, (err, categoriaDB) => {
           
            if(err) {
                return res.status(500).json({
                        ok: false,
                        err: err
                    });
                }

            if(!categoriaDB) {
                return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'El Id no existe'
                        }
                        });
                    }

                    res.json({
                        ok: true,
                        categoria: categoriaDB
                    }); 
         });
           
        

    });  

//=========================================================================================================
//Crear nueva categoria
//=========================================================================================================
app.post('/categoria', verificaToken, (req, res) => {
   //recibimos lo que nos envian desde el front end
    let body = req.body;

    //creamos la categoria con la infomacion que mandaremos a la bd
    let categoria = new Categoria({
            descripcion: body.descripcion,
            usuario: req.usuario._id //req.usuario._id se optiene del verficaToken
    });

    // enviamos la informacion a la bd
    categoria.save((err, categoriaDB) => {
       
            //si sucede un error
                if(err) {
                    return res.status(500).json({
                            ok: false,
                            err: err
                        });
                    }

            //manejamos el error si no se crea la categoria
                    if(!categoriaDB) {
                        return res.status(400).json({
                                ok: false,
                                err: err
                            });
                        }

                //mostrar la respuesta con la nueva categoria
                    res.json({
                        ok: true,
                        categoria: categoriaDB
                    });
    });
});

//===============================================================================================================
//Editar una nueva categoria
//================================================================================================================
app.put('/categoria/:id', verificaToken, (req, res) => {
    
    //guardamos el id que recibimos por medio del url
        let id = req.params.id;
    //recibimo toda la informacion desde el front end
        let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    //findByIdAndUpdate() funcion que lo busca por el id y lo actualiza
        Categoria.findByIdAndUpdate(id, descCategoria, {new: true, runValidators: true }, (err, categoriaDB) => {

                    //si sucede un error
                    if(err) {
                        return res.status(500).json({
                                ok: false,
                                err: err
                            });
                        }

                //manejamos el error si no se actualiza la categoria
                        if(!categoriaDB) {
                            return res.status(400).json({
                                    ok: false,
                                    err: err
                                });
                            }

                            res.json({
                                ok: true,
                                categoria: categoriaDB
                            });        
         });

});

//======================================================================================================================
//Eliminar una categoria
//======================================================================================================================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
   
    //guardamos el id que recibimos por medio del url
        let id = req.params.id;

        //funcion que lo busca por el id y lo elimina
        Categoria.findByIdAndRemove(id, (err, categoriaDB) => {

              //si sucede un error
              if(err) {
                return res.status(500).json({
                        ok: false,
                        err: err
                    });
                }

        //manejamos el error si no encuentra el Id
                if(!categoriaDB) {
                    return res.status(400).json({
                            ok: false,
                            err: {
                                message: 'El id no existe'}
                        });
                    }

                    res.json({
                        ok: true,
                        message: 'categoria Borrada'
                    });        
        });
    
});

module.exports = app; 