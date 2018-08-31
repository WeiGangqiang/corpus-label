var arango = require('arangojs');
var config = require('../config.js')
var db = null 

//////////////////////////////////////////////////////////////////
function getDb(){
    if(db == null){
        Database = arango.Database;
        db = new Database(`http://${config.host}:${config.port}`);
        db.useDatabase('xiaoda-corpus');
        db.useBasicAuth(config.user, config.password)
    }
    return db
}

module.exports={
    getDb
}
