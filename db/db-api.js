var pattern = require('../pattern-utils.js')
var arongodb = require('./arongo.js')
var dbUtils = require('./dbUtils.js')
var restUtils = require('./restUtils.js')
var db = arongodb.getDb()


//////////////////////////////////////////////////////////////////
async function getEntityValuesFor(agent, user, entityName) {
    var ret = []
    const collectionName = dbUtils.getEntityCollectionName(agent, user);
    console.log('get collection name', collectionName, entityName)
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
    console.log('parameters', parameters)
    for (i in parameters) {
        var para = parameters[i]
        var entityNames = para.entity.split(".")
        var entityAgent = (entityNames.length > 1) ? entityNames[0] : intent.agent
        var entityName = (entityNames.length > 1) ? entityNames[1] : entityNames[0]
        var entityInfo = await getEntityValuesFor(entityAgent, intent.user, entityName)
        console.log('entityInfo',entityInfo)
        parameters[i].values = entityInfo.values
        parameters[i].choices = entityInfo.choices
        parameters[i].subEntities = entityInfo.subEntities
        parameters[i].kind = entityInfo.kind
    }
    return parameters
}

//////////////////////////////////////////////////////////////////
function getPatternField(type){
    return dbUtils.getPatternField(type)
}

//////////////////////////////////////////////////////////////////
async function getPatternFor(intent, type) {
    return dbUtils.getArrayListFor(intent, getPatternField(type))
}

