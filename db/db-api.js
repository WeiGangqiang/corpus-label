var pattern = require('../pattern-utils.js')
var arongodb = require('./arongo.js')
var dbUtils = require('./dbUtils.js')
var restUtils = require('./restUtils.js')
var db = arongodb.getDb()

//////////////////////////////////////////////////////////////////
async function getEntityValuesFor(agent, entityName) {
    var ret = []
    const collectionName = dbUtils.getEntityCollectionName(agent);
    await db.query(`FOR doc in ${collectionName} FILTER doc.name == '${entityName}' RETURN doc`)
        .then(cursor => cursor.all())
        .then(entitys => ret = entitys[0],
            err => console.error("error log", err))

    return ret
}

//////////////////////////////////////////////////////////////////
async function addSentence(msg) {
    const accept = msg.accept
    if (accept == true) {
        return await dbUtils.addToArrayTo(msg, "positive", msg.sentence)
    }
    return restUtils.successRsp(null)
}

//////////////////////////////////////////////////////////////////
async function getParasFor(intent) {
    var parameters = await dbUtils.getArrayListFor(intent, "parameters")
    for (i in parameters) {
        var para = parameters[i]
        var entityNames = para.entity.split(".")
        var entityAgent = (entityNames.length > 1) ? entityNames[0] : intent.agent
        var entityName = (entityNames.length > 1) ? entityNames[1] : entityNames[0]
        var entityInfo = await getEntityValuesFor(entityAgent, entityName)
        parameters[i].values = entityInfo.values
        parameters[i].choices = entityInfo.choices
        parameters[i].subEntities = entityInfo.subEntities
        parameters[i].kind = entityInfo.kind
    }
    return parameters
}

//////////////////////////////////////////////////////////////////
function getPatternField(type){
    return (type == "positive") ? "posPatterns" : "negPatterns"
}

//////////////////////////////////////////////////////////////////
async function getPatternFor(intent, type) {
    return dbUtils.getArrayListFor(intent, getPatternField(type))
}

//////////////////////////////////////////////////////////////////
async function addPatternFor(intent, value, type) {
    return await dbUtils.addToArrayTo(intent, getPatternField(type), value)
}

//////////////////////////////////////////////////////////////////
async function removePatternFor(intent, index, type) {
    return await dbUtils.removeFromArray(intent, getPatternField(type), index)
}

//////////////////////////////////////////////////////////////////
async function updatePatternFor(intent, index, value, type) {
    return await dbUtils.updateArrayItem(intent, getPatternField(type), index, value)
}

//////////////////////////////////////////////////////////////////
async function addPhraseFor(intent, similars) {
    var collectionName = dbUtils.getPhraseCollectionName(intent.agent)
    var collection = db.collection(collectionName)
    doc = {
        intentId: intent.intentId,
        similars: similars
    }
    var phraseId = await collection.save(doc).then(
        meta => { console.log('Document saved:', meta._key); return meta._key },
        err => { console.error('Failed to save document:', err); return "" }
    );

    return { retCode: "success", phraseId }
}

//////////////////////////////////////////////////////////////////
async function getPhraseFor(intent) {
    var collectionName = dbUtils.getPhraseCollectionName(intent.agent)
    var ret = []
    await db.query(`FOR doc in ${collectionName} FILTER doc.intentId== '${intent.intentId}' RETURN doc`)
        .then(cursor => cursor.all())
        .then(phrases => {
            ret = phrases.map((value) => {
                return { phraseId: value._key, intentId: value.intentId, similars: value.similars }
            })
        },
            err => console.error("get array list fail ", err))
    return ret
}

//////////////////////////////////////////////////////////////////
async function updatePhraseFor(intent, phraseId, similars) {
    var collectionName = dbUtils.getPhraseCollectionName(intent.agent)
    var collection = db.collection(collectionName)
    doc = {
        intentId: intent.intentId,
        similars: similars
    }
    await collection.update(phraseId, doc).then(
        meta => { console.log('Document saved:', meta._key); return meta._key },
        err => { console.error('Failed to save document:', err); return "" }
    );
    return { retCode: "success", phraseId }
}

//////////////////////////////////////////////////////////////////
async function deletePhraseFor(intent, phraseId) {
    var collectionName = dbUtils.getPhraseCollectionName(intent.agent)
    var collection = db.collection(collectionName)

    await collection.remove(phraseId).then(
        () => console.log('Document removed'),
        err => console.error('Failed to remove document', err)
    );

    return { retCode: "success" }
}

//////////////////////////////////////////////////////////////////
function searchPhrase(term, intentPhrase) {
    var ret = intentPhrase.find((phrase) => {
        return phrase.similars.includes(term)
    })
    return ret ? ret.phraseId : ""
}

//////////////////////////////////////////////////////////////////
function searchPara(term, intentParas) {
    var ret = intentParas.find((para) => {
        return para.values.map((value) => {
            return pattern.removeLablel(value).trim()
        }).includes(term)
    })
    return ret ? ret.name : ""
}

//////////////////////////////////////////////////////////////////
function searchLabel(subSentence, startPos, intentPhrase, intentParas) {
    for (var shift = subSentence.length; shift > 0; shift--) {
        var term = subSentence.slice(0, shift)
        var id = searchPhrase(term, intentPhrase)
        if (id != "") {
            return { type: "phrase", id, length: shift, startPos: startPos }
        }

        id = searchPara(term, intentParas)
        if(id != ""){
            return { type: "entity", id, length: shift, startPos: startPos }
        }
    }
    return null
}


