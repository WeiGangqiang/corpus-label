var arango =  require('arangojs');
var config = require('./config.js')
Database = arango.Database;

var db2 = new Database(`http://${config.host2}:${config.port}`);

async function getUnknownSays(agent) {
    db2.useDatabase(`${agent}-logs`);
    db2.useBasicAuth(config.user,config.password);
    var ret = []
    const aql =   `FOR say in unknownSays
                    FILTER say.taged != true
                    SORT say.query_time DESC
                    LIMIT 10
                    UPDATE say WITH { taged: true }
                    IN unknownSays
                    return say.query`

    await db2.query(aql)
    .then( cursor => cursor.all())
    .then( user_says => ret = user_says,
            err => console.error("error log", err))

    return ret
}

module.exports={
    getUnknownSays
}


