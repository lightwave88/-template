////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
import { TagTools } from './module/tools_1c1.js'
import { OutputModuleClass } from './module/output_1.js';
import { getMethodModule } from './module/methods_1.js';

const $getMethodModule = getMethodModule;


const $template = (function () {

    // 可被擴增
    const $add_outputModules = {};
    
    // 可被擴增
    const $add_methodModules = {};


    const $template = function (content) {
        debugger;

        let m = new GetRenderFn(content);
        let res;

        // let res = m.fnCommand;
        // console.log(res);
        // console.log(JSON.stringify(m.SCRIPTS));

        res = m.getFn();

        return res;
    };
    //--------------------------------------------------------------------------
    // $template 類別函式

    (function () {
        // for test

        // <% %> 與 <script type="text/_"> 互換
        $template.transform = function (content, options) {

        };

        $template.TagTools = TagTools;

        // 模板相關設定值
        $template.settings = {};

        // 可擴充 output 功能
        $template.addOutput = function () {

        };

        // 擴充一般功能
        $template.addMethods = function () {

        };

    })();
    //--------------------------------------------------------------------------

    class GetRenderFn {
        // content: 要解析的 str
        // options: 解析的選項
        constructor(content) {
            // 特殊作用
            // this.SCRIPTS = [];

            this.fnCommand = '';

            // 分析文本
            this.nodeList = TagTools.findCommandTag(content);

            this._getFnCommand();

            // console.log(this.fnCommand);
        }
        //------------------------------------------------
        getFn() {

            const $this = this;


            const outputModule = $this._getOutputModule();
            const methodModule = $this._getMethodModule();


            let command = '';


            debugger;


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

            //----------------------------
            // 主要返回的模板製造函式
            const fn = (function (fnContent, outputModule, methodModule, data, context) {
                debugger;
                'use strict';

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

            }).bind({}, this.fnCommand, outputModule, methodModule);

            //-----------------------

            fn.source = this.fnCommand;
            fn.nodeList = this.nodeList;

            return fn;
        }
        //------------------------------------------------
        _getFnCommand() {

            if (!Array.isArray(this.nodeList)) {
                return;
            }

            this.nodeList.forEach(function (node) {
                // this.fnCommand += node.printCommand(this.SCRIPTS);
                this.fnCommand += node.printCommand();
            }, this);
        }
        //------------------------------------------------

        // 模板背後的輸出功能模組
        // 核心
        // 通常不會用到
        _getOutputModule() {
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
        _getMethodModule() {
            const methodM = $getMethodModule();

            for (let k in $add_methodModules) {
                let v = $add_methodModules[k];
                methodM[k] = v;
            }
            return methodM;
        }
    }

    //==========================================================================


    return $template;
})();

export { $template };
