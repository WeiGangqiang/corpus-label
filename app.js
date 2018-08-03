var express = require("express");
var request = require('request');
var bodyParser = require('body-parser');
const dbApi = require('./db-api.js')
const logDb = require("./log-api.js")
const postJson = require('./postjson.js');
var config = require('./config.js');

var cors = require('cors');  
var app = express();
app.use(cors())
app.use(bodyParser.json());

app.get("/agents", async function(req, res){
    const host = req.query.host;
    console.log("receive query agents para:", host)
    res.send(["course-record","question-answer"])
})

app.get("/intents",async function(req, res){
    const agent= req.query.agent;
    console.log("receive req msg", agent);
    var intents = await dbApi.getIntentsFor(agent);
    console.log("intents is", intents)
    res.send(intents);
});

app.get("/parameters", async function(req, res){
    var msg = {}
    msg.agent = req.query.agent
    msg.intentId = req.query.intentId
    console.log("receive req msg", msg)
    var paras = await dbApi.getParasFor(msg)
    console.log("response is:", paras)
    res.send(paras)
})

app.post("/corpus", async function(req, res){
    const msg = req.body
    var ret = await dbApi.addSentence(msg)
    res.send(ret)
})

app.get("/unknown-says", async function(req, res){
    const agent= req.query.agent;
    var ret = await logDb.getUnknownSays(agent)
    res.send(ret)
})

app.get("/pattern", async function(req, res){
    var intent = {}
    intent.agent = req.query.agent
    intent.intentId = req.query.intentId
    console.log("receive req msg", intent)
    var patterns = await dbApi.getPatternFor(intent);
    console.log("intents is", patterns)
    res.send(patterns);
})

app.post("/pattern", async function(req, res){
    var intent = {}
    intent.agent = req.body.agent
    intent.intentId = req.body.intentId
    console.log("receive req msg", req.body)
    var ret = await dbApi.addPatternFor(intent, req.body.pattern)
    res.send(ret)
})

app.delete("/pattern", async function(req, res){
    var intent = {}
    intent.agent = req.body.agent
    intent.intentId = req.body.intentId
    console.log("receive req msg", req.body)
    var ret = await dbApi.removePatternFor(intent, req.body.patternId)
    res.send(ret)
})

app.put("/pattern", async function(req, res){
    var intent = {}
    intent.agent = req.body.agent
    intent.intentId = req.body.intentId
    console.log("receive req msg", req.body)
    var ret = await dbApi.updatePatternFor(intent, req.body.patternId, req.body.pattern)
    res.send(ret)
})

app.post("/simplifier", async function(req, res){
    var ret = await postJson(config.simpliferUrl, req.body)
    console.log('simplifer result ', ret)
    res.send(ret)
})

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
  
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.send('error');
});

var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port  
    console.log("server start on: http://%s:%s", host, port)
   
});

