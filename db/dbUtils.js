var arongodb = require('./arongo.js')
var restUtils = require('./restUtils.js')
var db = arongodb.getDb()

//////////////////////////////////////////////////////////////////
function getIntentCollectionName(agent) {
    return agent.replace("-", "_") + "_intent"
}

//////////////////////////////////////////////////////////////////
function getEntityCollectionName(agent) {
    return agent.replace("-", "_") + "_entity"
}

//////////////////////////////////////////////////////////////////
function getPhraseCollectionName(agent) {
    return agent.replace("-", "_") + "_phrase"
}

//////////////////////////////////////////////////////////////////
function findFailRsp(retText, error){
    console.log(retText, error)
    return {retCode : "fail", retText}
}

//////////////////////////////////////////////////////////////////
async function getArrayListFor(intent, fieldName) {
    var ret = []
    console.log(`get array for agent ${intent.agent} intent id ${intent.intentId}, fieldName ${fieldName}`)
    const key = intent.intentId;
    const agent = intent.agent;
    const collectionName = getIntentCollectionName(agent);
    console.log("db is", db)
    await db.query(`FOR doc in ${collectionName} FILTER doc._key== '${key}' RETURN doc.${fieldName}`)
        .then(cursor => cursor.all())
        .then(paras => ret = paras[0],
            err => console.error("get array list fail ", err))
    return ret
}

//////////////////////////////////////////////////////////////////
async function addToArrayTo(intent, fieldName, value) {
    const agent = intent.agent
    const intentId = intent.intentId
    const collectionName = getIntentCollectionName(agent);
    const aql = `LET doc = DOCUMENT( "${collectionName}/${intentId}")
                 UPDATE doc WITH {
                    ${fieldName}:APPEND(doc.${fieldName}, ${JSON.stringify(value)}, true)
                 }in ${collectionName}`

    console.info("add to array aql is :", aql)
    return await db.query(aql)
        .then(cursor => cursor.all())
        .then(ret => {
            console.info("add array success, result is ", ret);
            return restUtils.successRsp(null)
        },
            err => { return restUtils.failRsp(`add array ${fieldName} to ${collectionName} fail`, err) })
}

//////////////////////////////////////////////////////////////////
async function updateToArrayTo(intent, fieldName, values) {
    const agent = intent.agent
    const intentId = intent.intentId
    const collectionName = getIntentCollectionName(agent);
    const aql = `LET doc = DOCUMENT( "${collectionName}/${intentId}")
                 UPDATE doc WITH {
                    ${fieldName}: ${JSON.stringify(values)}
                 }in ${collectionName}`

    console.info("update to array aql is :", aql)
    return await db.query(aql)
        .then(cursor => cursor.all())
        .then(ret => { console.info("update array success, result is ", ret);
                       return restUtils.successRsp(null)},
        err =>  { return restUtils.failRsp(`update array ${fieldName} to ${collectionName} fail`, err)})
}

//////////////////////////////////////////////////////////////////
async function removeFromArray(intent, fieldName, index) {
    const agent = intent.agent
    const intentId = intent.intentId
    const collectionName = getIntentCollectionName(agent);
    const aql = `LET doc = DOCUMENT( "${collectionName}/${intentId}")
                 UPDATE doc WITH {
                    ${fieldName}:REMOVE_NTH(doc.${fieldName},${index})
                 }in ${collectionName}`

    console.info("remove from array aql is :", aql)
    return await db.query(aql)
        .then(cursor => cursor.all())
        .then(ret => {
            console.info("remove success, result is ", ret);
            return restUtils.successRsp(null)
        },
            err => { return restUtils.failRsp(`update array ${fieldName} to ${collectionName} fail`, err) })
}

//////////////////////////////////////////////////////////////////
async function dropArrayAllItems(intent, fieldName){
    const agent = intent.agent
    const intentId = intent.intentId
    const collectionName = getIntentCollectionName(agent);
    const aql = `LET doc = DOCUMENT( "${collectionName}/${intentId}")
                 UPDATE doc WITH {
                    ${fieldName}:[]
                 }in ${collectionName}`
    await db.query(aql)
        .then(cursor => cursor.all())
        .then(ret => console.info("drop arrays success, result is ", ret),
            err => console.error("drop arrays fail, log is ", err))

}

//////////////////////////////////////////////////////////////////
async function appendItemsToArray(intent, fieldName, values){
    const agent = intent.agent
    const intentId = intent.intentId
    const collectionName = getIntentCollectionName(agent);
    const aql = `LET doc = DOCUMENT( "${collectionName}/${intentId}")
                 UPDATE doc WITH {
                    ${fieldName}:APPEND(doc.${fieldName}, ${JSON.stringify(values)})
                 }in ${collectionName}`

    console.info("append items to array aql is :", aql)
    await db.query(aql)
        .then(cursor => cursor.all())
        .then(ret => console.info("append items success, result is ", ret),
            err => console.error("append items fail, log is ", err))
}

//////////////////////////////////////////////////////////////////
async function updateArrayItem(intent, fieldName, index, value) {
    const agent = intent.agent
    const intentId = intent.intentId
    const collectionName = getIntentCollectionName(agent);
    const aql = `LET doc = DOCUMENT( "${collectionName}/${intentId}")
                 UPDATE doc WITH {
                    ${fieldName}:UNION(SLICE(doc.${fieldName},0,${index}), [${JSON.stringify(value)}], SLICE(doc.${fieldName}, ${index + 1}))
                 }in ${collectionName}`

    console.info("update array item aql is :", aql)
    await db.query(aql)
        .then(cursor => cursor.all())
        .then(ret => console.info("update success, result is ", ret),
            err => console.error("update fail, log is ", err))
}


module.exports={
    getIntentCollectionName,
    getEntityCollectionName,
    getPhraseCollectionName,
    getArrayListFor,
    addToArrayTo,
    updateToArrayTo,
    removeFromArray,
    dropArrayAllItems,
    appendItemsToArray,
    updateArrayItem,
    findFailRsp
}