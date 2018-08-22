var express = require("express");
var utils = require('./utils.js')
const dbApi = require('../db-api.js')
var app = express();

//////////////////////////////////////////////////////////////////
app.get("/", async function(req, res){
    var intent = utils.getIntentFromReqQuery(req)
    var patterns = await dbApi.getPatternFor(intent, req.query.type);
    console.log("intents is", patterns)
    res.send(patterns);
})

//////////////////////////////////////////////////////////////////
app.post("/", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = await dbApi.addPatternFor(intent, req.body.pattern, req.body.type)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.delete("/", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = await dbApi.removePatternFor(intent, req.body.patternId, req.body.type)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.put("/", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = await dbApi.updatePatternFor(intent, req.body.patternId, req.body.pattern, req.body.type)
    res.send(ret)
})

module.exports = {
    app
}