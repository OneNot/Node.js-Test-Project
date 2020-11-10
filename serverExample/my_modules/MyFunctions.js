module.exports.CreateError = (errorMsg, statusVal) => {
    let e = new Error(errorMsg);
    e.status = statusVal;
    return e;
};