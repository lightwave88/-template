////////////////////////////////////////////////////////////////////////////////
//
// 讓使用者可以擴增功能
//
//
////////////////////////////////////////////////////////////////////////////////
import { AnalyzeEngine } from './analyzeEngine_1.js';

const Fun = {};

export { Fun as FunctionModules };
//--------------------------------------

(function() {

    Fun.stringify = function (obj) {
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
