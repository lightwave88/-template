import { TagTools } from './module/tools_1c1.js'
////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////

const $template = (function () {

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

    (function ($self) {
        // for test

        // <% %> 與 <script type="text/_"> 互換
        $self.transform = function (content, options) {

        };

        $self.TagTools = TagTools;

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
            // 特殊作用
            this.SCRIPTS = [];

            this.fnCommand = '';

            // 分析文本
            this.nodeList = TagTools.findCommandTag(content);

            this._getFnCommand();

            // console.log(this.fnCommand);
        }
        //------------------------------------------------
        _getFnCommand() {

            if (!Array.isArray(this.nodeList)) {
                return;
            }

            this.nodeList.forEach(function (node) {
                this.fnCommand += node.printCommand(this.SCRIPTS);
            }, this);
        }
        //------------------------------------------------
        getFn() {

            const $this = this;

            // 主要返回的模板製造函式
            const fn = (function (functionStr, data, context) {
                debugger;
                'use strict';

                // 取得功能模組
                const module = $this._getModule();

                // 要被聲稱的變數
                let variables = '';

                if (context == null) {
                    context = {};
                }
                //----------------------------
                // 把 module 功能附加到 template 上

                for (let k in module) {
                    variables += `const ${k} = M["${k}"];\n`;
                }
                //----------------------------
                // 把 data 附加到 template 上
                if (data == null) {
                    data = {};
                }
                //----------------------------
                // 函式內容
                let fnContent = `
                        'use strict'
                        debugger;

                        const D = {};
                        Object.assign(D, data);
                        data = undefined;
                        
                        const M = module;
                        module = undefined;

                        const SCRIPTS = scripts;
                        scripts = undefined;

                        //------------------
                        ${variables}

                        //------------------
                        ${functionStr}

                        return (M.contentList.join(''));\n`;
                //----------------------------
                let fun;
                try {
                    debugger;
                    fun = new Function('module', 'scripts', 'data', fnContent);
                } catch (error) {
                    console.log(fnContent);
                    throw new Error(`build template error(${String(error)})`);
                }
                //----------------------------
                let htmlContent = '';

                try {
                    htmlContent = fun.call(context, module, $this.SCRIPTS, data);
                } catch (error) {
                    throw new Error(`run template error(${String(error)}) => (${fun.toString()})`);
                }
                return htmlContent;

            }).bind({}, this.fnCommand);

            //-----------------------

            fn.source = this.fnCommand;
            fn.nodeList = this.nodeList;

            return fn;
        }
        //------------------------------------------------
        // 模板背後的功能模組
        // print(), escape()
        _getModule() {
            const module = {};



            Object.defineProperty(module, 'contentList', {
                enumerable: false,
                writable: false,
                configurable: false,
                value: []
            });

            // 對外公布添加文字的方法
            const pushMethod = (function (text) {
                this.contentList.push(text);
            }).bind(module);


            // 重要對外函式
            /*
            Object.defineProperty(module, 'push', {
                enumerable: false,
                writable: false,
                configurable: false,
                value: pushMethod
            });
            */
            //-----------------------
            // 把預設的函式考上去
            for (let k in $templateInnerModule) {
                let v = $templateInnerModule[k];
                if (typeof (v) != 'function') {
                    continue;
                }
                module[k] = function () {
                    'use strict';
                    let args = Array.from(arguments);
                    args.unshift(pushMethod);
                    let res = v.apply(module, args);

                    return res;
                };
                v.bind(module);
            }
            //-----------------------

            // 把使用者加入的函式也考上去
            for (let k in $template.addOn) {

                if (k in module) {
                    throw new Error(`${k} has in module`);
                }

                let v = $template.addOn[k];
                if (typeof (v) != 'function') {
                    continue;
                }
                module[k] = function () {
                    'use strict';
                    let args = Array.from(arguments);
                    args.unshift(pushMethod);
                    let res = v.apply(module, args);

                    return res;
                };
            }

            return module;
        }
    }
    //==========================================================================
    // 紀錄可在模板內使用的 函式
    const $templateInnerModule = {};

    (function ($self) {

        //------------------------------------------------
        // 最基本命令
        $self.print = function (push, html) {
            // 一定要實作這
            push(html);
        };
        //------------------------------------------------
        // 最基本命令
        $self.escape = function (push, html) {
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
            push(html);
        };
        //------------------------------------------------
        $self.stringify = function (push, obj) {
            debugger;
            let html;
            try {
                html = JSON.stringify(obj);
            } catch (error) {
                html = error + "";
            }

            return html;
        };

    })($templateInnerModule);

    return $template;
})();

export { $template };
