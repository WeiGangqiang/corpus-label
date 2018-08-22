var express = require("express");
var utils = require('./utils.js')
const dbApi = require('../db-api.js')
var app = express();

//////////////////////////////////////////////////////////////////
app.get("/", async function(req, res){
    var intent = utils.getIntentFromReqQuery(req)
    var ret = await dbApi.getPhraseFor(intent)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.post("/", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = await dbApi.addPhraseFor(intent, req.body.similars)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.put("/", async function (req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = await dbApi.updatePhraseFor(intent, req.body.phraseId, req.body.similars)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.delete("/", async function (req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = await dbApi.deletePhraseFor(intent, req.body.phraseId)
    res.send(ret)
})


module.exports = {
    app
}