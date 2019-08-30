
// 從文本解析出 tag
import { TagTools } from './tagTools_3.js';

// output 模組
import { OutputModule } from './output_2.js';

// 應用函式模組
import { FunctionModule } from './functions_2.js';

import { Filter } from './filter_2.js';
//-----------------------

const $OutputModule = OutputModule;
const $FunctionModule = FunctionModule;
const $Filter = Filter;

////////////////////////////////////////////////////////////////////////////////
//
//
// renderFunction 背後的處理著
//
////////////////////////////////////////////////////////////////////////////////
class RenderFactory {

    static getRenderFunction(content, options) {
        debugger;
        const core = new RenderFactory(content, options);

        const fn = (function (core, data) {
            debugger;

            let res = core.main(data);
            return res;
        }).bind({}, core);
        //-----------------------
        // 解析方法採用何種方式
        fn.setAsync = function (async) {
            core.setAsync(async);
        };

        // 設定模板內的路徑資訊
        fn.setPath = function (name, path) {
            core.setPath(name, path);
        };

        // 設定 include.rootPath
        fn.setIncludepath = function (path) {
            core.setIncludepath(path);
        };

        // 綁定模板內的對象
        fn.setBindObj = function (obj) {
            core.setBindObj(obj);
        };

        // 設定模板內的全域變數
        fn.setVariable = function (k, v) {
            core.setVariable(k, v);
        };

        // 設定 injectMode 的分組
        fn.setModuleGroup = function (moduleGroup) {
            core.setModuleGroup(moduleGroup);
        };

        return fn;
    }
    //----------------------------

    // options: {async: , path: , moduleName: , includepath: , bind:}
    constructor(content, options) {

        // 模板會用到的資料
        this.data = {};

        // 使用者選項
        this.options = {
            //模板內運作方式
            async: false,
            // 模板內的全域者
            bind: {},
            // 模板要用的模組名稱
            moduleGroup: null,
            // include.rootPath
            includePath: null,
            // 要注入的全域變數
            variable: {},
            // 模板中會用到路徑資訊
            path: {},
        };

        // 文本內容
        this.content = '';

        // fn 的內文(要解析的目標)
        this.fnContext;

        // 要注入的模組
        this.injectModules;
        //------------------
        this._init();
    }
    //----------------------------
    _init(content, options) {

        Object.assign(this.options, engine.options);

        this.async = !!this.options.async;

        this.path = Object.assign({}, engine.path);
    }
    //----------------------------
    // 設定模板內的路徑資訊
    setPath(name, path) {
        const $path = this.options.path;

        if (typeof name == 'string') {
            $path[name] = path;
        } else {
            Object.assign($path, name);
        }
    }

    // 設定 include.rootPath
    setIncludepath(includePath) {
        this.options.includePath = includePath;
    }

    // 解析方法採用何種方式
    setAsync(async) {
        this.options.async = !!async;
    }

    // 綁定模板內的對象
    setBindObj(obj) {
        this.options.bind = obj;
    }

    // 設定 injectMode 的分組
    setModuleGroup(moduleGroup) {
        this.options.moduleGroup = moduleGroup;
    }

    // 設定模板內的全域變數
    setVariable(k, v) {
        const variable = this.options.variable;
        variable[k] = v;
    }

    //----------------------------
    // test
    testGetNodeList() {
        debugger;

        // 分析文本
        // 最麻煩的地方
        let nodeList = TagTools.getCommandTagSync(content, this);
        return nodeList;
    }

    // test
    testGetContext() {
        debugger;

        // 分析文本
        // 最麻煩的地方
        let nodeList = TagTools.getCommandTagSync(content, this);

        let fnCommand = '';

        // 困難地方
        nodeList.forEach(function (node) {
            // this.fnCommand += node.printCommand(this.SCRIPTS);
            fnCommand += node.printCommand();
        }, this);
        return fnCommand;
    }
    //----------------------------
    main(data) {

        Object.assign(this.data, data);

        // 取得所需模组
        this.getInjectModules();

        if (this.async) {
            return this._main();
        } else {
            return thins._mainSync();
        }
    }
    //----------------------------
    async _main() {
        debugger;

        if (this.fnContext == null) {
            // 分析文本
            // 最麻煩的地方
            let nodeList = await TagTools.getCommandTag(content, this);

            debugger;

            // 若有設置全域變數
            this.checkVariable();

            // 把文本轉成函式內容
            this.getCommand(nodeList);
        }
        let fn = this.generatorRenderFunction();

        // 執行函式
        let res = await this.render(fn);

        return res;
    }

