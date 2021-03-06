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

export { OutputModule };

(function () {

    const $o = OutputModule;

    // 分組
    $o.$addOnModuleGroups = {
        "*": {}
    };
    //-----------------------
    $o.addModule = function (name, fun, moduleName) {
        if (typeof name != 'string') {
            throw new TypeError("args[0] type must be string");
        }
        if (typeof fun != 'function') {
            throw new TypeError("args[0] type must be function");
        }

        moduleName = (moduleName == null ? "*" : moduleName);

        if (this.$addOnModuleGroups[moduleName] == null) {
            this.$addOnModuleGroups[moduleName] = {};
        }

        this.$addOnModuleGroups[moduleName][name] = fun;
    };
    //-----------------------------

    // engine: analyzeEngine(轉移資料用)
    // moduleName: 可以沒有
    $o.getModule = function (root, moduleName) {

        const obj = new OutputCore(root);

        moduleName = moduleName || "*";

        if (!(moduleName in this.$addOnModuleGroups)) {
            throw new Error(`no this moduleGroup(${moduleName}) in OutputModule`);
        }

        const addOn = this.$addOnModuleGroups[moduleName];

        for (let key in addOn) {
            if (key in obj) {
                // 避免 override
                throw new Error(`cant override OutputModule[${key}]`);
            }
            let fn = addOn[key];

            obj[key] = fn.bind(obj);
        }


        return obj;
    };

})();

///////////////////////////////////////////////////////////////////////////////

// output 功能的核心
class OutputCore {
    constructor(root) {

        let options = root.options;
        const async = !!options.async;

        Object.defineProperty(this, 'options', {
            value: options,
            configurable: false,
            writable: false,
            enumerable: false,
        });


        Object.defineProperty(this, 'async', {
            value: async,
            configurable: false,
            writable: false,
            enumerable: false,
        });

        // this['$$$contentList']
        // 要輸出的文本內容
        Object.defineProperty(this, '$$$contentList', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: []
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
    // 動態 include
    // 可以是 sync, async
    include(filepath, data, path) {
        debugger;

        if (this.async) {
            let p;

            // 讀取檔案

            p = p.then(function (text) {
                // 解析 file 內容
                return this.includeTemplat(text, data, path);
            });

            return p;

        } else {


            // 讀取檔案


            // 讀取 file 內容
            this.includeTemplat(text, data, path);
        }
    }

    //---------------------------------

    // 類似 php.include 功能
    // 把 data, path 資訊往下傳
    includeTemplat(html, data, path) {

        data = data || {};

        const options = this['$$$options'];

        let al = new AnalyzeEngine(html, options);

        // fix
        // fix
        let fn = al.getFn();

        // 形成一個封閉環境
        let res = fn(data);

        if (res instanceof Promise) {
            let $this = this;
            res.then(function (res) {
                $this.push(res);
            });
        }

        this.push(res);
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
