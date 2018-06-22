var arango =  require('arangojs');
var config = require('./config.js')
Database = arango.Database;

db = new Database(`http://${config.host}:${config.port}`);

async function getUnknownSays(agent) {
    db.useDatabase(`${agent}-logs`);
    db.useBasicAuth(config.user,config.password);
    var ret = []
    const aql =   `FOR say in unknownSays
                    FILTER say.taged != true
                    SORT say.query_time DESC
                    LIMIT 10
                    UPDATE say WITH { taged: true }
                    IN unknownSays
                    return say.query`

    await db.query(aql)
    .then( cursor => cursor.all())
    .then( user_says => ret = user_says,
            err => console.error("error log", err))

    return ret
}

module.exports={
    getUnknownSays
}


