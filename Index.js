var fs = require('fs')
var unzip = require("unzip")
var path = require('path');
var FileHound = require("fileHound")

var searchDirectory = 'D:/Projects/NodeTest/';
var outPutDirectory = 'D:/Projects/NodeTest/Output/';

var zips = getZips(searchDirectory);
extract(zips);
var files = FileHound.create().paths(outPutDirectory).ext('.dll').find()

files.then(getSameNamedDlls);

var duplicates = [];

function getSameNamedDlls(files) {
    var dlls = [];
   
    files.forEach(function (file) {
        var dll = { path: file, name: path.basename(file), properties: fs.statSync(file) }
        dlls.push(dll)
    })     

    var getDups = new Promise((resolve, reject) => {
    //dlls.forEach(d => d.version = getVersion(d))        
    dlls[0].version = getVersion(dlls[0]).then(function(){resolve(dlls)})   
    //resolve("test")            
    })
    
    getDups.then(function(input){  
        console.log(input) 
        console.log("test") 
        dlls.forEach(function (dll) {            
           for (var i = 0; i < dlls.length; i++){
               if (duplicates.find(x => x.path === dll.path) != null) {continue;} //Dll already in dups
               if (dll.name !== dlls[i].name){continue;} // skip if not named the same
               if (dll.path === dlls[i].path){continue;} //skip if same dll  
               //check version             
               duplicates.push(dll)              
           }               
    })
    });

}

function getVersion(dll){
    const shell = require('node-powershell'); 
    var ps = new shell({
    executionPolicy: 'Bypass',
    noProfile: true
    });  

    ps.addCommand('[System.Diagnostics.FileVersionInfo]::GetVersionInfo("'+ dll.path + '").ProductVersion')
    return ps.invoke()
        .then(version => {  
        dll.version = version;   
        ps.dispose()                   
        })
        .catch(err => {
        console.log(err);   
         ps.dispose()             
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






