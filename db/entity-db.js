var arongodb = require('./arongo.js')
var dbUtils = require('./dbUtils.js')
var db = arongodb.getDb()

//////////////////////////////////////////////////////////////////
async function getEntityNames(agent){
    var ret = []
    const collectionName = dbUtils.getEntityCollectionName(agent);
    await db.query(`FOR doc in ${collectionName} RETURN doc.name`)
    .then(cursor => cursor.all())
    .then(names => ret = names,
        err => console.error("error log", err))

    return ret
}

//////////////////////////////////////////////////////////////////
async function getEntitiesAll(agent) {
    var ret = []
    const collectionName = dbUtils.getEntityCollectionName(agent);
    await db.query(`FOR doc in ${collectionName} FILTER doc.items != NULL  RETURN doc`)
        .then(cursor => cursor.all())
        .then(entities => ret = entities,
            err => console.error("error log", err))
   
    return ret;
}

//////////////////////////////////////////////////////////////////
async function getEntity(agent, entityName) {
    var ret = {}
    const collectionName = dbUtils.getEntityCollectionName(agent);
    await db.query(`FOR doc in ${collectionName} FILTER doc.name == '${entityName}' RETURN doc`)
        .then(cursor => cursor.all())
        .then(entities => ret = entities[0],
            err => console.error("error log", err))

    var entity = {
        name : ret.name,
        items: ret.items,
        entityId   : ret._key,
        zhName     : ret.zhName,
        createTime : ret.createTime,
    }             
    return entity
}

//////////////////////////////////////////////////////////////////
function buildDocBy(entity){
    var doc = {
        name: entity.name,
        zhName: entity.zhName,
        createTime: entity.createTime,
        items: entity.items,
        kind: 'enums',
        subEntities: [entity.name+ ":L0"]
    }
    var values = []
    
    entity.items.forEach((item)=>{
        values.push(...item.split(','))
    })
    var labelValues = values.map(value => { return "["+value+"]/L0"} )
    doc.values = labelValues
    return doc  
}

//////////////////////////////////////////////////////////////////
async function addEntity(agent, entity) {
    const collectionName = dbUtils.getEntityCollectionName(agent);
    var collection = db.collection(collectionName)
    var doc = buildDocBy(entity)
    var entityId = await collection.save(doc).then(
        meta => { console.log('Document saved:', meta._key); return meta._key },
        err => { console.error('Failed to save document:', err); return "" }
    );
    return { retCode: "success", entityId }
}

//////////////////////////////////////////////////////////////////
async function deleteEntity(agent, entityId) {
    const collectionName = dbUtils.getEntityCollectionName(agent);
    var collection = db.collection(collectionName)
    await collection.remove(entityId).then(
        () => console.log('entity doc removed'),
        err => console.error('Failed to remove entity document', err)
    );
    return { retCode: "success" }
}

//////////////////////////////////////////////////////////////////
async function getEntityId(collectionName, entityName){
    var ret = ''
    await db.query(`FOR doc in ${collectionName} FILTER doc.name == '${entityName}' RETURN doc._key`)
    .then(cursor => cursor.all())
    .then(key => ret = key[0],
        err => console.error("error log", err))
    return ret
}

//////////////////////////////////////////////////////////////////
async function updateEntity(agent, entity){
    const collectionName = dbUtils.getEntityCollectionName(agent);
    var collection = db.collection(collectionName)
    var doc = buildDocBy(entity)
    await collection.update(entity.entityId, doc).then(
        meta => { console.log('entity updated:', meta._key); return meta._key },
        err => { console.error('faild update entity:', err); return "" }
    );
    return { retCode: "success" }
}


module.exports = {
    getEntityNames,
    getEntity,
    addEntity,
    deleteEntity,
    updateEntity,
    getEntitiesAll
}