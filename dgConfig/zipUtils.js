var fs = require('fs');
var archiver = require('archiver');

//////////////////////////////////////////////////////////////////
function zipPath(zipPath, zipFilePath){
    return new Promise( (resolve,reject) => {
        var output = fs.createWriteStream(zipFilePath);
        var archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
          });

        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve("success")
        });

        output.on('end', function () {
            console.log('Data has been drained');
            resolve("success")
        });

        archive.on('error', function (err) {
            reject('archive error')
            throw err;
        });  
        
        archive.pipe(output);
        archive.directory(zipPath, "intent");
        archive.finalize();
    })
}

module.exports={
    zipPath
}

