var express = require("express");
var utils = require('./utils.js')
const dbApi = require('../db/intent-db.js')
var app = express();

app.get("/all", async function(req, res){
    const agent= req.query.agent;
    const user= req.query.user;
    var intents = await dbApi.getIntentsFor(agent, user);
    console.log("intents is", intents)
    res.send(intents);
})

app.get("/", async function(req, res){
    var intent = await dbApi.getIntent(req.query.agent, req.query.user, req.query.intentId);
    res.send(intent);
})

//////////////////////////////////////////////////////////////////
app.post("/", async function(req, res){
    var ret = await dbApi.addIntent(req.body.agent, req.body.user, req.body.intent)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.delete("/", async function(req, res){
    var ret = await dbApi.deleteIntent(req.query.agent, req.query.user, req.query.intentId)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.put("/", async function(req, res){
    var ret = await dbApi.updateIntent(req.body.agent, req.body.user, req.body.intent)
    res.send(ret)
})

app.get("/actions", async function(req, res){
    var ret = await dbApi.getIntentActions(req.query.agent, req.body.user, quereq.query.intentId)
    res.send(ret)
})

app.post("/actions", async function(req, res){
    var ret = await dbApi.updateIntentActions(req.body.agent, req.body.user, req.body.intentId, req.body.actions)
    res.send(ret)
})

app.delete("/parameter", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = await dbApi.deleteParameter(intent, req.body.parameter)
    res.send(ret)
})

// app.get("/parameter", async function(req, res){

// })

// app.get("/parameter/all", async function(req, res){

// })

app.put("/parameter", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = await dbApi.updateParameter(intent, req.body.parameter)
    res.send(ret)
})

app.post("/parameter", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = await dbApi.addParameter(intent, req.body.parameter)
    res.send(ret) 
})

module.exports = {
    app
}
