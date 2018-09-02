var fs = require('fs');
const yaml = require('js-yaml');

//////////////////////////////////////////////////////////////////
function writeYaml(filePath, content){
    return new Promise((resolve,reject) => {
        let obj = yaml.safeDump(content)
        fs.writeFile(filePath, obj, function(err){
            if(err){
                reject("write file " + filePath + " fail")
            }
            else {
                console.log('write file path:'+ filePath + " success ")
                resolve("success")
            }
        })
    })
}

//////////////////////////////////////////////////////////////////
function mkdirP(filePath) {
    return new Promise((resolve, reject)=> {
        fs.exists(filePath, function(exists){
            if(exists){
                console.log('file path:'+ filePath + " is aready created")
                resolve("success")
            }
            else{
                fs.mkdir(filePath, function(err){
                    if(err){
                        reject("make dir " + filePath + " fail")
                    }else {
                        console.log('create file path:'+ filePath + " success ")
                        resolve("success")
                    }
                })
            }
        })
    })
}


function deleteDir(path) {
	var files = [];
	if(fs.existsSync(path)) {
		files = fs.readdirSync(path);
		files.forEach(function(file, index) {
			var curPath = path + "/" + file;
			if(fs.statSync(curPath).isDirectory()) { // recurse
				deleteDir(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
    }
}


module.exports={
    writeYaml,
    mkdirP,
    deleteDir
}

