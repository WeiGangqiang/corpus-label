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
        ret.push({_key: intents[i]._key, name: intents[i].name, zhName:intents[i].zhName, modelPath: intents[i].modelPath})
    }
}

async function  getIntentsFor(agent){
    var ret = []
    const collectionName = getIntentCollectionName(agent);
    await db.query(`FOR d IN ${collectionName} return d `).then( cursor => cursor.all())
    .then (intents => format(intents, ret),
           err => console.log("error log", err))
    return ret
}


module.exports={
    getIntentsFor
}

