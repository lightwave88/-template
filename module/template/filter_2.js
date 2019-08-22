////////////////////////////////////////////////////////////////////////////////
//
// 文字過濾器
//
// 使用方法
// Filter(string, 過濾器名字, 過濾器名字...); 
//
////////////////////////////////////////////////////////////////////////////////

// 若出現雙向引用的解決方法
const M = {};

class TemplateFilter {

    static addGlobalFilters(name, fun) {
        if (typeof name != 'string') {
            throw new TypeError('args[0] must be string');
        }

        if (typeof fun != 'function') {
            throw new TypeError('args[0] must be function');
        }
        TemplateFilter.addonFilters[name] = fun;
    }
    //-----------------------
    static getInstance(name) {
        let instance;

        name = (name == null ? "*" : name);

        if (TemplateFilter.instanceList[name] == null) {
            TemplateFilter.instanceList[name] = new TemplateFilter();
        }
        instance = TemplateFilter.instanceList[name];

        return instance;
    }
    //--------------------------------------
    constructor() {
        this.addonFilters = {};

    }
    //-----------------------
    // Filter()
    print() {
        let args = Array.from(arguments);
        let text = args.shift();

        for (let i = 0; i < args.length; i++) {
            let key = args[i];

            let filter;

            if (name in this.addonFilters) {
                filter = this.addonFilters[name];
            } else if (name in TemplateFilter.addonFilters) {
                filter = TemplateFilter.addonFilters[name];
            }

            if (typeof filter != 'function') {
                throw new Error(`Filter(${key}) no exists`);
            }
            text = filter(text);
        }

        return text;
    }
    //-----------------------
    addFilters(name, fun) {
        if (typeof name != 'string') {
            throw new TypeError('args[0] must be string');
        }

        if (typeof fun != 'function') {
            throw new TypeError('args[0] must be function');
        }
        this.addonFilters[name] = fun;
    }
    //-----------------------
    addGlobalFilters(name, fun) {

        TemplateFilter.addonFilters[name] = fun;
    }
}

TemplateFilter.instanceList = {
    "*": null
};

// addon
// global.filters
TemplateFilter.addonFilters = {};

// 若出現雙向引用的解決方法
TemplateFilter.injectModules = function (name, m) {
    M[name] = m;
}



export { TemplateFilter };
