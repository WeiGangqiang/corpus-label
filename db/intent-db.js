var arongodb = require('./arongo.js')
var dbUtils = require('./dbUtils.js')
var db = arongodb.getDb()

//////////////////////////////////////////////////////////////////
function format(intents, ret) {
    for (i in intents) {
        ret.push({ intentId: intents[i]._key, name: intents[i].name, zhName: intents[i].zhName, modelPath: intents[i].modelPath })
    }
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

module.exports = { getIntentsFor}