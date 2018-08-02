var arango =  require('arangojs');
var config = require('./config.js')
Database = arango.Database;

db = new Database(`http://${config.host}:${config.port}`);

db.useDatabase('xiaoda-corpus');
db.useBasicAuth(config.user,config.password)

function getIntentCollectionName(agent){
    return agent.replace("-","_") +"_intent"
}

function getEntityCollectionName(agent){
    return agent.replace("-","_") + "_entity"
}

function format(intents, ret){
    for (i in intents) {
        ret.push({intentId: intents[i]._key, name: intents[i].name, zhName:intents[i].zhName, modelPath: intents[i].modelPath})
    }
}

async function  getIntentsFor(agent){
    var ret = []
    const collectionName = getIntentCollectionName(agent);
    await db.query(`FOR doc IN ${collectionName} return doc `).then( cursor => cursor.all())
    .then (intents => format(intents, ret),
           err => console.error("error log", err))
    return ret
}

async function getEntityValuesFor(agent, entityName){
    var ret = []
    const collectionName = getEntityCollectionName(agent);
    await db.query(`FOR doc in ${collectionName} FILTER doc.name == '${entityName}' RETURN doc`)
    .then( cursor => cursor.all())
    .then( entitys => ret = entitys[0],
           err => console.error("error log", err))

    return ret
}

async function addSentence(msg){
    const accept = msg.accept
    var retCode = "success"
    if(accept == true){
        await addToArrayTo(msg, "positive", msg.sentence)  
    }
    return {retcode: retCode}
}


async function getParasFor(intent){
    var parameters = await getArrayListFor(intent, "parameters")                   
    for( i in parameters){
        var para = parameters[i]
        var entityNames = para.entity.split(".")
        var entityAgent = (entityNames.length > 1) ? entityNames[0]: intent.agent
        var entityName = (entityNames.length > 1) ? entityNames[1]: entityNames[0]
        var entityInfo = await getEntityValuesFor(entityAgent, entityName)
        parameters[i].values = entityInfo.values
        parameters[i].choices = entityInfo.choices
        parameters[i].subEntities = entityInfo.subEntities
        parameters[i].kind = entityInfo.kind
    }

    return parameters
}

async function getArrayListFor(intent, fieldName){
    var ret = []
    console.log(`get array for agent ${intent.agent} intent id ${intent.intentId}, fieldName ${fieldName}`)
    const key = intent.intentId;
    const agent = intent.agent;
    const collectionName = getIntentCollectionName(agent);
    await db.query(`FOR doc in ${collectionName} FILTER doc._key== '${key}' RETURN doc.${fieldName}`)
            .then( cursor => cursor.all())
            .then( paras => ret = paras[0],
                   err => console.error("get array list fail ", err))
    return ret
}

async function addToArrayTo(intent, fieldName, value){
    const agent = intent.agent
    const intentId = intent.intentId
    const collectionName = getIntentCollectionName(agent);
    const aql = `LET doc = DOCUMENT( "${collectionName}/${intentId}")
                 UPDATE doc WITH {
                    ${fieldName}:APPEND(doc.${fieldName},'${value}', true)
                 }in ${collectionName}`

    console.info("add to array aql is :",aql)
    await db.query(aql)
            .then( cursor => cursor.all())
            .then( ret => console.info("add success, result is ", ret),
                err =>  {console.error("add fail, log is ", err); retCode = "add failed"})

}

async function removeFromArray(intent, fieldName, index){
    const agent = intent.agent
    const intentId = intent.intentId
    const collectionName = getIntentCollectionName(agent);
    const aql = `LET doc = DOCUMENT( "${collectionName}/${intentId}")
                 UPDATE doc WITH {
                    ${fieldName}:REMOVE_NTH(doc.${fieldName},${index})
                 }in ${collectionName}`

    console.info("remove from array aql is :",aql)
    await db.query(aql)
            .then( cursor => cursor.all())
            .then( ret => console.info("remove success, result is ", ret),
                err =>  {console.error("remove fail, log is ", err); retCode = "add failed"})
  
}

async function updateArrayItem(intent, fieldName, index, value){
    const agent = intent.agent
    const intentId = intent.intentId
    const collectionName = getIntentCollectionName(agent);
    const aql = `LET doc = DOCUMENT( "${collectionName}/${intentId}")
                 UPDATE doc WITH {
                    ${fieldName}:UNION(SLICE(doc.${fieldName},0,${index}), ['${value}'], SLICE(doc.${fieldName}, ${index+1}))
                 }in ${collectionName}`

    console.info("remove from array aql is :",aql)
    await db.query(aql)
            .then( cursor => cursor.all())
            .then( ret => console.info("update success, result is ", ret),
                err =>  {console.error("update fail, log is ", err); retCode = "add failed"})
}

async function getPatternFor(intent){
    return getArrayListFor(intent, "patterns")
}

async function addPatternFor(intent, value){
    addToArrayTo(intent, "patterns", value)
    return {retCode: "success"}
}

async function removePatternFor(intent, index){
    removeFromArray(intent, "patterns", index)
    return {retCode: "success"}
}

async function updatePatternFor(intent, index, value){
    updateArrayItem(intent, "patterns", index, value)
    return {retCode: "success"}
}

module.exports={
    getIntentsFor,
    getParasFor,
    getEntityValuesFor,
    addSentence,
    getPatternFor,
    addPatternFor,
    removePatternFor,
    updatePatternFor,
}

