'use strict'

//modulos
var fs = require('fs');
var path = require('path');
//modelos
var User = require('../models/User');
var Animal = require('../models/Animal');

function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando el controlador de animales y la accion pruebas',
        user:req.user
    });
}

function saveAnimal(req, res) {
    console.log('save animal');
    var animal = new Animal;
    var param = req.body;

    if(param.name){
        animal.name = param.name;
        animal.description = param.description;
        animal.year = param.year;
        animal.image = null;
        animal.user = req.user.sub;


        animal.save((err, animalStorage)=>{
            if(err){
                res.status(500).send({message:"Error en el servidor"});
            }else if(!animalStorage){
                res.status(404).send({message:"Error en la obtencion del animal"});
            }else{
                res.status(200).send({animal: animalStorage});
            }
        })
    }else{
        res.status(404).send({message:"Es obligatorio el nombre"});
    }

}

function getAnimals(req, res) {
    Animal.find({}).populate({path:'user'}).exec((err, animals)=>{
        if(err){
            res.status(500).send({message:"Error en la peticion"});
        }else if(!animals){
            res.status(404).send({message:"Error en la obtencion de los animales"});
        }else{
            res.status(200).send({animals: animals});
        }
    })
}

function getAnimal(req,res) {
    var animalId = req.params.id;
    Animal.findById(animalId).populate('user').exec((err, animal)=>{
        if(err){
            res.status(500).send({message:"Error en la peticion"});
        }else if(!animal){
            res.status(404).send({message:"Error en la obtencion de animal"});
        }else{
            res.status(200).send({animal: animal});
        }
    })
}

function updateAnimal(req, res) {
    var AnimalId = req.params.id;
    var update = req.body;
    Animal.findByIdAndUpdate(AnimalId, update, {new:true}, (err, animalUpdate)=>{
        if(err){
            res.status(500).send({message:"Error en la peticion"});
        }else if(!animalUpdate){
            res.status(404).send({message:"Error en la obtencion de animal"});
        }else{
            res.status(200).send({animalUpdate});
        }
    })
}


function uploadImage(req, res) {
    var AnimalId = req.params.id;
    var filename = 'No subido';
    if(req.files){
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var filename = file_split[2];
        var ext_split = filename.split('.');
        var file_ext = ext_split[1];
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

                Animal.findByIdAndUpdate(AnimalId, {image:filename}, {new:true}, (err, animalUpdate) =>{
                    if(err){
                        res.status(500).send({message:'Error al actualizar'});

                    }else if(!animalUpdate){
                        res.status(404).send({message:'No se ha podido actualizar el usuario'});
                    }else{
                        res.status(200).send({message:'actualizacion correcta', user: animalUpdate, image:filename});
                    }
                })

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
    var path_file = './uploads/animals/'+imageFile;

    fs.access(path_file, function(err){
        if(!err){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({message: 'imagen no existe'});
        }
    })
}

function deleteAnimal(req, res) {
    var AnimalId = req.params.id;
    Animal.findByIdAndRemove(AnimalId, (err, animalRemove)=>{
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        }else if(!animalRemove){
            res.status(404).send({message: 'No existe Animales con este identificador'});
        }else{
            res.status(200).send({animalRemove: animalRemove});
        }
    })
}

module.exports ={
    pruebas,
    saveAnimal,
    getAnimals,
    getAnimal,
    updateAnimal,
    uploadImage,
    getImageFile,
    deleteAnimal
};