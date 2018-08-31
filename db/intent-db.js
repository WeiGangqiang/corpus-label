var arongodb = require('./arongo.js')
var dbUtils = require('./dbUtils.js')
var db = arongodb.getDb()

//////////////////////////////////////////////////////////////////
function formatIntent(intent){
    return { intentId: intent._key, name: intent.name, zhName: intent.zhName, modelPath: intent.modelPath, parameters:intent.parameters }
}

//////////////////////////////////////////////////////////////////
async function getIntentsFor(agent) {
    const collectionName = dbUtils.getIntentCollectionName(agent);
    var ret = await db.query(`FOR doc IN ${collectionName} return doc `).then(cursor => cursor.all())
        .then(intents => intents.map( intent => {return formatIntent(intent)}),
              err => { console.error("error log", err); return []})
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

//////////////////////////////////////////////////////////////////
async function getIntent(agent, intentId) {
    const collectionName = dbUtils.getIntentCollectionName(agent);
    var collection = db.collection(collectionName)
    console.log('find intent by id', intentId)
    return await collection.document(intentId).then(
        doc => { return formatIntent(doc) },
        err => { return dbUtils.findFailRsp('Failed to fetch agent document:', err)});
}


module.exports = { 
    getIntentsFor,
    getIntentsForServer,
    getIntent
}