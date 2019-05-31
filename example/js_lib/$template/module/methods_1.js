////////////////////////////////////////////////////////////////////////////////
//
// 讓使用者可以擴增功能
//
//
////////////////////////////////////////////////////////////////////////////////
import { AnalyzeContent } from './analyzeContent_1.js';

const add_methodModules = {};

export { add_methodModules };
//--------------------------------------

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
    return M;
}

export { getMethodModule };
