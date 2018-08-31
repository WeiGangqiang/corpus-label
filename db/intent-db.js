var arongodb = require('./arongo.js')
var dbUtils = require('./dbUtils.js')
var db = arongodb.getDb()

//////////////////////////////////////////////////////////////////
function formatIntent(intent){
    return { intentId: intent._key, name: intent.name, zhName: intent.zhName, modelPath: intent.modelPath, parameters:intent.parameters }
}

//////////////////////////////////////////////////////////////////
async function getIntentsFor(agent) {
    var ret = []
    const collectionName = dbUtils.getIntentCollectionName(agent);
    await db.query(`FOR doc IN ${collectionName} return doc `).then(cursor => cursor.all())
        .then(intents => format(intents, ret),
            err => console.error("error log", err))
    return ret
}

//////////////////////////////////////////////////////////////////
async function getIntentsForServer(agent){
    const collectionName = dbUtils.getIntentCollectionName(agent);
    var ret = await db.query(`FOR doc IN ${collectionName} filter doc.mode=='server' return doc `).then(cursor => cursor.all())
        .then(intents => intents.map( intent => {return formatIntent(intent)}),
            err => { console.error("error log", err); return []})
    return ret
}



module.exports = { 
    getIntentsFor,
    getIntentsForServer
}