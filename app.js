var express = require("express");
var bodyParser = require('body-parser');
const dbApi = require('./db-api.js')
const logDb = require("./log-api.js")

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

