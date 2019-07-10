////////////////////////////////////////////////////////////////////////////////
//
// 讓使用者可以擴增功能
//
//
////////////////////////////////////////////////////////////////////////////////
import { AnalyzeContent } from './analyzeContent_1.js';

const M = {};

export { M };
//--------------------------------------

(function() {

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
    
})();
