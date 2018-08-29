var express = require("express");
const dbApi = require('../db/intent-db.js')
var app = express();

app.get("/all", async function(req, res){
    const agent= req.query.agent;
    console.log("receive req msg", agent);
    var intents = await dbApi.getIntentsFor(agent);
    console.log("intents is", intents)
    res.send(intents);
})


module.exports = {
    app
}
