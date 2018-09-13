var express = require("express");
const dbApi = require('../db/entity-db.js')
var app = express();

//////////////////////////////////////////////////////////////////
app.get("/names", async function(req, res){
    var entityNames = await dbApi.getEntityNames(req.query.agent, req.session.user.name);
    res.send(entityNames);
})

app.get("/all", async function(req, res){
    var entities = await dbApi.getAllEntityBaseInfo(req.query.agent, req.session.user.name)
    res.send(entities);
})

app.get("/", async function(req, res){
    var entity = await dbApi.getEntity(req.query.agent, req.session.user.name, req.query.entityName);
    res.send(entity);
})

app.get("/reference", async function(req, res){
    console.log('session info ', req.session.user)
    var reference = await dbApi.getReferenceFor(req.query.agent, req.session.user.name, req.query.entityName)
    res.send(reference)
})

//////////////////////////////////////////////////////////////////
app.post("/", async function(req, res){
    var ret = await dbApi.addEntity(req.body.agent,req.session.user.name, req.body.entity)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.delete("/", async function(req, res){
    var ret = await dbApi.deleteEntity(req.query.agent, req.session.user.name, req.query.entityId)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.put("/", async function(req, res){
    var ret = await dbApi.updateEntity(req.body.agent, req.session.user.name, req.body.entity)
    res.send(ret)
})

module.exports = {
    app
}
