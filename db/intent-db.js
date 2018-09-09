var arongodb = require('./arongo.js')
var dbUtils = require('./dbUtils.js')
var restUtils = require('./restUtils.js')
var db = arongodb.getDb()

//////////////////////////////////////////////////////////////////
function formatIntent(intent){
    return { intentId: intent._key, name: intent.name, mode:intent.mode, zhName: intent.zhName, modelPath: intent.modelPath, parameters:intent.parameters }
}

//////////////////////////////////////////////////////////////////
async function getIntentsFor(agent, user) {
    const collectionName = dbUtils.getIntentCollectionName(agent, user);
    var ret = await db.query(`FOR doc IN ${collectionName} return doc `).then(cursor => cursor.all())
        .then(intents => intents.map( intent => {return formatIntent(intent)}),
              err => { console.error("error log", err); return []})
    return ret
}

//////////////////////////////////////////////////////////////////
async function getIntentsForServer(agent, user){
    const collectionName = dbUtils.getIntentCollectionName(agent, user);
    var ret = await db.query(`FOR doc IN ${collectionName} filter doc.mode=='server' return doc `).then(cursor => cursor.all())
    .then(intents => intents.map( intent => {return formatIntent(intent)}),
    err => { console.error("error log", err); return []})
    return ret
}

//////////////////////////////////////////////////////////////////
async function getIntent(agent, user, intentId) {
    const collectionName = dbUtils.getIntentCollectionName(agent, user);
    var collection = db.collection(collectionName)
    console.log('find intent by id', intentId)
    return await collection.document(intentId).then(
        doc => { return formatIntent(doc) },
        err => { return restUtils.failRsp('Failed to fetch agent document:', err)});
}

//////////////////////////////////////////////////////////////////
async function getIntentActions(agent, user,intentId){
    const collectionName = dbUtils.getIntentCollectionName(agent, user);
    var collection = db.collection(collectionName)
    console.log('find intent by id', intentId)
    return await collection.document(intentId).then(
        doc => { if("actions" in doc) return restUtils.successRsp(doc.actions);
                 return restUtils.successRsp([])},
        err => { return restUtils.failRsp('Failed to fetch intent document:', err)});
}

//////////////////////////////////////////////////////////////////
async function updateIntentActions(agent, user, intentId, actions){
    return await dbUtils.updateToArrayTo({agent, user,intentId}, "actions", actions)
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
        negPatterns: [],
        posGenSentence: [],
        posGenSentence: [],
        parameters: [],
    }
    return doc
}

//////////////////////////////////////////////////////////////////
async function addIntent(agent, user, intent) {
    const collectionName = dbUtils.getIntentCollectionName(agent, user);
    var collection = db.collection(collectionName)
    var doc = buildIntentDocBy(agent, intent)
    var intentId = await collection.save(doc).then(
        meta => { console.log('Document saved:', meta._key); return meta._key },
        err => { console.error('Failed to save document:', err); return "" }
    );
    return { retCode: "success", intentId }
}

//////////////////////////////////////////////////////////////////
async function deleteIntent(agent, user, intentId) {
    const collectionName = dbUtils.getIntentCollectionName(agent, user);
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
        // parameters: intent.parameters,
    }
    return doc
}

//////////////////////////////////////////////////////////////////
async function updateIntent(agent, user, intent) {
    const collectionName = dbUtils.getIntentCollectionName(agent, user);
    var collection = db.collection(collectionName)
    var doc = buildIntentBaseDocBy(intent)
    await collection.update(intent.intentId, doc).then(
        meta => { console.log('entity updated:', meta._key); return meta._key },
        err => { console.error('faild update entity:', err); return "" }
    );
    return { retCode: "success" }
}

//////////////////////////////////////////////////////////////////
function labelToIndex(label){
    return parseInt(label.replace("L", 0))
}

//////////////////////////////////////////////////////////////////
function indexToLabel(index){
    return "L" + index
}

