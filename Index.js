var fs = require('fs')
var unzip = require("unzip")
var path = require('path');
var FileHound = require("fileHound")

var root = process.cwd() + '\\'

var searchDirectory = "C:\\temp\\Dep 3089\\"
var outPutDirectory = "C:\\temp\\Dep 3089\\"

var zips = getZips(searchDirectory);

var unzippedCount = 0;
extract(0);

function checkVers() {
    var files = FileHound.create().paths(outPutDirectory).ext('.dll').find()
    files.then(getSameNamedDlls);
}


var duplicates = [];

function getSameNamedDlls(files) {
    var dlls = [];

    files.forEach(function (file) {
        var dll = { path: file, name: path.basename(file), properties: fs.statSync(file) }
        dlls.push(dll)
    })

dlls.sort(function(a, b) {
    var textA = a.name
    var textB = b.name
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
});

    var actions = dlls.map(getVersion);
    var results = Promise.all(actions); // pass array of promises
    results.then(function (dlls) {

        dlls.forEach(function (dll) {
            for (var i = 0; i < dlls.length; i++) {
                if (duplicates.find(x => x.path === dll.path) != null) { continue; } //Dll already in dups
                if (dll.name !== dlls[i].name) { continue; } // skip if not named the same
                if (dll.path === dlls[i].path) { continue; } //skip if same dll  
                if (dll.version === dlls[i].version) { continue; } //skip if same dll  
                duplicates.push(dll)
            }
        })
        duplicates.forEach(d => console.log(d.path + ' | ' + d.version))
    });
}

function getVersion(dll) {
    const shell = require('node-powershell');
    var ps = new shell({
        executionPolicy: 'Bypass',
        noProfile: true,
        debugMsg: false
    });

    ps.addCommand('[System.Diagnostics.FileVersionInfo]::GetVersionInfo("' + dll.path + '").ProductVersion')
    return ps.invoke()
        .then(version => {
            dll.version = version;
            ps.dispose()
            return new Promise(resolve => resolve(dll))
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

function extract() {
    var zip = zips[unzippedCount]
    var combined = searchDirectory + zip;
    var fileNameNoExt = zip.replace('.zip', "");
    fs.createReadStream(combined).pipe(unzip.Extract({ path: outPutDirectory + fileNameNoExt })).on('close', function (e) {
        CheckNextUnzip();
    })
}

function CheckNextUnzip() {
    unzippedCount++;
    if (unzippedCount >= zips.length) {
        checkVers()
    } else {
        extract()
    }
}









