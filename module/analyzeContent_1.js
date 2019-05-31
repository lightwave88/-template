import { TagTools } from './tagTools_1.js';
import { OutputModuleClass, add_outputModules } from './output_1.js';
import { getMethodModule, add_methodModules } from './methods_1.js';

const $add_outputModules = add_outputModules;
const $add_methodModules = add_methodModules;

class AnalyzeContent {

    constructor(content, options) {
        options = options || {};

        this.content = content;

        this.options = {
            async: false
        };

        Object.assign(this.options, options);

        // 分析文本
        this.nodeList = TagTools.findCommandTag(content);

        this.fnCommand;
    }
    //------------------------------------------------
    getFn() {
        debugger;

        this.getFnCommand();
        
        let fnCommand = this.fnCommand;
        let nodeList = this.nodeList;

        debugger;
        //----------------------------
        // 主要返回的模板製造函式
        const fn = (function ($this, fnContent, data, context) {
            debugger;
            'use strict';

            const outputModule = AnalyzeContent.getOutputModule();
            const methodModule = AnalyzeContent.getMethodModule();

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
                fun = new Function('outputModule', 'methodModule', 'data', fnContent);
            } catch (error) {
                console.log(fnContent);
                throw new Error(`build template error(${String(error)})`);
            }
            //----------------------------
            let htmlContent = '';

            try {
                htmlContent = fun.call(context, outputModule, methodModule, data);
            } catch (error) {
                throw new Error(`run template error(${String(error)}) => (${fun.toString()})`);
            }
            return htmlContent;

        }).bind({}, this, fnCommand);

        //-----------------------

        fn.source = fnCommand;
        fn.nodeList = nodeList;

        return fn;
    }
    //------------------------------------------------

    getFnCommand() {
        debugger;

        let async = !!this.options.async;

        if (!Array.isArray(this.nodeList)) {
            return this.fnCommand;
        }

        this.fnCommand = '';

        this.nodeList.forEach(function (node) {
            // this.fnCommand += node.printCommand(this.SCRIPTS);
            this.fnCommand += node.printCommand();
        }, this);


        if (async === true) {
            this.fnCommand = `
            'use strict'
            
            debugger;

            const D = data;
            data = undefined;

            const Out = outputModule;
            outputModule = undefined;
            //------------------
            const M = methodModule;
            methodModule = undefined;
            
            return (async function(){
                'use strict'

                //------------------
                ${this.fnCommand}
                //------------------
    
                return (Out.result());\n;
            }).call(this)`;


        } else {
            this.fnCommand = `
            'use strict'
            debugger;

            const D = data;
            data = undefined;

            const Out = outputModule;
            outputModule = undefined;
            //------------------
            const M = methodModule;
            methodModule = undefined;
            //------------------
            ${this.fnCommand}
            //------------------

            return (Out.result());\n`;
        }
        
        return this.fnCommand;
    }
    //------------------------------------------------

    // 模板背後的輸出功能模組
    // 核心
    // 通常不會用到
    static getOutputModule() {
        const output = new OutputModuleClass();

        // 把使用者預設的函式考上去
        for (let k in $add_outputModules) {
            if (k in output) {
                throw new Error(`${k} has in outputModules`);
            }
            let v = $add_outputModules[k];

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
    //
    static getMethodModule() {
        const methodM = getMethodModule();

        for (let k in $add_methodModules) {
            let v = $add_methodModules[k];
            methodM[k] = v;
        }
        return methodM;
    }

    //------------------------------------------------   
    
}

export { AnalyzeContent };
