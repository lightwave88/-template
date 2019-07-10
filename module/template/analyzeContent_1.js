
// 從文本解析出 tag
import { TagTools } from './tagTools_3.js';

// output 模組
import { OutputModuleClass } from './output_1.js';

// 應用函式模組
import { M } from './functions_1.js';

import { TemplateFilter } from './filter_1.js';



class AnalyzeContent {

    constructor(content, options) {
        options = options || {};

        this.fnCommand;

        this.content = content;

        this.options = {
            async: false
        };

        Object.assign(this.options, options);

        // 分析文本
        this.nodeList = TagTools.findCommandTag(content);

    }
    //------------------------------------------------
    getFn() {
        debugger;

        this.fnCommand = this.getFnCommand();

        let fnCommand = this.fnCommand;
        let nodeList = this.nodeList;
        const F = TemplateFilter;

        debugger;
        //----------------------------
        // 主要返回的模板製造函式
        const fn = (function ($this, fnContent, data, context) {
            debugger;
            'use strict';

            const outputModule = AnalyzeContent.getOutputModule($this);
            const funModule = AnalyzeContent.getFunModule();

            // 取得功能模組

            if (context == null) {
                context = {};
            }
            //----------------------------
            // 把 data 附加到 template 上
            if (data == null) {
                data = {};
            }
            //----------------------------
            let fun;
            try {
                debugger;
                fun = new Function('outputModule', 'funModule', 'data', 'filter', fnContent);
            } catch (error) {
                console.log(fnContent);
                throw new Error(`build template error(${String(error)})`);
            }
            //----------------------------
            let htmlContent = '';

            try {
                htmlContent = fun.call(context, outputModule, funModule, data, F);
            } catch (error) {
                throw new Error(`run template error(${String(error)}) => (${fun.toString()})`);
            }
            return htmlContent;

        }).bind({}, this, fnCommand);

        //-----------------------

        fn.source = fnCommand;

        // for test
        fn.nodeList = nodeList.slice();

        this.nodeList = undefined;

        return fn;
    }
    //------------------------------------------------

    getFnCommand() {
        debugger;

        let async = !!this.options.async;

        if (!Array.isArray(this.nodeList)) {
            return this.fnCommand;
        }

        let fnCommand = '';

        // 困難地方
        this.nodeList.forEach(function (node) {
            // this.fnCommand += node.printCommand(this.SCRIPTS);
            fnCommand += node.printCommand();
        }, this);


        if (async === true) {
            fnCommand = `
            'use strict'

            debugger;
            
            //------------------ 
            const D = data;
            data = undefined;

            const Out = outputModule;
            outputModule = undefined;
            //------------------
            const M = funModule;
            funModule = undefined;

            //------------------
            const F = filter;
            filter = undefined;
            //------------------
            return (async function(){
                'use strict'

                //------------------
                ${fnCommand}
                //------------------

                return (Out.result());\n;
            }).call(this)`;


        } else {
            fnCommand = `
            'use strict'
            debugger;

            
            //------------------ 
            const D = data;
            data = undefined;

            const Out = outputModule;
            outputModule = undefined;
             //------------------
            const M = funModule;
            funModule = undefined;
            //------------------            
            const F = filter;
            filter = undefined;
            //------------------
            ${fnCommand}
            //------------------

            return (Out.result());\n`;
        }

        return fnCommand;
    }
    //------------------------------------------------

    // 模板背後的輸出功能模組
    // 核心    
    static getOutputModule(analyzeContent) {
        const out_addOnModules = OutputModuleClass.addOn_modules;

        const output = new OutputModuleClass(analyzeContent);

        // 把使用者預設的函式考上去
        for (let k in out_addOnModules) {
            if (k in output) {
                throw new Error(`${k} has in outputModules`);
            }
            let v = out_addOnModules[k];

            output[k] = function () {
                let res = v.apply(output, arguments);
                output.push(res);
            };
        }
        //-----------------------
        return output;
    }
    //------------------------------------------------
    // 一般方法的擴充
    // 任何型別都可以
    static getFunModule() {
        let m = {};

        Object.assign(m, M);

        return m;
    }
    //------------------------------------------------

}

export { AnalyzeContent };