//////////////////////////////////////////////////////////////////
async function addParameter(intent, parameter){
    var intentInfo = await getIntent(intent.agent, intent.user, intent.intentId)
    if( "name" in parameter && "entity" in parameter){
        let length = intentInfo.parameters.length
        let para = {
            name: parameter.name,
            label: indexToLabel(length),
            entity: parameter.entity,
            isList: false
        }
        await dbUtils.appendItemsToArray(intent, "parameters", para)
        return { retCode: "success"}
    }else{
        return { reCode:  "fail"}
    }
}

//////////////////////////////////////////////////////////////////
function doDeleteLabelForPatterns(patterns, labelId){
    return patterns.map(pattern =>{
        var newlabels = pattern.labels.filter((label)=>{
            return label.type != "entity" || label.id != labelId
        })
        pattern.labels = newlabels
        return pattern
    })    
}

//////////////////////////////////////////////////////////////////
function doRenameLabelForPatterns(patterns, old_labelId, new_labelId){
    return patterns.map(pattern =>{
        var newlabels = pattern.labels.map((label)=>{
            if(label.type == "entity" && label.id == old_labelId){
                label.id = new_labelId
            }
            return label       
        })
        pattern.labels = newlabels
        return pattern
    })    
}

//////////////////////////////////////////////////////////////////
async function deletePatternLabel(intent, labelId){
    await dbUtils.reUpdateArrayValues(intent, dbUtils.getPatternField("positive"), (arrays) => {
        return doDeleteLabelForPatterns(arrays, labelId)
    })
    await dbUtils.reUpdateArrayValues(intent, dbUtils.getPatternField("negative"), (arrays) => {
        return doDeleteLabelForPatterns(arrays, labelId)
    })  
}

//////////////////////////////////////////////////////////////////
async function renamePatternLabel(intent, old_labelId, new_labelId){
    await dbUtils.reUpdateArrayValues(intent, dbUtils.getPatternField("positive"), (arrays) => {
        return doRenameLabelForPatterns(arrays, old_labelId, new_labelId)
    })
    await dbUtils.reUpdateArrayValues(intent, dbUtils.getPatternField("negative"), (arrays) => {
        return doRenameLabelForPatterns(arrays, old_labelId, new_labelId)
    })
}

//////////////////////////////////////////////////////////////////
async function getParameterAll(intent){
    var intentInfo = await getIntent(intent.agent, intent.user, intent.intentId)
    return intentInfo.parameters
}

//////////////////////////////////////////////////////////////////
async function deleteParameter(intent, parameter){
    var parameters = await getParameterAll(intent)
    var paraIndex  = labelToIndex(parameter.label)
    var paras_lhs =  parameters.slice(0, paraIndex)
    var paras_rhs =  parameters.slice(paraIndex + 1, parameters.length)
    var paras_rhs_new = paras_rhs.map( para => {
        let index = labelToIndex(para.label)
        para.label = indexToLabel(index - 1)
        return para
    })
    await deletePatternLabel(intent, parameter.name)
    let newParameters = [...paras_lhs, ...paras_rhs_new]
    await dbUtils.updateToArrayTo(intent, "parameters", newParameters)
    return { retCode: "success"}
}

//////////////////////////////////////////////////////////////////
async function updateParameter(intent, parameter){
    var parameters = await getParameterAll(intent)
    var paraIndex  = labelToIndex(parameter.label)
    if(parameters[paraIndex].entity == parameter.entity){
        if(parameters[paraIndex].name != parameter.name){
            await renamePatternLabel(intent, parameters[paraIndex].name, parameter.name)
            parameters[paraIndex].name = parameter.name
        }
    }else{
       await deletePatternLabel(intent, parameters[paraIndex].name)
       parameters[paraIndex].name = parameter.name
       parameters[paraIndex].entity = parameter.entity
    }
    await dbUtils.updateToArrayTo(intent, "parameters", parameters)
    return { retCode: "success"}
}


module.exports = { 
    getIntentsFor,
    getIntentsForServer,
    getIntent,
    addIntent,
    deleteIntent,
    updateIntent,
    getIntentActions,
    updateIntentActions,
    addParameter,
    getParameterAll,
    deleteParameter,
    updateParameter
}