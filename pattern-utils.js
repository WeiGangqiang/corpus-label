
function removeLablel(sentence){
    var reg = /[\[\]]/g
    var labelReg = /\/L[0-9]/g
    // console.log("before remove", sentence)
    var ret = sentence.replace(reg, "").replace(labelReg, "")
    // console.log("after remove", ret)
    return ret
}

module.exports = {
    removeLablel
}
