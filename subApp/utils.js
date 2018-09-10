//////////////////////////////////////////////////////////////////
function getIntentFromReqBody(req){
    var intent = {}
    intent.agent = req.body.agent
    intent.user = req.session.user.name
    intent.intentId = req.body.intentId
    console.log("receive req msg", req.body)
    return intent
}

//////////////////////////////////////////////////////////////////
function getIntentFromReqQuery(req){
    var intent = {}
    intent.agent = req.query.agent
    intent.user  = req.session.user.name
    intent.intentId = req.query.intentId
    console.log("receive req msg", req.query)
    return intent
}

module.exports = {
    getIntentFromReqBody,
    getIntentFromReqQuery
}