
//////////////////////////////////////////////////////////////////
function failRsp(retText, error){
    console.log(retText, error)
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