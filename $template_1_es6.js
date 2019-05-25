import { TagTools } from './module/tools_1b.js'
////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////

const $template = (function () {

    const $template = function (content, mode) {
        debugger;

        let m = new GetRenderFn(content, mode);

        return m.fnCommand;
        // return m.getFn();
    };
    //--------------------------------------------------------------------------
    // $template 類別函式

    (function ($self) {
        // for test

        // <% %> 與 <script type="text/_"> 互換
        $self.transform = function (content, options) {

        };

        // 模板相關設定值
        // $template.settings
        Object.defineProperty($self, 'settings', {
            value: {},
            writable: false,
            configurable: false,
            enumerable: true,
        });

        // 可擴充模組內的可呼函式
        Object.defineProperty($self, 'addon', {
            value: {},
            writable: false,
            configurable: false,
            enumerable: true,
        });

    })($template);
    //--------------------------------------------------------------------------
    // $template.settings
    (function ($self) {
        $self.escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '`': '&#x60;'
        };
    })($template.settings);
    //--------------------------------------------------------------------------

    class GetRenderFn {
        // content: 要解析的 str
        // options: 解析的選項
        constructor(content) {
            this.fnCommand = '';

            // 分析文本
            this.nodeList = TagTools.findCommandTag(content);

            this._getFnCommand();

            console.log(this.fnCommand);
        }
        //------------------------------------------------
        _getFnCommand() {

            if (!Array.isArray(this.nodeList)) {
                return;
            }

            this.nodeList.forEach(function (node) {
                this.fnCommand += node.printCommand();
            }, this);
            // console.log(this.fnCommand);
        }
        //------------------------------------------------
        getFn() {

            const $this = this;

            // 主要返回的模板製造函式
            const fn = (function (functionStr, data, context) {
                debugger;
                'use strict';

                // 取得功能模組
                let module = $this._getModule();

                // 要被聲稱的變數
                let variables = '';

                if (context == null) {
                    context = {};
                }
                //----------------------------
                // 把 module 功能附加到 template 上

                for (let k in module) {
                    variables += `const ${k} = module["${k}"];\n`;
                }
                //----------------------------
                // 把 data 附加到 template 上
                if (data == null) {
                    data = {};
                }
                /*
                 for (let k in data) {
                 if (data.hasOwnProperty(k)) {
                 if (k in module) {
                 throw new TypeError(`data[${k}] has exist`);
                 }
                 variables += `let ${k} = data["${k}"];\n`;
                 }
                 }
                 */
                //----------------------------

                let fnContent = `
                        'use strict'

                        const data = {};
                        Object.assign(data, _data);
                        const $$$m = module;

                        debugger;
                        //------------------
                        ${variables}

                        _data = undefined;
                        module = undefined;
                        //------------------
                        ${functionStr}

                        return ($$$m.contentList.join(""));\n`;
                //----------------------------
                let fun;
                try {
                    debugger;
                    fun = new Function('module', '_data', fnContent);
                } catch (error) {
                    console.log(fnContent);
                    throw new Error(`build template error(${String(error)})`);
                }
                //----------------------------
                let htmlContent = '';
                try {
                    htmlContent = fun.call(context, module, data);
                } catch (error) {
                    throw new Error(`run template error(${String(error)}) => (${fun.toString()})`);
                }
                return htmlContent;

            }).bind({}, this.fnCommand);

            fn.source = this.fnCommand;
            // fn.nodeList = this.nodeList;

            return fn;
        }
        //------------------------------------------------
        // 模板背後的功能模組
        // print(), escape()
        _getModule() {
            const module = {};


            module.setPrototypeOf(module, 'contentList', {
                enumerable: false,
                writable: false,
                configurable: false,
                value: []
            });


            // 重要對外函式
            Object.setPrototypeOf(module, 'push', {
                enumerable: false,
                writable: false,
                configurable: false,
                value: function (text) {
                    this.contentList.push(text);
                }
            });

            // 把預設的函式考上去
            for (let k in $templateInnerModule) {
                let v = $templateInnerModule[k];
                if (typeof (v) == 'function') {
                    module[k] = v.bind(module);
                }
            }

            // 把使用者加入的函式也考上去
            for (let k in $template.addOn) {
                let v = $template.addOn[k];
                if (typeof (v) == 'function') {
                    module[k] = v.bind(module);
                }
            }

            return module;
        }
    }
    //==========================================================================
    // 紀錄可在模板內使用的 函式
    const $templateInnerModule = {};

    (function ($self) {

        function print(html) {
            if (html == null) {
                html = String(html);
            } else if (typeof (html) == "object") {
                html = JSON.stringify(html);
            } else {
                try {
                    html += "";
                } catch (error) {
                    html = "";
                }
            }
            return html;
        }
        //------------------------------------------------
        // 最基本命令
        $self.print = function (html) {
            html = print(html);
            // 一定要實作這
            this.push(html);
        };
        //------------------------------------------------
        // 最基本命令
        $self.escape = function (html) {
            html = print(html);
            if (_.escape != null) {
                html = _.escape(html);
            } else {
                const escapeMap = $template.settings.escapeMap;

                let source = Object.keys(escapeMap).join('|');
                source = `(?:${source})`;
                let reg = RegExp(source, 'g');
                html = html.replace(reg, function (m) {
                    return escapeMap[m];
                });
            }
            // 一定要實作這
            this.push(html);
        };


    })($templateInnerModule);

    return $template;
})();

export { $template };
