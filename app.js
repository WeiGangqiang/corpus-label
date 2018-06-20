var express = require("express");

var app = express();
app.use(bodyParser.json());

app.get("/",async function(req, res, next){
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

app.listen(3000);
