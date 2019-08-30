////////////////////////////////////////////////////////////////////////////////
//
// 讓使用者可以擴增功能
//
//
////////////////////////////////////////////////////////////////////////////////
// 若出現雙向引用的解決方法
const InjectModules = {};


const FunctionModule = {};

export { FunctionModule };

(function () {
    const $f = FunctionModule;

    // 分組
    $f.$addOnModuleGroups = {
        "*": {}
    };

    //----------------------------
    // 若出現雙向引用的解決方法
    $f.injectModules = function (name, m) {
        InjectModules[name] = m;
    };
    //----------------------------

    $f.addModule = function (name, fun, moduleName) {
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
    //----------------------------
    // engine: 傳遞 options
    $f.getModule = function (root, moduleName) {
        debugger;

        const obj = new FuntionCore(root);

        // inject
        // 不可以被覆蓋的 key
        let KeyList = Object.keys(obj);

        if (!(moduleName in this.$addOnModuleGroups)) {
            throw new Error(`no this moduleGroup(${moduleName}) in FunctionModule`);
        }

        for (let key in this.$addOnModuleGroups[moduleName]) {
            if (KeyList.indexOf(key) >= 0) {
                throw new Error(`cant override Out[${key}]`);
            }
            let fn = this.$addOnModuleGroups[moduleName][key];

            obj[key] = function(){
                fn.apply(obj, arguments);
            };
        }


        return obj;
    };

})();

///////////////////////////////////////////////////////////////////////////////

// 功能本體
class FuntionCore {
    constructor(root) {
        debugger;

        Object.defineProperty(this, '$$$root', {
            value: root,
            configurable: false,
            writable: false,
            enumerable: false,

        });

        this.async = root.options.async;

    }
    //----------------------------
    stringify(obj) {
        let res;
        try {
            res = JSON.stringify(obj);
        } catch (err) {
            res = '' + err
        }
        return res;
    }
}


