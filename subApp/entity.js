var express = require("express");
const dbApi = require('../db/entity-db.js')
var app = express();

//////////////////////////////////////////////////////////////////
app.get("/names", async function(req, res){
    var entityNames = await dbApi.getEntityNames(req.query.agent);
    res.send(entityNames);
})

app.get("/", async function(req, res){
    var entity = await dbApi.getEntity(req.query.agent, req.query.entityName);
    res.send(entity);
})

app.get("/reference", async function(req, res){
    var reference = await dbApi.getReferenceFor(req.query.agent, req.query.entityName)
    res.send(reference)
})

//////////////////////////////////////////////////////////////////
app.post("/", async function(req, res){
    var ret = await dbApi.addEntity(req.body.agent, req.body.entity)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.delete("/", async function(req, res){
    var ret = await dbApi.deleteEntity(req.query.agent, req.query.entityId)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.put("/", async function(req, res){
    var ret = await dbApi.updateEntity(req.body.agent, req.body.entity)
    res.send(ret)
})

module.exports = {
    app
}
