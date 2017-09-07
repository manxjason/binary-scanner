var fs = require('fs')
var unzip = require("unzip")
var path = require('path');
var FileHound = require("fileHound")


var searchDirectory = 'D:/Projects/NodeTest/';
var outPutDirectory = 'D:/Projects/NodeTest/Output/';

var zips = getZips(searchDirectory);

extract(zips);

var files = FileHound.create()
    .paths(outPutDirectory).ext('.dll').find()

files.then(checkVersions);
var e = 0;
function checkVersions(files) {
    var dlls = [];

    files.forEach(function (file) {
        var dll = { path: file, name: path.basename(file), properties: fs.statSync(file) }
        dlls.push(dll)
    })

    var duplicates = [];

    dlls.forEach(function (dll) {            
           for (var i = 0; i < dlls.length; i++){
               if (duplicates.find(x => x.path === dll.path) != null) {continue;} //Dll already in dups
               if (dll.name !== dlls[i].name){continue;} // skip if not named the same
               if (dll.path === dlls[i].path){continue;} //skip if same dll
               if (dll.properties.size === dlls[i].properties.size){continue;}
               
               duplicates.push(dll)              
           }
        
        // for (var i = 0; i < dlls.length; i++) {
        //     if (dlls[i].path !== dll.path) {
        //         if (dlls[i].name === dll.name && dlls[i].properties.size !== dll.properties.size) {                    
        //             if (dups.find(x => x.path === dll.path) == null) {                         
        //              dups.push(dlls[i])
        //             }
        //         }
        //     }
        // }
        // console.log(dups)
        // if (dups.length >= 0) { //will also find one in the array (itself)
          
        // }

        // var f = fileObjs.find(o => o.name === fileObj.name && o.size !== fileObj.properties.size)
        //console.log(f)
    })
    duplicates.forEach(d => console.log(d.path))
}

function getZips(directory) {
    var zips = [];
    var files = fs.readdirSync(directory);
    for (var i in files) {
        if (path.extname(files[i]) === ".zip") {
            zips.push(files[i])
        }
    }
    return zips;
}

function extract(zip) {
    zips.forEach(function (zip) {
        var combined = searchDirectory + zip;
        var fileNameNoExt = zip.replace('.zip', "");
        fs.createReadStream(combined).pipe(unzip.Extract({ path: outPutDirectory + fileNameNoExt }));
    }, this);
}






