var fileUtils = require('./fileUtils.js')
var zipUtils = require('./zipUtils.js')
const agentDb = require('../db/agent-db.js')
const uuid = require('node-uuid');
const tempPath = "temp/"

function intentPath(configPath, agent){
    return configPath +  "/intent"
}

function entityPath(configPath, agent){
    return configPath + "/entities"
}

async function createAgentConfigPaths(configPath, agent){
    try {
        await fileUtils.mkdirP(configPath)
        await fileUtils.mkdirP(intentPath(configPath, agent)) 
        await fileUtils.mkdirP(entityPath(configPath, agent))         
    } catch (error) {
        console.error('create agent config path fail')
        console.error(error)
    }
}

async function buildAgentConfig(configPath, agentName){
    var agent = await agentDb.getAgentByName(agentName)
    console.log('agent is', agent)
    await fileUtils.writeYaml(configPath + "/" + agentName + ".yaml", agent)
}

async function buildConfigs(agent) {
    var configPath = tempPath + uuid.v1()
    await createAgentConfigPaths(configPath, agent)
    await buildAgentConfig(configPath, agent)


    var intent = {}
    intent.intent = "who-you-are"
    intent["user-says"] = ["你是谁"]
    intent.replies = ["我是小哒"]

    ret = await fileUtils.writeYaml(intentPath(configPath, agent) + "/intent.yaml", intent)


    await zipUtils.zipPath(tempPath + agent, "static/corpus-test.zip")

    console.log("ret is ", ret)

    return { retCode: "success" }     
}


module.exports={
    buildConfigs
}