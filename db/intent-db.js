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

//////////////////////////////////////////////////////////////////
function buildIntentDocBy(agentName, intent){
    var doc = {
        ns: agentName,
        name: intent.name,
        zhName: intent.zhName,
        mode: "server",
        modelPath: intent.modelPath,
        positive: [],
        negative: [],
        posPatterns: [],
        posPatterns: [],
        posGenSentence: [],
        posGenSentence: [],
        parameters: [],
    }
    return doc
}

//////////////////////////////////////////////////////////////////
async function addIntent(agent, intent) {
    const collectionName = dbUtils.getIntentCollectionName(agent);
    var collection = db.collection(collectionName)
    var doc = buildIntentDocBy(agent, intent)
    var intentId = await collection.save(doc).then(
        meta => { console.log('Document saved:', meta._key); return meta._key },
        err => { console.error('Failed to save document:', err); return "" }
    );
    return { retCode: "success", intentId }
}

//////////////////////////////////////////////////////////////////
async function deleteIntent(agent, intentId) {
    const collectionName = dbUtils.getIntentCollectionName(agent);
    var collection = db.collection(collectionName)
    await collection.remove(intentId).then(
        () => console.log('entity doc removed'),
        err => console.error('Failed to remove entity document', err)
    );
    return { retCode: "success" }
}

//////////////////////////////////////////////////////////////////
function buildIntentBaseDocBy(intent){
    var doc = {
        name: intent.name,
        zhName: intent.zhName,
        modelPath: intent.modelPath,
        parameters: intent.parameters,
    }
    return doc
}

//////////////////////////////////////////////////////////////////
async function updateIntent(agent, intent) {
    const collectionName = dbUtils.getIntentCollectionName(agent);
    var collection = db.collection(collectionName)
    var doc = buildIntentBaseDocBy(intent)
    await collection.update(intent.intentId, doc).then(
        meta => { console.log('entity updated:', meta._key); return meta._key },
        err => { console.error('faild update entity:', err); return "" }
    );
    return { retCode: "success" }
}


module.exports = { 
    getIntentsFor,
    getIntentsForServer,
    getIntent,
    addIntent,
    deleteIntent,
    updateIntent
}