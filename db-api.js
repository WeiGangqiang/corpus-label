var arango =  require('arangojs');
Database = arango.Database;

db = new Database('http://47.100.18.115:8529');

db.useDatabase('xiaoda-corpus');
db.useBasicAuth('root','KingDom1234')

function getIntentCollectionName(agent){
    return agent +"_intent"
}

function getEntityCollectionName(agent){
    return agent + "_entity"
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


async function getParasFor(intent){
    var parameters = []
    const key = intent.intentId;
    const agent = intent.agent;
    const collectionName = getIntentCollectionName(agent);
    await db.query(`FOR doc in ${collectionName} FILTER doc._key== '${key}' RETURN doc.parameters`)
            .then( cursor => cursor.all())
            .then( paras => parameters = paras[0],
                   err => console.error("error log", err))

    for( i in parameters){
        var para = parameters[i]
        var entityNames = para.entity.split(".")
        var entityAgent = (entityNames.length > 1) ? entityNames[0]: agent
        var entityName = (entityNames.length > 1) ? entityNames[1]: entityNames[0]
        var entityInfo = await getEntityValuesFor(entityAgent, entityName)
        parameters[i].values = entityInfo.values
        parameters[i].kind = entityInfo.kind
    }

    
    return parameters
}

module.exports={
    getIntentsFor,
    getParasFor 
}

