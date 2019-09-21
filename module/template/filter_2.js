////////////////////////////////////////////////////////////////////////////////
//
// 文字過濾器
//
// 使用方法
// Filter(string, 過濾器名字, 過濾器名字...);
//
////////////////////////////////////////////////////////////////////////////////

// 若出現雙向引用的解決方法
const InjectModules = {};

const Filter = {};

export { Filter };


(function () {
    const $f = Filter;

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
        // debugger;

        const obj = new FilterCore(root);

        moduleName = moduleName || "*";

        if (!(moduleName in this.$addOnModuleGroups)) {
            throw new Error(`no this moduleGroup(${moduleName}) in Fileter`);
        }

        const addOn = this.$addOnModuleGroups[moduleName]

        for (let key in addOn) {
            if (key in obj) {
                // 避免 override
                throw new Error(`cant override Filter[${key}]`);
            }
            let fn = addOn[key];

            obj[key] = function(text){
                return fn.call(obj, text);
            };
        }
        return obj;
    };

})();

///////////////////////////////////////////////////////////////////////////////
class FilterCore {
    constructor(root) {
        // debugger;

        Object.defineProperty(this, '$$$root',{
            value: root,
            configurable: false,
            writable: false,
            enumerable: false,

        });
    }
}
