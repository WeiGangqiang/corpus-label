var fileUtils = require('./fileUtils.js')
var zipUtils = require('./zipUtils.js')
const tempPath = "temp/"


async function buildConfigs(agent) {
    var ret = await fileUtils.mkdirP(tempPath + agent)

    console.log("ret is ", ret)
    var intent = {}
    intent.intent = "who-you-are"
    intent["user-says"] = ["你是谁"]
    intent.replies = ["我是小哒"]

    ret = await fileUtils.writeYaml(tempPath + agent + "/intent.yaml", intent)


    await zipUtils.zipPath(tempPath + agent, "static/corpus-test.zip")

    console.log("ret is ", ret)

    return { retCode: "success" }     
}


module.exports={
    buildConfigs
}