var arango =  require('arangojs');
var config = require('../config.js')

Database = arango.Database;

var db2 = new Database(`http://${config.host}:${config.port}`);

//////////////////////////////////////////////////////////////////
async function getUnknownSays(agent, userName) {
    let agentDbName = agent + "_" + userName
    db2.useBasicAuth(config.user, config.password);
    let databases = await db2.listUserDatabases()
    let logDbName = `${agentDbName}-logs`
    if (!databases.includes(logDbName)){
        return []
    }
    db2.useDatabase(`${agentDbName}-logs`);
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


