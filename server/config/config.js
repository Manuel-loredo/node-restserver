//=============================
//Puerto
//==============================
process.env.PORT = process.env.PORT || 3000;

//=============================
//Entorno
//==============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//=============================
//Base de Datos
//==============================

let urlDB;
//if(process.env.NODE_ENV === 'dev'){
   // urlDB = 'mongodb://localhost:27017/cafe';
//}else {
    urlDB = 'mongodb+srv://manuel-loredo:eLPVAIpCfbA3mTcR@cluster0.nuhxh.mongodb.net/cafe';
//}

process.env.URLDB = urlDB;
//mongodb+srv://manuel-loredo:eLPVAIpCfbA3mTcR@cluster0.nuhxh.mongodb.net/cafe
//mongodb://localhost:27017/cafe