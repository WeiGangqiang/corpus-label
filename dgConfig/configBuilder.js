var fileUtils = require('./fileUtils.js')
var zipUtils = require('./zipUtils.js')
var shellExecutor = require('./shellExecutor.js')
const agentDb = require('../db/agent-db.js')
const entityDb = require('../db/entity-db.js')
const intentDb = require('../db/intent-db.js')
const postJson = require('../postjson.js');
var config = require('../config.js');
const uuid = require('node-uuid');
var async = require('async');
const tempPath = "temp/"

function agentPath(configPath, agent){
    return configPath + "/" + agent
}

//////////////////////////////////////////////////////////////////
function intentPath(configPath, agent){
    return agentPath(configPath, agent) +  "/intent"
}

//////////////////////////////////////////////////////////////////
function entityPath(configPath, agent){
    return agentPath(configPath, agent) + "/entities"
}

//////////////////////////////////////////////////////////////////
async function createAgentConfigPaths(configPath, agent){
    try {
        await fileUtils.mkdirP(configPath)
        await fileUtils.mkdirP(agentPath(configPath,agent))
        await fileUtils.mkdirP(intentPath(configPath, agent)) 
        await fileUtils.mkdirP(entityPath(configPath, agent))         
    } catch (error) {
        console.error('create agent config path fail')
        console.error(error)
    }
}

//////////////////////////////////////////////////////////////////
async function buildAgentConfig(configPath, user, agentName){
    var agent = await agentDb.getAgentByName(user, agentName)
    console.log('agent is', agent)
    agent.agentName = agent.name
    await fileUtils.writeYaml(configPath + "/" + agentName + ".yaml", agent)
}

//////////////////////////////////////////////////////////////////
async function doBuildEntityConfig(entityPath, entity){
    var entityYaml = {}
    entityYaml.enum = entity.name
    entityYaml.mode = "server"
    entityYaml.values =[{list: entity.items}]
    await fileUtils.writeYaml(entityPath + "/" + entity.name + ".yaml", entityYaml)
}

//////////////////////////////////////////////////////////////////
async function buildConfigForEntities(configPath, user, agentName){
    var entities = await entityDb.getEntitiesAll(agentName, user)
    console.log('entities is', entities)
    async.each(entities, function(entity,callBack){
        doBuildEntityConfig(entityPath(configPath, agentName), entity)
    }, function(error){
        console.error('error for build entity config', error)
    })
    console.log('build entity configs done')
}

//////////////////////////////////////////////////////////////////
function doBuildIntentParameters(parameters){
    return parameters.map( para => {
        return { parameter : para.name,
                 entity    : para.entity,
                 "is-list" : para.isList
            }
    })
}

//////////////////////////////////////////////////////////////////
async function doBuildIntentConfig(intentPath, intent){
    var intentYaml = {}
    intentYaml["intent"]  = intent.name
    intentYaml["zh-name"] = intent.zhName
    intentYaml["mode"]    = "server"
    var paths = intent.modelPath.split("/").slice(3)
    if(paths.length > 1){
        intentYaml["in-contexts"] = [paths.slice(0,-1).join(".")]
    }
    intentYaml["lifespan"] = 5
    if(intent.parameters.length > 0){
        intentYaml["parameters"] = doBuildIntentParameters(intent.parameters)
    }
    intentYaml["user-says"] = null
    intentYaml["actions"] = intent.actions.map(action => {
        var ret = {}
        ret[action.type] = action.values
        return ret
    })
    console.log('build itent is', intentYaml)
    await fileUtils.writeYaml(intentPath + "/" + intent.name + ".yaml", intentYaml)
}

//////////////////////////////////////////////////////////////////
async function buildConfigForIntent(configPath, user, agentName){
    var intents = await intentDb.getIntentsForServer(agentName, user)
    console.log("intents is", intents)
    async.each(intents, function(intent, callBack){
        doBuildIntentConfig(intentPath(configPath, agentName), intent)
    }, function(error){
        console.error('error for build intent', error)
    }) 
    console.log('build intent configs done')   
}

//////////////////////////////////////////////////////////////////
async function buildConfigs(agent, user) {
    var configPath = tempPath + uuid.v1()
    try {
        await createAgentConfigPaths(configPath, agent)
        await buildAgentConfig(configPath, user,agent)
        await buildConfigForEntities(configPath,user, agent)
        await buildConfigForIntent(configPath, user, agent)
        // await zipUtils.zipPath(configPath, "static/" + agent + ".zip")  
        await shellExecutor.execute("./dgConfig/agentDeploy.sh", [configPath, user, agent])
        console.log("send restart event for", agent)
        var ret = await postJson(config.chatbotUrl, {user, agent,name:"restart"})
        console.log('restart chatbot res', ret)
        // fileUtils.deleteDir(configPath) 
        return { retCode: "success" } 
    } catch (error) {
        console.error(' build configs error is', error)
        return { retCode : "failed" }
    }
}


module.exports={
    buildConfigs
}