var arongodb = require('./arongo.js')
var dbUtils = require('./dbUtils.js')
var restUtils = require('./restUtils.js')
var db = arongodb.getDb();
const agentCollectionName = "agentTable"

//////////////////////////////////////////////////////////////////
async function getAgentsAll(user) {
    return await db.query(`FOR doc IN ${agentCollectionName} filter doc.user=='${user}' return doc `).then(cursor => cursor.all())
    .then(agents => agents.map(doc => { return formatAgent(doc)}),
        err => restUtils.failRsp('Failed to fetch agent document:', err))
}

//////////////////////////////////////////////////////////////////
function addOptionField(agent, doc, fieldName){
    if(fieldName in doc ){
        agent[fieldName] = doc[fieldName]
    }
}

//////////////////////////////////////////////////////////////////
function formatAgent(doc){
    var agent = {
        agentId: doc._key,
        name: doc.name,
        gateWay: doc.gateWay,
        user: doc.user,
        introduced: doc.introduced
    }

    addOptionField(agent, doc, "zhName")
    addOptionField(agent, doc, "createTime")
    addOptionField(agent, doc, "unknownReplies")
    addOptionField(agent, doc, "shareAgents")
    return agent
}

//////////////////////////////////////////////////////////////////
async function getAgent(agentId) {
    var collection = db.collection(agentCollectionName)
    console.log('agentId', agentId)
    return await collection.document(agentId).then(
        doc => { return formatAgent(doc) },
        err => { return restUtils.failRsp('Failed to fetch agent document:', err)});
}

//////////////////////////////////////////////////////////////////
async function getAgentByName(agentName) {
    var ret= {}
    await db.query(`FOR doc IN ${agentCollectionName} filter doc.name=='${agentName}' return doc `).then(cursor => cursor.all())
    .then(agents => {
        if(agents){
            ret = formatAgent(agents[0])
        }},
        err => console.error("error log", err))
    return ret
}

//////////////////////////////////////////////////////////////////
async function updateAgent(agent) {
    var collection = db.collection(agentCollectionName)
    if("agentId" in agent && "name" in agent && "gateWay" in agent && "user" in agent && "introduced" in agent){
        await collection.update(agent.agentId, agent).then(
            meta => { console.log('entity updated:', meta._key); return meta._key },
            err => { console.error('faild update entity:', err); return "" }
        );   
        return { retCode: "success" ,agentId: agent.agentId}
    }else{
        return restUtils.failRsp("para check fail")
    }
}


//////////////////////////////////////////////////////////////////
async function createCollection(collectionName) {
    var collection = db.collection(collectionName)
    await collection.create().then(
        () => console.log(`Collection ${collectionName} created`),
        err => console.error('Failed to create collection:', err)
    );
}

//////////////////////////////////////////////////////////////////
async function createCollectionForAgent(agentName, user){
    await createCollection(dbUtils.getIntentCollectionName(agentName, user))
    await createCollection(dbUtils.getEntityCollectionName(agentName, user))
    await createCollection(dbUtils.getPhraseCollectionName(agentName, user))
}

//////////////////////////////////////////////////////////////////
async function addAgent(agent) {
    var collection = db.collection(agentCollectionName)
    if("name" in agent && "gateWay" in agent && "user" in agent && "introduced" in agent){
        var agentId = await collection.save(agent).then(
            meta => { console.log('Document saved:', meta._key); return meta._key },
            err => { console.error('Failed to save document:', err); return "" }
        );
        await createCollectionForAgent(agent.name, agent.user)
        return { retCode: "success", agentId }
    }else{
        return restUtils.failRsp("para check fail")
    }
}

//////////////////////////////////////////////////////////////////
async function deleteAgent(agentId) {
    var collection = db.collection(agentCollectionName)
    await collection.remove(agentId).then(
        () => console.log('entity doc removed'),
        err => console.error('Failed to remove entity document', err)
    );
    return { retCode: "success" }    
}


//////////////////////////////////////////////////////////////////
module.exports = {
    getAgentsAll,
    getAgent,
    updateAgent,
    addAgent,
    deleteAgent,
    getAgentByName
}