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

function checkVersions(files) {
    var fileObjs = [];

    files.forEach(function (file) {
        var fileObj = { path: file, name: path.basename(file), properties: fs.statSync(file) }
        fileObjs.push(fileObj)
    })

    fileObjs.forEach(function (fileObj) {
        var dups = [];
        for (var i = 0; i < fileObjs.length; i++) {
            if (fileObjs[i].path != fileObj.path) {
                if (fileObjs[i].name == fileObj.name && fileObjs[i].properties.size != fileObj.properties.size) {

                    dups.push(fileObjs[i])

                    if (dups.find(x => x.path !== fileObj.path) != null) {
                        // dups.push(fileObj)                      

                    }
                }
            }
        }
        // console.log(dups)
        if (dups.length >= 2) { //will also find one in the array (itself)
            dups.forEach(x => console.log(x.path))
        }



        // var f = fileObjs.find(o => o.name === fileObj.name && o.size !== fileObj.properties.size)
        //console.log(f)
    })
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






