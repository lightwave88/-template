
// 從文本解析出 tag
import { TagTools } from './tagTools_3.js';

// output 模組
import { OutputModuleClass } from './output_2.js';

// 應用函式模組
import { FuntionModels } from './functions_2.js';

import { TemplateFilter } from './filter_2.js';

const InjectModules = {};


class AnalyzeEngine {

    constructor(content, options) {
        options = options || {};

        this.moduleName;

        this.fnCommand;
        //-----------------------
        // 引用三個模組

        this.outputModule;

        this.filterModule;

        this.functionModules;
        //-----------------------
        this.content;

        this.options = {
            async: false
        };

        this.path = {};

        this.includePath;

        this.pr;
        //-----------------------

        this._init();
    }
    //------------------------------------------------
    _init(content, options) {
        this.content = content;

        Object.assign(this.options, options);
    }
    //------------------------------------------------
    setPath(key, path) {
        this.path[key] = path;
    }
    //------------------------------------------------
    setIncludePath(path){
        this.includePath = path;
    }
    //------------------------------------------------
    setModule(){

    }
    //------------------------------------------------
    render(data, options) {
        const fn = this.getRenderFunction(content, moduleName);

        return fn(data);

    }
    //------------------------------------------------
    // content: 作用域的主人
    // moduleName: 要採用的模組分支
    getRenderFunction(options) {
        content = content || {};

        const core = new RenderFunctionCore(this, content, moduleName);

        return (function renderFun(core, data) {
            let res = core.main(data);
        }).bind({}, core);
    }
    //------------------------------------------------


}

export { AnalyzeEngine };
////////////////////////////////////////////////////////////////////////////////
//
//
// renderFunction 背後的處理著
//
////////////////////////////////////////////////////////////////////////////////
class RenderFunctionCore {
    constructor(engine, content, moduleName) {

        // 模板會用到的資料
        this.data;

        // 模板中會用到路徑資訊
        this.path;

        // 使用者選項
        this.options = {};

        // 作用域
        this.content = content || {};

        // 模板要用的模組名稱
        this.moduleName = moduleName || null;

        // 是否用非同步
        this.async;

        // include.rootPath
        this.includePath;
        //------------------
        this._init();
    }
    //----------------------------
    _init(engine) {

        Object.assign(this.options, engine.options);

        this.async = !!this.options.async;

        this.path = Object.assign({}, engine.path);
    }
    //----------------------------
    main(data) {
        this.data = data;

        this.getModules();

        if (this.async) {
            return this._main(data);
        } else {
            return thins._mainSync(data);
        }
    }
    //----------------------------
    async _main() {
        // 分析文本
        let nodeList = await this.getNodeList(content);

        // 把文本轉成函式
        let fnCommand = this.getCommand(nodeList);

        // 取得所需模组
        let modules = this.getModules();

        // 執行函式
        let res = await this.render(fnCommand, modules);

        return res;

    }

    _mainSync() {
        // 分析文本
        let nodeList = this.getNodeListSync(content);

        // 把文本轉成函式
        let fnCommand = this.getCommandSync(nodeList);

        // 取得所需模组
        let modules = this.getModules();

        // 執行函式
        let res = this.renderSync(fnCommand, modules);

        return res;
    }
    //----------------------------
    getNodeListSync() {
        const nodeList = TagTools.getCommandTag(content, false);
        return nodeList;
    }

    getNodeList() {
        const p = TagTools.getCommandTag(content, true);
        return p;
    }
    //----------------------------
    getCommandSync(nodeList) {

        let fnCommand = '';

        // 困難地方
        nodeList.forEach(function (node) {
            // this.fnCommand += node.printCommand(this.SCRIPTS);
            fnCommand += node.printCommand();
        }, this);


        fnCommand = `
            'use strict'
            debugger;

            //------------------
            const D = $$$data;
            $$$data = undefined;

            const Out = $$$outputModule;
            $$$outputModule = undefined;
             //------------------
            const Fun = $$$funModule;
            $$$funModule = undefined;
            //------------------
            const Filter = $$$filterModule;
            $$$filterModule = undefined;
            //------------------
            const Path = $$$pathData;
            $$$pathData = undefined;
            //------------------
            ${fnCommand}
            //------------------

            return (Out.result());\n`;


        return fnCommand;
    }

    getCommand(nodeList) {
        let fnCommand = '';

        // 困難地方
        nodeList.forEach(function (node) {
            // this.fnCommand += node.printCommand(this.SCRIPTS);
            fnCommand += node.printCommand();
        }, this);

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
                ${fnCommand}
                //------------------

                return (Out.result());\n;
            }).call(this)`;

        return fnCommand;
    }

    //----------------------------
    getModules() {
        let m = {
            output: null,
            filter: null,
            fun: null
        };


        return m;
    }
    //----------------------------
    renderSync(fnContent, modules) {

        debugger;


        const outputModule = modules['output'];
        const funModule = modules['fun'];
        const filterModule = modules['filter'];

        //----------------------------
        let fun;
        try {
            debugger;
            fun = new Function('$$$data', '$$$pathData', '$$$outputModule', '$$$funModule', '$$$filterModule', fnContent);
        } catch (error) {
            console.log(fnContent);
            throw new Error(`build template error(${String(error)})`);
        }
        //----------------------------
        let htmlContent = '';

        try {
            htmlContent = fun.call(this.content, this.data, this.path, outputModule, funModule, filterModule);
        } catch (error) {
            throw new Error(`run template error(${String(error)}) => (${fun.toString()})`);
        }
        return htmlContent;


    }

}
