var express = require("express");
var utils = require('./utils.js')
const dbApi = require('../db/db-api.js')
var app = express();

//////////////////////////////////////////////////////////////////
app.get("/", async function(req, res){
    var intent = utils.getIntentFromReqQuery(req)
    var paras = await dbApi.getParasFor(intent)
    console.log("response is:", paras)
    res.send(paras)
})



module.exports = {
    app
}