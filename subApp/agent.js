var express = require("express");
var builder = require('../dgConfig/configBuilder.js')
const dbApi = require('../db/agent-db.js')
var app = express();

app.get("/", async function(req, res){
    var agent = await dbApi.getAgent(req.query.agentId);
    res.send(agent);
})

app.get("/all", async function(req, res){
    var agents = await dbApi.getAgentsAll()
    res.send(agents)
})

app.post("/create", async function(req, res){
    var ret = await builder.buildConfigs('course-record')
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.post("/", async function(req, res){
    var ret = await dbApi.addAgent(req.body)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.delete("/", async function(req, res){
    var ret = await dbApi.deleteAgent(req.query.agentId)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.put("/", async function(req, res){
    var ret = await dbApi.updateAgent(req.body)
    res.send(ret)
})

module.exports = {
    app
}
