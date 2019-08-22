////////////////////////////////////////////////////////////////////////////////
//
// 輸出的核心
// 可被擴增
// 但很少會用到
//
//
////////////////////////////////////////////////////////////////////////////////

const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
};

const OutputModule = {};

(function () {

    const $o = OutputModule;

    $o.addModule = {
        "*": {}
    };
    //-----------------------
    $o.addFuntion = function (name, fun, moduleName) {
        if (typeof name != 'string') {
            throw new TypeError("args[0] type must be string");
        }
        if (typeof fun != 'function') {
            throw new TypeError("args[0] type must be function");
        }

        moduleName = (moduleName == null ? "*" : moduleName);

        if (this.addModule[moduleName] == null) {
            this.addModule[moduleName] = {};
        }

        this.addModule[moduleName][name] = fun;
    };
    //-----------------------
    // options: 
    // moduleName: 可以沒有
    $o.getModule = function (engine, moduleName) {

        const out = new OutputCore(engine);

        // inject
        // 不可以被覆蓋的 key
        let KeyList = Object.keys(out);


        for (let key in this.addModule["*"]) {
            if (KeyList.indexOf(key) >= 0) {
                throw new Error(`cant override Out[${key}]`);
            }
            let fn = this.addModule["*"][key];

            out[key] = fn.bind(out);
        }

        if (moduleName != null && this.addModule[moduleName] != null) {

            for (let key in this.addModule[moduleName]) {
                if (KeyList.indexOf(key) >= 0) {
                    throw new Error(`cant override Out[${key}]`);
                }
                let fn = this.addModule[moduleName][key];

                out[key] = fn.bind(out);
            }
        }

        return out;
    };

})();

export { OutputModule };



// output 功能的核心
class OutputCore {
    constructor(analyzeEngine) {
        sync = !!sync;

        Object.defineProperty(this, '$$$contentList', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: []
        });


        Object.defineProperty(this, '$$$parentInfo', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: {
                options: null,
                path: null
            }
        });

    }
    //----------------------------
    push(html) {
        if (typeof (html) != 'string') {
            throw new TypeError(`output must be string`);
        }
        this.$$$contentList.push(html);
    }
    //----------------------------
    // 取得最後結果
    result() {
        return this.$$$contentList.join('');
    }
    //----------------------------
    print(html) {
        html = OutputCore.print(html);
        this.push(html);
    }
    //----------------------------
    escape(html) {

        html = OutputCore.print(html);

        if (typeof (_) == 'object' && _.escape != null) {
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
    // 類似 php.include 功能
    // 把 data, path 資訊往下傳     
    includeTemplat(html, data, path) {

        data = data || {};

        const options = this['$$$options'];

        let al = new AnalyzeEngine(html, options);

        let fn = al.getFn();

        // 形成一個封閉環境
        let res = fn(data);

        if (res instanceof Promise) {
            let $this = this;
            res.then(function (res) {
                $this.push(res);
            });
        }

        return res;
    }
    //---------------------------------
    static print(html) {

        if (typeof html == 'undefined') {
            html = 'undefined';
        } else if (typeof html == 'object') {
            if (html === null) {
                html = 'null';
            } else {
                html = JSON.stringify(html);
            }
        } else {
            try {
                html += '';
            } catch (err) {
                html = err.toString();
            }
        }
        return html;
    }

}
