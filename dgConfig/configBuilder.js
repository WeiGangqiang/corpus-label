var fileUtils = require('./fileUtils.js')
var zipUtils = require('./zipUtils.js')
const agentDb = require('../db/agent-db.js')
const entityDb = require('../db/entity-db.js')
const intentDb = require('../db/intent-db.js')
const uuid = require('node-uuid');
var async = require('async');
const tempPath = "temp/"

//////////////////////////////////////////////////////////////////
function intentPath(configPath){
    return configPath +  "/intent"
}

//////////////////////////////////////////////////////////////////
function entityPath(configPath){
    return configPath + "/entities"
}

//////////////////////////////////////////////////////////////////
async function createAgentConfigPaths(configPath){
    try {
        await fileUtils.mkdirP(configPath)
        await fileUtils.mkdirP(intentPath(configPath)) 
        await fileUtils.mkdirP(entityPath(configPath))         
    } catch (error) {
        console.error('create agent config path fail')
        console.error(error)
    }
}

//////////////////////////////////////////////////////////////////
async function buildAgentConfig(configPath, agentName){
    var agent = await agentDb.getAgentByName(agentName)
    console.log('agent is', agent)
    await fileUtils.writeYaml(configPath + "/" + agentName + ".yaml", agent)
}

//////////////////////////////////////////////////////////////////
async function doBuildEntityConfig(configPath, entity){
    var entityYaml = {}
    entityYaml.enum = entity.name
    entityYaml.values =[{list: entity.items}]
    await fileUtils.writeYaml(entityPath(configPath) + "/" + entity.name + ".yaml", entityYaml)
}

//////////////////////////////////////////////////////////////////
async function buildConfigForEntities(configPath, agentName){
    var entities = await entityDb.getEntitiesAll(agentName)
    console.log('entities is', entities)
    async.each(entities, function(entity,callBack){
        doBuildEntityConfig(configPath, entity)
    }, function(error){
        console.error('error for build entity config', error)
    })
    console.log('build entity configs done')
}

//////////////////////////////////////////////////////////////////
async function doBuildIntentConfig(configPath, intent){

}

//////////////////////////////////////////////////////////////////
async function buildConfigForIntent(configPath, agentName){
    var intents = await intentDb.getIntentsForServer(agentName)
    console.log("intents is", intents)
    async.each(intents, function(intent, callBack){
        doBuildIntentConfig(configPath, intent)
    }, function(error){
        console.error('error for build intent', error)
    }) 
    console.log('build intent configs done')   
}

//////////////////////////////////////////////////////////////////
async function buildConfigs(agent) {
    var configPath = tempPath + uuid.v1()
    await createAgentConfigPaths(configPath)
    await buildAgentConfig(configPath, agent)
    await buildConfigForEntities(configPath,agent)
    await buildConfigForIntent(configPath, agent)


    var intent = {}
    intent.intent = "who-you-are"
    intent["user-says"] = ["你是谁"]
    intent.replies = ["我是小哒"]

    ret = await fileUtils.writeYaml(intentPath(configPath) + "/intent.yaml", intent)


    await zipUtils.zipPath(configPath, "static/corpus-test.zip")

    console.log("ret is ", ret)

    return { retCode: "success" }     
}


module.exports={
    buildConfigs
}