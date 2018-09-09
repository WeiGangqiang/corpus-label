var arongodb = require('../db/arongo.js')
var express = require("express");
var app = express();
var db = arongodb.getDb()

//////////////////////////////////////////////////////////////////
async function isValidUser(user){
    const userCollectionName = "userInfo"
    var ret = false
    await db.query(`FOR doc in ${userCollectionName} FILTER doc.name == '${user.name}' && doc.password == '${user.password}' RETURN doc`)
        .then(cursor => cursor.all())
        .then(userInfo => {
            if(userInfo.length >=1 ){ ret = true } 
         },
            err => console.error("find user error log", err))
    return ret            
}

//////////////////////////////////////////////////////////////////
app.get("/login", async function(req, res){
    if("name" in req.query && "password" in req.query){
        var user = {}
        user.name = req.query.name
        user.password = req.query.password
        if(await isValidUser(user)){
            req.session.user = user
            res.send({ retCode: "success" })
        }else{
            res.send({ retCode: "fail", retText: "user not exsit" })
        }
    }else{
        res.send({ retCode: "fail", retText: "para check failed" })
    }
})

//////////////////////////////////////////////////////////////////
app.get("/logout", async function(req, res){
    req.session.user = null
})


module.exports = {
    app,
    isValidUser
}