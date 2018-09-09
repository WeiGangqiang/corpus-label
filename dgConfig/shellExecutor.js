var callfile = require('child_process'); 


function execute(shFile, params) {
    return new Promise(function(resolve, reject){
        console.log("shell execute begin ....")
        callfile.execFile(shFile, params, null, function(error, stdout, stderr){
            console.info(stdout)
            console.error(stderr)
            console.log("shell execute end")
            if(error){
                console.error(error)
                reject(error)
            }else{
                resolve(true)
            }
        })
    })
}

module.exports={
    execute
}

