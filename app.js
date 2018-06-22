var express = require("express");
var bodyParser = require('body-parser');
const dbApi = require('./db-api.js')

var app = express();
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
    const agent = msg.agent
    const intentId = msg.intentId
    const user_say = msg.user_say

    res.send({result: "success"})
})

app.get("/unknown-says", async function(req, res){
    var unknowns = ["的科一刻不知道",
                    "暂停播放春秋",
                    "停机他听身体提特带天的体力和兔子",
                    "我们家谁的神经病都读课文的时候要快一点小爱同学",
                    "我们俩谁是神经病",
                    "打开如意古诗词"]

    res.send(unknowns)
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

