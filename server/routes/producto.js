const express = require('express');
const Producto = require('../models/producto');
const {verificaToken} = require('../middlewares/autenticacion');
const app = express();




//======================================================================================================
//Obtener Productos
//======================================================================================================

app.get('/producto', verificaToken, (req, res) => {
    
    let desde = req.query.desde || 0;
    desde = Number(desde);

  

    Producto.find({disponible: true})
            .skip(desde)
            .limit(5)
            .populate('usuario', 'nombre email')
            .populate('categoria', 'descripcion')
            .exec((err, productoDB) => {
                
                if(err) {
                    return res.status(400).json({
                            ok: false,
                            err: err
                        });
                    }
                        Producto.count({disponible: true}, (err, conteo) => {
                        res.json({
                            ok: true,
                            producto: productoDB,
                            cuantos: conteo
                         });   
                    });
                
            });
});

//======================================================================================================
//Obtener un Productos por ID
//======================================================================================================

app.get('/producto/:id', verificaToken, (req, res) => {
   
    //guardamos el id que recibimos por medio del url
    let id = req.params.id;

  Producto.findById(id)
          .populate('usuario', 'nombre email')
          .populate('categoria', 'nombre')
          .exec((err, productoDB) => {

            if(err) {
                return res.status(500).json({
                        ok: false,
                        err: err
                    });
                }
        
            if(!productoDB) {
                return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'El Id no existe'
                        }
                        });
                    }
        
                    res.json({
                        ok: true,
                        producto: productoDB
                    }); 

          });
   
    });
//======================================================================================================
//Buscar Productos
//======================================================================================================

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i'); //creamos una exprecion regular en base al termino 

    Producto.find({nombre: regex})
        .populate('categoria', 'nombre')
        .exec((err, productos) =>{

            if(err) {
                return res.status(500).json({
                        ok: false,
                        err: err
                    });
                }
        
            if(!productos) {
                return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'El Id no existe'
                        }
                        });
                    }

                    res.json({
                        ok: true,
                        productos
                    }); 


        });
});

//======================================================================================================
//Crear un Nuevo Producto
//======================================================================================================

app.post('/producto', verificaToken, (req, res) => {

      //recibimos lo que nos envian desde el front end
        let body = req.body;
         //creamos el producto con la infomacion que mandaremos a la bd
        let producto = new Producto({
            nombre: body.nombre,
            precioUni: body.precioUni,
            descripcion: body.descripcion,
            disponible: body.disponible,
            categoria: body.categoria,
            usuario: req.usuario._id
        });

   producto.save((err, productoDB) => {
            //si sucede un error
            if(err) {
                return res.status(500).json({
                        ok: false,
                        err: err
                    });
                }

        //manejamos el error si no se crea la categoria
                if(!productoDB) {
                    return res.status(400).json({
                            ok: false,
                            err: err
                        });
                    }

            //mostrar la respuesta con la nueva categoria
                res.status(201).json({
                    ok: true,
                    producto: productoDB
                });
   });     
   
    });
//======================================================================================================
//Actualizar un Producto
//======================================================================================================

app.put('/producto/:id', verificaToken, (req, res) => {
     //guardamos el id que recibimos por medio del url
         let id = req.params.id;
     //recibimo toda la informacion desde el front end
         let body = req.body;

    //creamos el producto con la infomacion que mandaremos a la bd
            let producto = {
                nombre: body.nombre,
                precioUni: body.precioUni,
                descripcion: body.descripcion,
                disponible: body.disponible,
                categoria: body.categoria,
                usuario: req.usuario._id
            };

            Producto.findByIdAndUpdate(id, producto, {new: true, runValidators: true }, (err, productoDB) => {
                        //si sucede un error
                            if(err) {
                                return res.status(500).json({
                                        ok: false,
                                        err: err
                                    });
                                }

                //manejamos el error si no se actualiza el producto
                        if(!productoDB) {
                            return res.status(400).json({
                                    ok: false,
                                    err: err
                                });
                            }

                            res.json({
                                ok: true,
                                producto: productoDB
                            });        
            });

});

//======================================================================================================
//Borrar un Producto
//======================================================================================================

app.delete('/producto/:id', verificaToken, (req, res) => {
    
     //guardamos el id que recibimos por medio del url
        let id = req.params.id;

        Producto.findById(id, (err, productoDB) => {
               //si sucede un error
               if(err) {
                return res.status(500).json({
                        ok: false,
                        err: err
                    });
                }

            //manejamos el error si no se actualiza el producto
                    if(!productoDB) {
                        return res.status(400).json({
                                ok: false,
                                err: err
                            });
                        }

                productoDB.disponible = false;
                productoDB.save((err, productoBorrado) => {
                    
                    if(err) {
                        return res.status(500).json({
                                ok: false,
                                err: err
                            });
                        }

                        res.json({
                            ok: true,
                            producto: productoBorrado,
                            message: 'Producto Borrado'
                        });   
                });
        });


});



module.exports = app; 