    _mainSync() {
        debugger;

        if (this.fnContext == null) {
            // 分析文本
            // 最麻煩的地方
            let nodeList = TagTools.getCommandTagSync(content, this);

            debugger;

            // 若有設置全域變數
            this.checkVariable();

            // 把文本轉成函式內容
            this.getCommandSync(nodeList);
        }

        let fn = this.generatorRenderFunction();

        // 執行函式
        let res = this.renderSync(fn);

        return res;
    }
    //----------------------------
    getCommandSync(nodeList) {

        let fnCommand = '';
        let variableText = '';

        // 困難地方
        nodeList.forEach(function (node) {
            // this.fnCommand += node.printCommand(this.SCRIPTS);
            fnCommand += node.printCommand();
        }, this);

        const variable = this.options.variable;
        for (let k in variable) {
            variableText += `const ${k} = $$$variable[${k}];\n`;
        }

        fnCommand = `
            'use strict'
            debugger;

            const D = $$$data;
            const Out = $$$outputModule;
            const Fun = $$$funModule;
            const Filter = $$$filterModule;
            const Path = $$$pathData;
            //------------------
            $$$data = undefined;
            $$$outputModule = undefined;
            $$$funModule = undefined;
            $$$filterModule = undefined;
            $$$pathData = undefined;
            //------------------
            ${variableText}

            $$$variable = undefined；
            //------------------
            ${fnCommand}
            //------------------

            return (Out.result());\n`;


        this.fnContext = fnCommand;
    }

    getCommand(nodeList) {
        let fnCommand = '';
        let variableText = '';

        // 困難地方
        nodeList.forEach(function (node) {
            // this.fnCommand += node.printCommand(this.SCRIPTS);
            fnCommand += node.printCommand();
        }, this);

        const variable = this.options.variable;
        for (let k in variable) {
            variableText += `const ${k} = $$$variable[${k}];\n`;
        }

        fnCommand = `
            'use strict'

            //------------------
            return (async function(){
                debugger
                'use strict'

                const D = $$$data;
                const Out = $$$outputModule;
                const Fun = $$$funModule;
                const Filter = $$$filterModule;
                const Path = $$$pathData;
                //------------------
                $$$data = undefined;
                $$$outputModule = undefined;
                $$$funModule = undefined;
                $$$filterModule = undefined;
                $$$pathData = undefined;
                //------------------
                ${variableText}

                $$$variable = undefined；
                //------------------
                ${fnCommand}
                //------------------

                return (Out.result());\n;
            }).call(this)`;

        this.fnContext = fnCommand;
    }

    //----------------------------
    // 取得要注入的模組
    getInjectModules() {

        const output = $OutputModule.getModule(this, this.moduleGroup);
        const filter = $Filter.getModule(this, this.moduleGroup);
        const fun = $FunctionModule.getModule(this, this.moduleGroup);


        this.injectModules = {
            output: output,
            filter: filter,
            fun: fun,
        };
    }
    //----------------------------
    // 創造 function
    generatorRenderFunction() {
        let fn;
        try {
            debugger;
            fn = new Function('$$$data', '$$$pathData', '$$$outputModule', '$$$funModule', '$$$filterModule', '$$$variable', this.fnContext);
        } catch (error) {
            console.log(this.fnContext);
            throw new Error(`build template error(${String(error)})`);
        }
        return fn;
    }
    //----------------------------
    // 若使用者在模板內有設定全域變數
    // 必須檢查
    checkVariable() {
        const cantOverride = ["D", "Out", "Fun", "Path"];
        const path = this.options.path;
        for (let k in path) {
            if (cantOverride.includes(k)) {
                throw new Error(`cant override this variable(${k})`);
            }
        }
    }
    //----------------------------
    renderSync(fn) {

        debugger;

        const outputModule = this.injectModules['output'];
        const funModule = this.injectModules['fun'];
        const filterModule = this.injectModules['filter'];
        const variable = this.options.variable;
        const path = this.options.path;

        const bindObj = this.options.bind;

        //----------------------------
        let htmlContent = '';

        try {
            htmlContent = fn.call(bindObj, this.data, path, outputModule, funModule, filterModule, variable);
        } catch (error) {
            throw new Error(`run template error(${String(error)}) => (${fn.toString()})`);
        }
        return htmlContent;
    }

    render(fn) {
        debugger;

        const outputModule = this.injectModules['output'];
        const funModule = this.injectModules['fun'];
        const filterModule = this.injectModules['filter'];
        const variable = this.options.variable;
        const path = this.options.path;

        const bindObj = this.options.bind;

        //----------------------------
        let promise;

        try {
            promise = fn.call(bindObj, this.data, path, outputModule, funModule, filterModule, variable);
        } catch (error) {
            throw new Error(`run template error(${String(error)}) => (${fn.toString()})`);
        }
        return promise;
    }

}


export { RenderFactory }; 