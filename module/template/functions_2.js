////////////////////////////////////////////////////////////////////////////////
//
// 讓使用者可以擴增功能
//
//
////////////////////////////////////////////////////////////////////////////////
// 若出現雙向引用的解決方法
const M = {};

class FunctionModules {

    static addGlobalModules(name, fun) {
        FunctionModules.moudules[name] = fun;
    }
    //-----------------------

    static getInstance(name) {
        let instance;

        name = (name == null ? "*" : name);

        if (FunctionModules.instanceList[name] == null) {
            FunctionModules.instanceList[name] = new TemplateFilter();
        }
        instance = FunctionModules.instanceList[name];

        return instance;
    }
    //-----------------------

    constructor() {
        // 有時候需要獨立出 FunctionModules
        this._modeules = {};
    }
    //-----------------------
    // Fun()
    callModules(name) {
        let res;

        if (name in this._modeules) {
            res = this.modeules[name];
        } else if (name in FunctionModules.modeules) {
            res = FunctionModules.modeules[name];
        }

        if (res == null) {
            throw new Error(`Fun(${name}) no exists`);
        }

        return res;
    }
    //-----------------------
    addModules(name, fun) {
        if (typeof name != 'string') {
            throw new TypeError('args[0] must be string');
        }

        if (typeof fun != 'function') {
            throw new TypeError('args[0] must be function');
        }
        this.modeules[name] = fun;
    }
    //-----------------------
    addGlobalModules(name, fun) {
        if (typeof name != 'string') {
            throw new TypeError('args[0] must be string');
        }

        if (typeof fun != 'function') {
            throw new TypeError('args[0] must be function');
        }
        FunctionModules.moudules[name] = fun;
    }
};

FunctionModules.instanceList = {
    "*": null
};

// addon
// global modules
FunctionModules.moudules = {};

// 若出現雙向引用的解決方法
FunctionModules.injectModules = function (name, m) {
    M[name] = m;
}

export { FunctionModules };
//--------------------------------------

FunctionModules.addGlobalModules('stringify', function (obj) {
    let res;
    try {
        res = JSON.stringify(obj);
    } catch (err) {
        res = '' + err
    }
    return res;
});
