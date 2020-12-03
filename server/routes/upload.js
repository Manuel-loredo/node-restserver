const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

// fileUpload() hace que todos los archivos que se cargen caigan dentro del req.files
//app.use(fileUpload());
app.use( fileUpload({ useTempFiles: true }) );

app.put('/upload/:tipo/:id', function(req, res) {
//recibimos el tipo ya sea productos o usuarios por el url 
  let tipo = req.params.tipo;
  let id = req.params.id;
     //si no hay archivo cargado menejamos el error
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se a seleccionado ningun archivo'
                }
        });
      }

      //Validar tipo
      let tiposValidos = ['productos', 'usuarios'];
         if(tiposValidos.indexOf(tipo) < 0) {
          
              return res.status(400).json({
                ok:false,
                err: {
                  message: 'Los tipos permitidas son ' + tiposValidos.join(', ')
                }  
            });

         }

         //guardamos todo el objeto en la variable archivo
      let archivo = req.files.archivo;
          //separamos el nombre y la extencion
      let nombreCortado = archivo.name.split('.');
      
      let extension = nombreCortado[nombreCortado.length -1 ];
      
     
      //extenciones permitidas 
      let extencionesValidas = ['jpg', 'png', 'gif', 'jpeg'];

      if(extencionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok:false,
            err: {
              message: 'Las extensiones permitidas son ' + extencionesValidas.join(', '),
              ext: extension
            }
            
        });
      }
      //cambiarle el nombre al archivo
      let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

      archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
          return res.status(500).json({
              ok: false,
              err
          });

    //Aqui la imagen se cargo
    if(tipo === 'usuarios') {
      imagenUsuario(id, res, nombreArchivo);
    }else {
      imagenProducto(id, res, nombreArchivo);
    }
        
      
      });
});



function imagenUsuario(id, res, nombreArchivo) {
      Usuario.findById(id, (err, usuarioDB) => {
        
        if(err){
          borraArchivo(nombreArchivo, 'usuarios'); 
          return res.status(500).json({
              ok: false,
              err
          });
        }

        if(!usuarioDB) {
          borraArchivo(nombreArchivo, 'usuarios'); 
          return res.status(400).json({
            ok: false,
            err: {
              message: 'Usuario no existe'
            }
          });
        }

        borraArchivo(usuarioDB.img, 'usuarios'); 
        usuarioDB.img =  nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
          
          res.json({
              ok:true,
              usuario: usuarioGuardado,
              img: nombreArchivo
            });
            
        });

      });
}



function imagenProducto(id, res, nombreArchivo) {
Producto.findById(id, (err, productoDB) => {

      if(err){
        borraArchivo(nombreArchivo, 'productos'); 
        return res.status(500).json({
            ok: false,
            err
        });
      }

      if(!productoDB) {
        borraArchivo(nombreArchivo, 'productos'); 
        return res.status(400).json({
          ok: false,
          err: {
            message: 'Producto no existe'
          }
        });
      }

      borraArchivo(productoDB.img, 'productos'); 

      productoDB.img = nombreArchivo;

      productoDB.save((err, productoGuardado) => {
        res.json({
            ok:true,
            producto: productoGuardado,
            img: nombreArchivo
          });
          
      });
});

}


function borraArchivo(nombreImagen, tipo) {
 
  let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    
      if(fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
      }
}
module.exports = app;