//////////////////////////////////////////////////////////////////
async function getSlotPatternFor(intent, slotName, type){
    var fieldName = getPatternField(type)
    var parameters = await dbUtils.getArrayListFor(intent, "parameters")
    var findPara = parameters.filter( para => {
        return para.name == slotName
    })
    if(findPara.length != 1){
        return []
    }
    var ret = findPara[0][fieldName]
    return ret
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
    var collectionName = dbUtils.getPhraseCollectionName(intent.agent, intent.user)
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
    var collectionName = dbUtils.getPhraseCollectionName(intent.agent, intent.user)
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
    var collectionName = dbUtils.getPhraseCollectionName(intent.agent, intent.user)
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
    var collectionName = dbUtils.getPhraseCollectionName(intent.agent, intent.user)
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
function getRandomIdex(length){
    return Math.floor(Math.random()*length)
}

//////////////////////////////////////////////////////////////////
function generateForEntity(sentence, label, intentParas) {
    var entity = getEntityBy(intentParas, label)
    if (!entity) {
        return [sentence]
    }
    if(entity.values.length < label.maxNum){
        return entity.values.map(value => {
            return sentence.slice(0, label.startPos) + "[" + pattern.removeLablel(value).trim() + "]/" + entity.label + " "+ sentence.slice(label.startPos + label.length)
        })
    }else{
        var ret= []
        var valueSize = entity.values.length
        for (var i= 0; i< label.maxNum; i++){
            var value = entity.values[getRandomIdex(valueSize)]
            ret.push(sentence.slice(0, label.startPos) + "[" + pattern.removeLablel(value).trim() + "]/" + entity.label + " "+ sentence.slice(label.startPos + label.length))
        }
        return ret        
    }  
}

function calcGenerateSize(labels, intentPhrase, intentParas){
    var allSize = 1
    labels.forEach( label => {
       if((label.type == "entity")){
           var entity = getEntityBy(intentParas, label)
           allSize = allSize * entity.values.length

       }else{
           var phrase = getPhraseBy(intentPhrase, label)
           allSize = allSize * phrase.similars.length
       }
    })
    return allSize
}

//////////////////////////////////////////////////////////////////
function  calcLabelRatio(labels, intentPhrase, intentParas, maxdgSize){
     var allSize = calcGenerateSize(labels, intentPhrase, intentParas)
     if(allSize < maxdgSize){
         return labels.map(label => {
             label.maxNum = 1000;
             return label
            })
     }
     return labels.map(label => {
        if((label.type == "entity")){
            var entity = getEntityBy(intentParas, label)
            label.maxNum = Math.max(Math.floor((maxdgSize * entity.values.length)/allSize), 100)
 
        }else{
            var phrase = getPhraseBy(intentPhrase, label)
            label.maxNum = Math.max(Math.floor((maxdgSize * phrase.similars.length)/allSize), 10)
        }
        return label
     })
}

//////////////////////////////////////////////////////////////////
function generateForPhrase(sentence, label, intentPhrase) {
    var phrase = getPhraseBy(intentPhrase, label)
    if (!phrase) {
        return [sentence]
    }
    if (phrase.similars.length < label.maxNum) {
        return phrase.similars.map(value => {
            return sentence.slice(0, label.startPos) + value + sentence.slice(label.startPos + label.length)
        })
    }else{
        var ret= []
        var valueSize = phrase.similars.length
        for (var i= 0; i< label.maxNum; i++){
            var value = phrase.similars[getRandomIdex(valueSize)]
            ret.push(sentence.slice(0, label.startPos) + value + sentence.slice(label.startPos + label.length))
        }
        return ret
    }
}

function discordPunctuation(sentence){
    var puncs = [',', ';', '.', '?', '!', '，','；','。','？','！','—','…','~']
    var ret = sentence
    puncs.forEach(punc =>ret =  ret.replace(punc, ""))
    return ret
}

//////////////////////////////////////////////////////////////////
function generateSentences(sentence, labels, intentPhrase, intentParas) {
    sentence = discordPunctuation(sentence)
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
    pattern.labels = calcLabelRatio(pattern.labels, intentPhrase, intentParas, 2000)
    return generateSentences(pattern.sentence, pattern.labels, intentPhrase, intentParas)
}

async function getIntentIdByModelPath(user, agent, modelPath) {
    const collectionName = dbUtils.getIntentCollectionName(agent, user);
    var ret = await db.query(`FOR doc IN ${collectionName} filter doc.modelPath=='${modelPath}' return doc `).then(cursor => cursor.all())
    .then(intents => { if(intents.length == 0) return null;
                       return intents[0]._key },
    err => { console.error("error log", err); return null})
    return ret
}


async function generateSentencesForPatterns(intent, patterns){
    if(patterns.length == 0){
        return []
    }
    var intentPhrase = await getPhraseFor(intent)
    var intentParas = await getParasFor(intent)
    var ret = []

    const MAX_SENTENCE_SIZE = 20000
    var maxDgSize = Math.min(Math.max(Math.floor(MAX_SENTENCE_SIZE / patterns.length), 500), 2000)

    patterns.forEach(pattern =>{
        pattern.labels = calcLabelRatio(pattern.labels, intentPhrase, intentParas, maxDgSize)
        console.log("sentences labels is: ", pattern.labels)
        var sentences = generateSentences(pattern.sentence, pattern.labels, intentPhrase, intentParas)
        if(sentences.length < 5){
            for(var i = 0; i< 3; i++){
                ret.push(...sentences)
            }
        }
        ret.push(...sentences)
    })

    return ret
}

//////////////////////////////////////////////////////////////////
async function generateForIntentPos(agent, user, modelPath){
    var intent = {}
    intent.agent = agent
    intent.user = user
    intent.intentId = await getIntentIdByModelPath(user, agent, modelPath)
    if (intent.intentId == null){
        return { retCode: "failed" }
    }
    console.log('generate pos sentence is called', intent)
    var positive = await getPatternFor(intent, "positive")
    var ret = await generateSentencesForPatterns(intent, positive)
    return { retCode: "success", data: ret }
}

//////////////////////////////////////////////////////////////////
async function generateForIntentNeg(agent, user, modelPath){
    var intent = {}
    intent.agent = agent
    intent.user = user
    intent.intentId = await getIntentIdByModelPath(user, agent, modelPath)
    if (intent.intentId == null){
        return { retCode: "failed" }
    }
    console.log('generate neg sentence is called', intent)
    var negative = await getPatternFor(intent, "negative")
    var ret = await generateSentencesForPatterns(intent, negative)
    return { retCode: "success", data: ret }
}

//////////////////////////////////////////////////////////////////
async function generateForSlotPos(agent, user, modelPath, paraName){
    var intent = {}
    intent.agent = agent
    intent.user = user
    intent.intentId = await getIntentIdByModelPath(user, agent, modelPath)
    if (intent.intentId == null){
        return { retCode: "failed" }
    }
    console.log('generate slot filling pos sentence is called', intent, paraName)
    var positive = await getSlotPatternFor(intent, paraName, "positive")
    var ret = await generateSentencesForPatterns(intent, positive)
    return { retCode: "success", data: ret }
}

//////////////////////////////////////////////////////////////////
async function generateForSlotNeg(agent, user, modelPath, paraName){
    var intent = {}
    intent.agent = agent
    intent.user = user
    intent.intentId = await getIntentIdByModelPath(user, agent, modelPath)
    if (intent.intentId == null){
        return { retCode: "failed" }
    }
    console.log('generate slot filling neg sentence is called', intent, paraName)
    var negative = await getSlotPatternFor(intent, paraName, "negative")
    var ret = await generateSentencesForPatterns(intent, negative)
    return { retCode: "success", data: ret }
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
function doDeletePhraseLabelInPatterns(patterns, phraseId, phrase){
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
    await dbUtils.reUpdateArrayValues(intent, dbUtils.getPatternField("positive"), (arrays) => {
        return doDeletePhraseLabelInPatterns(arrays, pharseId, phrase)
    })
    await dbUtils.reUpdateArrayValues(intent, dbUtils.getPatternField("negative"), (arrays) => {
        return doDeletePhraseLabelInPatterns(arrays, pharseId, phrase)
    })
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
    generateForSlotPos,
    generateForSlotNeg,
    generateForIntentNeg,
    generateForIntentPos,
    updatePatterns
}

