var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const dbApi = require('./db/db-api.js')
const logDb = require("./db/log-api.js")
const postJson = require('./postjson.js');
var config = require('./config.js');
var slot = require('./subApp/slot.js')
var phrase = require('./subApp/phrase.js')
var pattern = require('./subApp/pattern.js')
var utils = require('./subApp/utils.js')
var intentApp = require('./subApp/intent.js')
var entityApp = require('./subApp/entity.js')
var agentApp = require('./subApp/agent.js')
var userApp = require('./subApp/user.js')

var cors = require('cors');  
var app = express();

const corsOption = {
    origin: function(origin, callback) {
        callback(null, true)
    },
    credentials: true
}
app.use(cors(corsOption))
app.use(bodyParser.json());

app.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie : {
        maxAge : 1000 * 60 * 3, // 设置 session 的有效时间，单位毫秒
    },
}));

app.use(function(req, res, next){
    req.session._garbage = Date();
    req.session.touch();
    next();
});

app.use(async function(req, res, next){
    console.log("receive request url:", req.url)
    if(req.url.startsWith('/user/login')){
        next()
    }else{
        if(req.session.user){
            if(await userApp.isValidUser(req.session.user)){
                next()
            }else{
                res.send({retCode: "401", retText: "user check fail"})
            }
        }
        else{
            res.send({retCode: "401", retText: "user not login"})
        }
    }
})

//////////////////////////////////////////////////////////////////
app.use("/parameters", slot.app)
app.use("/pattern", pattern.app)
app.use("/phrase", phrase.app)
app.use("/intent", intentApp.app)
app.use("/entity", entityApp.app)
app.use("/agent", agentApp.app)
app.use("/user", userApp.app)

//////////////////////////////////////////////////////////////////
app.post("/corpus", async function(req, res){
    const msg = req.body
    var ret = await dbApi.addSentence(msg)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.get("/unknown-says", async function(req, res){
    const agent= req.query.agent;
    var ret = await logDb.getUnknownSays(agent)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.post("/simplifier", async function(req, res){
    var ret = await postJson(config.simpliferUrl, req.body)
    console.log('simplifer result ', ret)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.post("/label/predict", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = await dbApi.labelPredict(intent, req.body.sentence)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.post("/generate", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = await dbApi.generateSentencesFor(intent, req.body.pattern)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.post("/remote-dg", async function(req, res){
    var ret = await dbApi.generateDone(req.body.agent, req.body.user, req.body.modelPath)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.post("/pattern/sync", async function(req, res){
    var intent = utils.getIntentFromReqBody(req)
    var ret = await dbApi.updatePatterns(intent, req.body.phraseId, req.body.phrase)
    res.send(ret)
})

//////////////////////////////////////////////////////////////////
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


//////////////////////////////////////////////////////////////////
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.send('error');
});


//////////////////////////////////////////////////////////////////
var server = app.listen(config.runPort, function () {
    var host = server.address().address
    var port = server.address().port  
    console.log("server start on: http://%s:%s", host, port)  
});

