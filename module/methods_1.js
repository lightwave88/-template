


function getMethodModule() {

    const M = {};
    //---------------------------------
    M.stringify = function (obj) {
        let res;
        try {
            res = JSON.stringify(obj);
        } catch (err) {
            res = '' + err
        }
        return res;
    };
    //---------------------------------
    M.include = function (url) {

    };

    return M;
}

export { getMethodModule };