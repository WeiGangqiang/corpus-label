var express = require("express");
const dbApi = require('../db/intent-db.js')
var app = express();

app.get("/all", async function(req, res){
    const agent= req.query.agent;
    console.log("receive req msg", agent);
    var intents = await dbApi.getIntentsFor(agent);
    console.log("intents is", intents)
    res.send(intents);
})

app.get("/", async function(req, res){
    var intent = await dbApi.getIntent(req.query.agent, req.query.intentId);
    res.send(intent);
})

//////////////////////////////////////////////////////////////////
app.post("/", async function(req, res){
    var ret = await dbApi.addIntent(req.body.agent, req.body.intent)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.delete("/", async function(req, res){
    var ret = await dbApi.deleteIntent(req.query.agent, req.query.intentId)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.put("/", async function(req, res){
    var ret = await dbApi.updateIntent(req.body.agent, req.body.intent)
    res.send(ret)
})

app.get("/actions", async function(req, res){
    var ret = await dbApi.getIntentActions(req.body.agent, req.body.intentId)
})

app.post("/actions", async function(req, res){
    var ret = await dbApi.updateIntentActions(req.body.agent, req.body.intentId, req.body.actions)
    res.send(ret)
})

module.exports = {
    app
}
