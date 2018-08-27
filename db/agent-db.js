var arongodb = require('./arongo.js')
var dbUtils = require('./dbUtils.js')
var db = arongodb.getDb();
const agentCollectionName = "agentTable"

async function getAgentsAll() {
    var collection = db.collection(agentCollectionName)
    var rets = []
    await collection.all().then(
        cursor => cursor.map(doc => { return formatAgent(doc)})
    ).then(
        agents => rets = agents,
        err => console.error('Failed to fetch all documents:', err)
    );
    return rets
}

function formatAgent(doc){
    var agent = {
        agentId: doc._key,
        name: doc.name,
        zhName: doc.zhName,
        createTime: doc.createTime,
        gateWay: doc.gateWay,
        unknownReplies: doc.unknownReplies,
        shareAgents: doc.shareAgents
    }
    return agent
}

async function getAgent(agentId) {
    var collection = db.collection(agentCollectionName)
    console.log('agentId', agentId)
    var ret = {}
    await collection.document(agentId).then(
        doc => ret = doc,
        err => console.error('Failed to fetch agent document:', err.message));
    return formatAgent(ret)
}

async function updateAgent(agent) {
    var collection = db.collection(agentCollectionName)
    await collection.update(agent.agentId, agent).then(
        meta => { console.log('entity updated:', meta._key); return meta._key },
        err => { console.error('faild update entity:', err); return "" }
    ); 
    
    return { retCode: "success" ,agentId: agent.agentId}
}

async function addAgent(agent) {
    var collection = db.collection(agentCollectionName)
    var agentId = await collection.save(agent).then(
        meta => { console.log('Document saved:', meta._key); return meta._key },
        err => { console.error('Failed to save document:', err); return "" }
    );
    return { retCode: "success", agentId }
}

async function deleteAgent(agentId) {
    var collection = db.collection(agentCollectionName)
    await collection.remove(agentId).then(
        () => console.log('entity doc removed'),
        err => console.error('Failed to remove entity document', err)
    );
    return { retCode: "success" }    
}


module.exports = {
    getAgentsAll,
    getAgent,
    updateAgent,
    addAgent,
    deleteAgent
}