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
    const agent = msg.agent
    const intentId = msg.intentId
    const sentence = msg.sentence
    const accept = msg.accept
    var retCode = "success"
    if(accept == true){
        const collectionName = getIntentCollectionName(agent);
        const aql = `LET doc = DOCUMENT( "${collectionName}/${intentId}")
                     UPDATE doc WITH {
                        positive:APPEND(doc.positive,'${sentence}', true)
                     }in ${collectionName}`

        console.info("aql is :",aql)
        await db.query(aql)
                .then( cursor => cursor.all())
                .then( ret => console.info("result is ", ret),
                    err =>  {console.error("error log", err); retCode = "add failed"})
    }
    return {retcode: retCode}
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
        parameters[i].choices = entityInfo.choices
        parameters[i].subEntities = entityInfo.subEntities
        parameters[i].kind = entityInfo.kind
    }

    return parameters
}

module.exports={
    getIntentsFor,
    getParasFor,
    getEntityValuesFor,
    addSentence 
}

