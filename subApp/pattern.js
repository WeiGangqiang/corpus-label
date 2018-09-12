var express = require("express");
var utils = require('./utils.js')
const dbApi = require('../db/db-api.js')
const intentDb = require('../db/intent-db.js')
var app = express();

//////////////////////////////////////////////////////////////////
app.get("/", async function(req, res){
    var intent = utils.getIntentFromReqQuery(req)
    var patterns = []
    if(req.query.slotLabel){
        patterns = await intentDb.getPatternForSlot(intent, req.query.slotLabel, req.query.type)
    }else{
        patterns = await dbApi.getPatternFor(intent, req.query.type);
    }
    res.send(patterns);
})

//////////////////////////////////////////////////////////////////
app.post("/", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = {}
    if(req.body.slotLabel) {
       ret = await intentDb.addPatternForSlot(intent, req.body.slotLabel,req.body.pattern, req.body.type)
    }else{
       ret = await dbApi.addPatternFor(intent, req.body.pattern, req.body.type)
    }
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.delete("/", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = {}
    if(req.body.slotLabel) {
        ret = await intentDb.removePatternForSlot(intent, req.body.slotLabel, req.body.patternId, req.body.type)
    }else{
        ret = await dbApi.removePatternFor(intent, req.body.patternId, req.body.type)
    }
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.put("/", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = {}
    if(req.body.slotLabel) {
        ret = await intentDb.updatePatternForSlot(intent, req.body.slotLabel, req.body.patternId, req.body.pattern, req.body.type)
    }else{
        ret = await dbApi.updatePatternFor(intent, req.body.patternId, req.body.pattern, req.body.type)
    }
    res.send(ret)
})

module.exports = {
    app
}