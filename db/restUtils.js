
//////////////////////////////////////////////////////////////////
function failRsp(retText, error){
    console.error(retText, error)
    return {retCode : "fail", retText}
}

//////////////////////////////////////////////////////////////////
function successRsp(data){
    return {retCode : "success", data: data}
}

module.exports = {
    failRsp,
    successRsp
}