//////////////////////////////////////////////////////////////////
async function labelPredict(intent, sentence) {
    var intentPhrase = await getPhraseFor(intent)
    var intentParas = await getParasFor(intent)
    console.log("intent phrase list", intentPhrase)
    console.log("intent entity list", intentParas)
    var searchLabels = []
    for (var startPos = 0; startPos < sentence.length - 1; startPos++) {
        var subSentence = sentence.slice(startPos)
        var label = searchLabel(subSentence, startPos, intentPhrase, intentParas)
        if (label != null) {
            searchLabels.push(label)
            startPos = startPos + label.length - 1
        }
    }
    return searchLabels
}

//////////////////////////////////////////////////////////////////
function getEntityBy(intentParas, label) {
    return intentParas.find(para => {
        return para.name == label.id
    })
}

//////////////////////////////////////////////////////////////////
function getPhraseBy(intentPhrase, label) {
    return intentPhrase.find(phrase => {
        return phrase.phraseId == label.id
    })
}

//////////////////////////////////////////////////////////////////
function generateForEntity(sentence, label, intentParas) {
    var entity = getEntityBy(intentParas, label)
    if (!entity) {
        return [sentence]
    }
    return entity.values.map(value => {
        return sentence.slice(0, label.startPos) + "[" + pattern.removeLablel(value).trim() + "]/" + entity.label + " "+ sentence.slice(label.startPos + label.length)
    })
}

//////////////////////////////////////////////////////////////////
function generateForPhrase(sentence, label, intentPhrase) {
    var phrase = getPhraseBy(intentPhrase, label)
    if (!phrase) {
        return [sentence]
    }
    return phrase.similars.map(value => {
        return sentence.slice(0, label.startPos) + value + sentence.slice(label.startPos + label.length)
    })
}


//////////////////////////////////////////////////////////////////
function generateSentences(sentence, labels, intentPhrase, intentParas) {
    if (labels.length == 0) {
        return [sentence]
    }
    var label = labels[labels.length - 1]
    var ret = []
    var genSentences = (label.type == "entity") ? generateForEntity(sentence, label, intentParas) : generateForPhrase(sentence, label, intentPhrase)
    genSentences.forEach(value => {
        var newRet = generateSentences(value, labels.slice(0, labels.length - 1), intentPhrase, intentParas)
        ret.push(...newRet)
    })
    return ret
}

//////////////////////////////////////////////////////////////////
async function generateSentencesFor(intent, pattern) {
    var intentPhrase = await getPhraseFor(intent)
    var intentParas = await getParasFor(intent)
    console.log("intent phrase list", intentPhrase)
    console.log("intent entity list", intentParas)
    return generateSentences(pattern.sentence, pattern.labels, intentPhrase, intentParas)
}

async function getIntentIdByModelPath(agent, modelPath) {
    const collectionName = dbUtils.getIntentCollectionName(agent);
    var ret = await db.query(`FOR doc IN ${collectionName} filter doc.modelPath=='${modelPath}' return doc `).then(cursor => cursor.all())
    .then(intents => { if(intents.length == 0) return null;
                       return intents[0]._key },
    err => { console.error("error log", err); return null})
    return ret
}

//////////////////////////////////////////////////////////////////
async function generateDone(agent, modelPath){
    var intent = {}
    intent.agent = agent
    intent.intentId = await getIntentIdByModelPath(agent, modelPath)
    if (intent.intentId == null){
        return { retCode: "failed" }
    }
    console.log('generate sentence is called', intent)
    var positive = await getPatternFor(intent, "positive")
    var negative = await getPatternFor(intent, "negative")
    var intentPhrase = await getPhraseFor(intent)
    var intentParas = await getParasFor(intent)
    
    await dbUtils.dropArrayAllItems(intent, "posGenSentence")
    await dbUtils.dropArrayAllItems(intent, "negGenSentence")
    
    positive.forEach(pattern =>{
        var sentences = generateSentences(pattern.sentence, pattern.labels, intentPhrase, intentParas)
        console.log("sentences is", sentences)
        dbUtils.appendItemsToArray(intent, "posGenSentence", sentences)
    })
    
    negative.forEach(pattern => {
        var sentences = generateSentences(pattern.sentence, pattern.labels, intentPhrase, intentParas)
        console.log("sentences is", sentences)
        dbUtils.appendItemsToArray(intent, "negGenSentence", sentences)
    })
    
    return { retCode: "success" }
}

//////////////////////////////////////////////////////////////////
function isMatchPhrase(sentence, label, phraseId, phrase){
    if(phrase == ''){
        return label.id == phraseId
    } else {
        return label.id == phraseId && (sentence.slice(label.startPos, label.startPos + label.length) == phrase)
    }
}

//////////////////////////////////////////////////////////////////
function doUpdatePatterns(patterns, phraseId, phrase){
    return patterns.map(pattern =>{
        var newlabels = pattern.labels.filter((label)=>{
            return !isMatchPhrase(pattern.sentence, label, phraseId, phrase)
        })
        pattern.labels = newlabels
        return pattern
    })    
}

//////////////////////////////////////////////////////////////////
async function updatePatterns(intent, pharseId, phrase){
    var positives = await getPatternFor(intent, "positive")
    var negatives = await getPatternFor(intent, "negative")
    positives = doUpdatePatterns(positives, pharseId, phrase)
    negatives = doUpdatePatterns(negatives, pharseId, phrase)
    await dbUtils.updateToArrayTo(intent, getPatternField("positive"), positives)
    await dbUtils.updateToArrayTo(intent, getPatternField("negative"), negatives)
    return { retCode: "success"}
}


module.exports = {
    getParasFor,
    addSentence,
    getPatternFor,
    addPatternFor,
    removePatternFor,
    updatePatternFor,
    addPhraseFor,
    getPhraseFor,
    updatePhraseFor,
    deletePhraseFor,
    labelPredict,
    generateSentencesFor,
    generateDone,
    updatePatterns
}

