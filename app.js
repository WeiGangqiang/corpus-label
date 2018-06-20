var express = require("express");
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.post("/",async function(req, res, next){
    const body=req.body;
    console.log(body)
    res.send("你好");
});

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

