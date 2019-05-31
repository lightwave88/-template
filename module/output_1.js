////////////////////////////////////////////////////////////////////////////////
//
// 輸出的核心
// 可被擴增
// 但很少會用到
//
//
////////////////////////////////////////////////////////////////////////////////

import { AnalyzeContent } from './analyzeContent_1.js';


const add_outputModules = {};


export { add_outputModules };
//--------------------------------------

const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
};

class OutputModuleClass {
    constructor() {
        Object.defineProperty(this, '$$$contentList', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: []
        });
    }
    //----------------------------
    push(html) {
        if(typeof(html) != 'string'){
            throw new TypeError(`output must be string`);
        }
        this.$$$contentList.push(html);
    }
    //----------------------------
    result() {
        return this.$$$contentList.join('');
    }
    //----------------------------
    print(html) {
        this.push(html);
    }
    //----------------------------
    escape(html) {
        if (typeof(_) == 'object' && _.escape != null) {
            html = _.escape(html);
        } else {

            let reg = RegExp(/(?:\^|<|>|"|'|`)/, 'g');
            html = html.replace(reg, function (m) {
                return escapeMap[m];
            });
        }
        this.push(html);
    }

    //---------------------------------
    // 轉換文本
    // 非同步
    importTemplate = function (html, data) {
        data = data || {};

        let $this = this;

        let al = new AnalyzeContent(html, {
            async: true
        });

        let fn = al.getFn();

        // 形成一個封閉環境
        let p = fn(data);

        p.then(function(res){
            $this.push(res);
        });

        return p;
    };

}

export { OutputModuleClass };
