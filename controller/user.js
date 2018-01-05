'user strict'

//modulos
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');
//modelos
var User = require('../models/User');


//servicios

var jwt =require('../services/jwt');

function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando el controlador de usuario y la accion pruebas',
        user:req.user
    });
}

function saveUser(req,res) {
   //Crear el objeto del usuario
    var user = new User();

    //recojer parametros peticion
    var params = req.body;

    //asignar valores al usuario

    if(params.password && params.name && params.surname && params.email){
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user. role = 'ROLE_USER';
        user.image = null;
        User.findOne({email: user.email.toLowerCase()},(err, issetuser)=>{
            if(err){
                res.status(500).send({
                    message: 'Error al comprobar el usuario'
                })
            }else{
                if(!issetuser){
                    bcrypt.hash(params.password, null, null, function (err, hash) {
                        user.password = hash;
                        user.save((err, userStored)=>{
                            //guardo usuario en base de datos
                            if(err){
                                res.status(500).send({
                                    message: 'Error al guardar usuario'
                                })
                            }else{
                                if(!userStored){
                                    res.status(404).send({
                                        message: 'No se ha registrado el usuario'
                                    });
                                }else{
                                    res.status(200).send({
                                        user: userStored
                                    });
                                }
                            }
                        });
                    })
                }else{
                    res.status(404).send({
                        message: 'No se ha registrado el usuario debido ha que ya existe'
                    });
                }
            }
        })


    }else {
        res.status(200).send({
            message: 'Introduce los datos correctamente '
        })
    }

}

function login(req, res) {
    var params = req.body;
    var email = params.email;
    var password = params.password
    User.findOne({email: email.toLowerCase()},(err, issetuser)=>{
        if(err){
            res.status(500).send({
                message: 'Error al guardar usuario'
            });

        }else if(issetuser){
            bcrypt.compare(password, issetuser.password, function (err, check) {
                if(check){
                    if(params.gettoken){//comprobar y generar token
                       //devolver token
                        res.status(200).send({
                            token:jwt.createToken(issetuser)
                        })
                    }else{
                        res.status(200).send({issetuser})
                    }

                }else{
                    res.status(404).send({
                        message: 'No existe usuario con estas credenciales'
                    })
                }
            });

        }else{
            res.status(404).send({
                message: 'No existe usuario'
            })
        }
    });

}

function updateUser(req, res) {

    var userid = req.params.id;
    var update = req.body;
    delete update.password;
    if(userid != req.user.sub){
        return res.status(500).send({message:'No tienes permiso para actualizar un usuario'});
    }else{
        User.findByIdAndUpdate(userid, update, {new:true}, (err, userUpdate) =>{
            if(err){
                res.status(500).send({message:'Error al actualizar'});

            }else if(!userUpdate){
                res.status(404).send({message:'No se ha podido actualizar el usuario'});
            }else{
                res.status(200).send({message:'actualizacion correcta', user: userUpdate});
            }
        })
    }


}

function uploadImage(req, res) {
    var userId = req.params.id;
    var filename = 'No subido';
    if(req.files){
      var file_path = req.files.image.path;
      console.log(file_path);
      var file_split = file_path.split('/');
      var filename = file_split[3];      
      var ext_split = filename.split('/.');
      var file_ext = ext_split[1];
      if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
          if(userId != req.user.sub){
              return res.status(500).send({message:'No tienes permiso para actualizar un usuario'});
          }else{
              User.findByIdAndUpdate(userId, {image:filename}, {new:true}, (err, userUpdate) =>{
                  if(err){
                      res.status(500).send({message:'Error al actualizar'});

                  }else if(!userUpdate){
                      res.status(404).send({message:'No se ha podido actualizar el usuario'});
                  }else{
                      res.status(200).send({message:'actualizacion correcta', user: userUpdate, image:filename});
                  }
              })
          }
      }else{
          fs.unlink(file_path,(err)=>{
              if(err){
                  console.log("error");
              }else{
                  console.log("borrado");
              }
          });
          res.status(200).send({message: 'Extension no valida'});
      }

    }else{
        res.status(200).send({message: 'No hay ficheros'});
    }
}

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var path_file = './uploads/users/'+imageFile;

    fs.access(path_file, function(err){
        if(!err){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({message: 'imagen no existe'});
        }
    })
}

function getKeepers(req, res) {
    User.find({role:'ROLE_ADMIN'}).exec((err, users)=>{
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        }else if(!users){
            res.status(404).send({message: 'No hay cuidadores'});
        }else{
            res.status(200).send({users: users});
        }
    })


}



module.exports = {
    pruebas,
    saveUser,
    login,
    updateUser,
    uploadImage,
    getImageFile,
    getKeepers
};