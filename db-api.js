var arango = require('arangojs');
var config = require('./config.js')
var pattern = require('./pattern-utils.js')
Database = arango.Database;

db = new Database(`http://${config.host}:${config.port}`);

db.useDatabase('xiaoda-corpus');
db.useBasicAuth(config.user, config.password)

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
function format(intents, ret) {
    for (i in intents) {
        ret.push({ intentId: intents[i]._key, name: intents[i].name, zhName: intents[i].zhName, modelPath: intents[i].modelPath })
    }
}

//////////////////////////////////////////////////////////////////
async function getIntentsFor(agent) {
    var ret = []
    const collectionName = getIntentCollectionName(agent);
    await db.query(`FOR doc IN ${collectionName} return doc `).then(cursor => cursor.all())
        .then(intents => format(intents, ret),
            err => console.error("error log", err))
    return ret
}

//////////////////////////////////////////////////////////////////
async function getEntityValuesFor(agent, entityName) {
    var ret = []
    const collectionName = getEntityCollectionName(agent);
    await db.query(`FOR doc in ${collectionName} FILTER doc.name == '${entityName}' RETURN doc`)
        .then(cursor => cursor.all())
        .then(entitys => ret = entitys[0],
            err => console.error("error log", err))

    return ret
}

//////////////////////////////////////////////////////////////////
async function addSentence(msg) {
    const accept = msg.accept
    var retCode = "success"
    if (accept == true) {
        await addToArrayTo(msg, "positive", msg.sentence)
    }
    return { retcode: retCode }
}

//////////////////////////////////////////////////////////////////
async function getParasFor(intent) {
    var parameters = await getArrayListFor(intent, "parameters")
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
async function getArrayListFor(intent, fieldName) {
    var ret = []
    console.log(`get array for agent ${intent.agent} intent id ${intent.intentId}, fieldName ${fieldName}`)
    const key = intent.intentId;
    const agent = intent.agent;
    const collectionName = getIntentCollectionName(agent);
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
    await db.query(aql)
        .then(cursor => cursor.all())
        .then(ret => console.info("add success, result is ", ret),
            err => { console.error("add fail, log is ", err); retCode = "add failed" })

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
    await db.query(aql)
        .then(cursor => cursor.all())
        .then(ret => console.info("remove success, result is ", ret),
            err => { console.error("remove fail, log is ", err); retCode = "add failed" })

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

    console.info("remove from array aql is :", aql)
    await db.query(aql)
        .then(cursor => cursor.all())
        .then(ret => console.info("update success, result is ", ret),
            err => { console.error("update fail, log is ", err); retCode = "add failed" })
}

//////////////////////////////////////////////////////////////////
async function getPatternFor(intent) {
    return getArrayListFor(intent, "patterns")
}

//////////////////////////////////////////////////////////////////
async function addPatternFor(intent, value) {
    addToArrayTo(intent, "patterns", value)
    return { retCode: "success" }
}

//////////////////////////////////////////////////////////////////
async function removePatternFor(intent, index) {
    removeFromArray(intent, "patterns", index)
    return { retCode: "success" }
}

//////////////////////////////////////////////////////////////////
async function updatePatternFor(intent, index, value) {
    updateArrayItem(intent, "patterns", index, value)
    return { retCode: "success" }
}

//////////////////////////////////////////////////////////////////
async function addPhraseFor(intent, similars) {
    var collectionName = getPhraseCollectionName(intent.agent)
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
    var collectionName = getPhraseCollectionName(intent.agent)
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
    var collectionName = getPhraseCollectionName(intent.agent)
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
    var collectionName = getPhraseCollectionName(intent.agent)
    var collection = db.collection(collectionName)

    await collection.remove(phraseId).then(
        () => console.log('Document removed'),
        err => console.error('Failed to remove document', err)
    );

    return { retCode: "success" }
}

function searchPhrase(term, intentPhrase) {
    var ret = intentPhrase.find((phrase) => {
        return phrase.similars.includes(term)
    })
    return ret ? ret.phraseId : ""
}

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
        return sentence.slice(0, label.startPos) + "[" + pattern.removeLablel(value).trim() + "]" + entity.label + sentence.slice(label.startPos + label.length)
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


module.exports = {
    getIntentsFor,
    getParasFor,
    getEntityValuesFor,
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
    generateSentencesFor
}

