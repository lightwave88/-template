////////////////////////////////////////////////////////////////////////////////
//
// 搜尋 tag 工具(為獨立模組)
//
// TagTools.findCommandTag()為對外命令
//
////////////////////////////////////////////////////////////////////////////////

import { NodeClass } from './node_1c.js';
const NormalNode = NodeClass['NormalNode'];
const ScriptPartNode = NodeClass['ScriptPartNode'];
const CommandNode = NodeClass['CommandNode'];
//------------------------------------------------

const TagTools = class {
}

export { TagTools };

(function () {
    // 找尋各種 tag 的方法
    // 用 tagName 做 key
    TagTools.identifyTagMethod = {};

})();

//---------------------------------

const G = {
    // 是否要解析 <script>裡面的指令
    analyzeScript: false,
    // 命令標籤名稱是哪一個[<%, (%]
    // 減少運算
    commandTagName: null,
};


(function () {
    // 從文本分離出 commandTag

    // analyzeScript 是否要在 script 標籤內使用命令
    // 速度會變慢
    TagTools.findCommandTag = function (content, analyzeScript) {
        debugger;

        G.analyzeScript = !!analyzeScript;

        let nodeList = [];

        while (content) {
            debugger;

            // 找到 target 一次一個
            // res要返回 nodeList
            // 返回 remain
            let res = _findCommandTag(content);

            debugger;

            let find = res.find;
            let nodes = res.nodeList;
            let remain = res.remain || '';


            if (find) {
                if (Array.isArray(nodes)) {
                    nodeList = nodeList.concat(nodes);
                }
                content = remain;
            } else {
                let hasChecked = res.hasChecked || '';
                let nodeContent = hasChecked + remain;

                if (nodeContent) {
                    let node = new NormalNode(content);
                    nodeList.push(node);
                }
                break;
            }
        }
        //-----------------------
        return nodeList;
    }

    //--------------------------------------------------------------------------
    // 找到 target 一次一個
    // res要返回 nodeList
    // 返回 remain
    // rValue: 回傳值
    function _findCommandTag(content) {
        // debugger;

        const rValue = {
            nodeList: null,
            find: false,
            remain: '',
            hasChecked: null,
        };

        let mainReg = _getReg_1();

        let res;
        let hasChecked;

        // 先找尋可能的 taghead
        while ((res = mainReg.exec(content)) != null) {
            debugger;

            hasChecked = (hasChecked || '');
            hasChecked += RegExp.leftContext;

            let tagHead = RegExp.lastMatch;
            let remain = RegExp.rightContext;

            //-----------------------
            let tagName = res[2] || res[3] || null;

            if (tagName) {
                // (%, <% 標籤

                if (G.commandTagName == null) {
                    G.commandTagName = tagName.substr(0, 2);
                    mainReg = _getReg_1();
                }
            } else {
                // <script> 標籤
                tagName = res[1] || null;
            }
            //-----------------------
            let methodClass = TagTools.identifyTagMethod[tagName];
            if (methodClass == null) {
                throw new Error(`(${tagName}) no support method`);
            }

            // 找標籤所屬的尾
            let method = new methodClass(tagHead, remain);
            let _res = method.check();

            debugger;
            let find = _res.find;

            if (find) {
                remain = _res.remain;
                let nodes = _res.nodes;

                if (!Array.isArray(nodes)) {
                    nodes = [nodes];
                }

                if (hasChecked) {
                    nodes.unshift(hasChecked);
                }

                rValue.find = true;
                rValue.nodeList = _getNodeList(nodes);
                rValue.remain = remain;
                return rValue;
            }
            //------------------
            hasChecked += res.hasChecked;
            content = res.remain;
        } // while end
        //-----------------------
        // 都沒找到

        rValue.hasChecked = content;
        return rValue;
    }
    //--------------------------------------------------------------------------
    // 標籤頭的規則
    // 根據 G.commandTagName 傳回不同的 Reg
    function _getReg_1() {
        debugger;

        const commandTagName = G.commandTagName;

        let mainReg;

        let reg_1 = /(\(%[-=]?)/;
        let reg_2 = /(<%[-=]?)/;
        let reg_3 = /<(script)(?:>|\s[\s\S]*?[^%]>)/;

        if (commandTagName != null) {

            let headTag;

            if (/^\(%/.test(commandTagName)) {
                headTag = reg_1;
            } else if (/^<%/.test(commandTagName)) {
                headTag = reg_2;
            } else {
                throw new TypeError(`error tagName(${commandTagName})`);
            }
            //-----------------------

            mainReg = RegExp(`${reg_3.source}|${headTag.source}`);
        } else {
            mainReg = RegExp(`${reg_3.source}|${reg_1.source}|${reg_2.source}`);
        }

        return mainReg;
    }
    //--------------------------------------------------------------------------

    function _getNodeList(list) {

        return (list.map(function (node) {
            let res = node;

            if (typeof (node) == 'string') {
                res = new NormalNode(node);
            }

            return res;
        }));

    }
})();

////////////////////////////////////////////////////////////////////////////////
//
// 下面是是辨識 tag 的方法
// 給予一段標頭,與之後的文字內容
// 判別是否有目標,並提取
//
////////////////////////////////////////////////////////////////////////////////

class IsTag {
    constructor(head, body) {
        this.body = body;

        this.head = head;
        this.html;
        this.foot;
        this.textContent;
    }

    check() {
        throw new Error('need override');
    }

    _getNode() {
        throw new Error('need override');
    }
}
//==============================================================================
// 辨別是否是 script 的方法

const IsScript = (function () {
    let checkReg;

    class IsScript extends IsTag {

        // tagHead: 指定的標籤頭
        // tagFoot: 指定的標籤尾
        constructor(head, body) {
            super(head, body);

            this.foot = '</script>';

            if (checkReg == null) {
                checkReg = this._getCheckReg();
            }

            this.checkReg = checkReg;
        }
        //--------------------------------------
        get reg() {
            return /((?:<\/[a-z][^\s>/]{0,}>)|(?:<[a-z][^\s>/]{0,}[^%]>)|(?:<[a-z][^\s>/]{0,}\s[\s\S]*?[^%]>))/;
        }
        //------- --------------------------------------------------------------
        _getCheckReg() {
            // debugger;

            let list = [];
            let reg;

            // 捕捉 ``
            list.push(/(?:[`][\s\S]*?[^\\][`])/);

            // 捕捉 ''
            list.push(/(?:['][\s\S]*?[^\\]['])/);

            // 捕捉 ""
            list.push(/(?:["][\s\S]*?[^\\]["])/);

            // 捕捉 // \n
            list.push(/(?:\/\/[\s\S]*?\n)/);

            // 捕捉 /* */
            list.push(/(?:\/\*[\s\S]*?\*\/)/);

            // 捕捉目標
            list.push(/(<\/script>)/);


            let list_1 = [];

            list.forEach(function (v, i) {
                list_1.push(v.source);
            });

            let str = list_1.join('|');
            // str = `(${str})`;

            // console.log(str);

            list = undefined;
            list_1 = undefined;

            reg = RegExp(str);

            return reg;
        }
        //--------------------------------------
        check() {
            const rValue = {
                remain: undefined,
                find: false,
                hasChecked: undefined,
                nodes: undefined
            };

            let res = this._findEnd(this.body);

            if (res.find) {
                // 找到尾

                rValue.remain = res.remain;
                rValue.find = true;
                rValue.nodes = res.nodes;
            } else {
                // 沒找到尾
                rValue.hasChecked = this.body;
                rValue.remain = '';
            }

            return rValue;
        }
        //----------------------------------------------------------------------
        _findEnd(content) {
            debugger;

            const rValue = {
                remain: undefined,
                find: false,
                content: undefined,
                hasChecked: undefined,
                nodes: undefined
            };

            let hasChecked;
            let copyContent = content;

            let rgRes;

            // 最重要是(this.checkReg)
            while ((rgRes = this.checkReg.exec(content)) != null) {
                debugger;

                hasChecked = (hasChecked || '');
                hasChecked += RegExp.leftContext;

                if (rgRes[1] != null) {
                    // 找到了結尾
                    rValue.remain = RegExp.rightContext;
                    rValue.find = true;

                    this.textContent = hasChecked;
                    this.foot = rgRes[1];

                    rValue.nodes = this._getNode();
                    return rValue;
                }

                hasChecked += RegExp.lastMatch;
                content = RegExp.rightContext;
            }
            //-----------------------
            return rValue;
        }
        //--------------------------------------
        // 比較麻煩的地方
        _getNode() {
            debugger;

            const nodeList = [];

            const s_head = this.head;
            const s_context = this.textContent;
            const s_foot = this.foot;

            let node;

            let isCommand;
            // isCommand = /\stype=(["'])text\/(?:_|javascript)\1/.test(s_head);
            isCommand = /\s(?:type=(["'])text\/_\1|class=(["'])_\2)/;

            if (isCommand) {
                node = new CommandNode('script', s_head, s_context);
                nodeList.push(node);

                return nodeList;
            }
            //-----------------------
            // 若不是 command 那就是 一般<script>


            // 處理 head
            this._aboutTagHead(nodeList, s_head);

            //-----------------------
            // 處理 context
            if (!G.analyzeScript) {
                // script 不用經過模板解析
                // 少用且速度較快
                node = new ScriptPartNode(s_context + s_foot);
                nodeList.push(node);
            } else {
                // script 要經過模板解析
                this._aboutTagContext(nodeList, (s_context + s_foot));
            }

            return nodeList;
        }
        //----------------------------------------------------------------------
        _aboutTagHead(nodeList, head) {
            this._findCommad(nodeList, head);
        }
        //----------------------------------------------------------------------
        // 若使用者想在 <script>使用模板
        _aboutTagContext(nodeList, content) {
            this._findCommad(nodeList, content, true);

        }
        //----------------------------------------------------------------------
        // 分離(文字)(命令)
        // isContext: 現在檢查的內容是否是內文
        // 若是內文則輸出的格式要改變
        _findCommad(nodeList, context, isContext) {
            debugger;

            let reg_1 = this._getReg_1();

            let res;
            let checked = '';
            let node;

            let contextSource = context;

            while ((res = reg_1.exec(context)) != null) {

                let hasChecked = RegExp.leftContext;
                let match = RegExp.lastMatch;
                let remain = RegExp.rightContext;

                checked += hasChecked;

                let tagName = res[1] || res[2] || null;

                let methodClass = TagTools.identifyTagMethod[tagName];
                if (methodClass == null) {
                    throw new Error(`tag(${tagName}) no find solution`);
                }

                if (G.commandTagName == null) {
                    G.commandTagName = tagName.substr(0, 2);
                    reg_1 = this._getReg_1();
                }

                let method = new methodClass(match, remain);
                let r = method.check_1();
                //-----------------------
                debugger;
                // 是否有找到尾是正確的 tag

                if (r.find) {

                    if (checked) {
                        node = new ScriptPartNode(checked, isContext);

                        nodeList.push(node);
                        checked = '';
                    }

                    node = r.nodes;
                    nodeList.push(node);

                    context = r.remain;
                } else {
                    checked += res.hasChecked;
                    context = res.remain;
                }
            }
            //-----------------------
            let final = '' + checked + context;

            if (final) {
                node = new ScriptPartNode(final, isContext);
                debugger;

                nodeList.push(node);
            }
        }

        //----------------------------------------------------------------------
        _getReg_1() {
            let reg;

            if (G.commandTagName != null) {
                if (/\(%/.test(G.commandTagName)) {
                    reg = /(\(%[-=]?)/;
                } else {
                    reg = /(<%[-=]?)/;
                }
            } else {
                reg = /(\(%[-=]?)|(<%[-=]?)/;
            }
            return reg;
        }
    }

    TagTools.identifyTagMethod['script'] = IsScript;

    return IsScript;
})();


//==============================================================================
// <% %>
const IsCommand_1 = (function () {

    let CheckReg_1;
    let CheckReg_2;

    class IsCommand_1 extends IsTag {
        // <%[-=]? %>

        constructor(head, body) {
            super(head, body);

            if (CheckReg_1 == null) {
                CheckReg_1 = this._getCheckReg(/(%>)/, false);
            }
            this.checkReg_1 = CheckReg_1;


            if (CheckReg_2 == null) {
                CheckReg_2 = this._getCheckReg(/(%>)/, true);
            }
            this.checkReg_2 = CheckReg_2;
        }
        //--------------------------------------
        get reg() {
            return (/(?:[`][\s\S]*?[^\\][`])|(?:['][\s\S]*?[^\\]['])|(?:["][\s\S]*?[^\\]["])|(?:\/\/[\s\S]*?\n)|(?:\/\*[\s\S]*?\*\/)|(\s%>)/i);
        }
        //--------------------------------------
        _getCheckReg(endTag, IsScriptContext) {
            // debugger;

            let list = [];
            let reg;

            // 捕捉 ``
            list.push(/(?:[`][\s\S]*?[^\\][`])/);

            // 捕捉 ''
            list.push(/(?:['][\s\S]*?[^\\]['])/);

            // 捕捉 ""
            list.push(/(?:["][\s\S]*?[^\\]["])/);

            // 捕捉 // \n
            list.push(/(?:\/\/[\s\S]*?\n)/);

            // 捕捉 /* */
            list.push(/(?:\/\*[\s\S]*?\*\/)/);

            //-----------------------
            // 對 <%, (% 沒有正確關閉的一種折衷辦法
            // 希望可以提升速度

            // 捕捉目標
            list.push(endTag);
            //-----------------------
            if (!IsScriptContext) {
                let reg = /((?:<\/[a-z][^\s>/]*[^%]>)|(?:<[a-z][^\s>/]*[^%]>)|(?:<[a-z][^\s>/]*\s[\s\S]*?[^%]>))/;
                list.push(reg);
            }
            //-----------------------

            let list_1 = [];

            list.forEach(function (v, i) {
                list_1.push(v.source);
            });

            let str = list_1.join('|');

            list = undefined;
            list_1 = undefined;

            reg = RegExp(str, 'i');

            return reg;
        }
        //--------------------------------------
        check() {
            const rValue = {
                remain: undefined,
                find: false,
                hasChecked: undefined,
                nodes: undefined
            };

            let res = this._findEnd(this.body);

            if (res.find) {
                // 找到尾

                rValue.remain = res.remain;
                rValue.find = true;
                rValue.nodes = res.nodes;
            } else {
                rValue.hasChecked = res.hasChecked;

                // 有這項
                // 碰到比較奇怪的狀況
                rValue.remain = res.remain;
            }

            return rValue;
        }
        //--------------------------------------
        check_1() {
            const rValue = {
                remain: undefined,
                find: false,
                hasChecked: undefined,
                nodes: undefined
            };
            // 不同點
            let res = this._findEnd_1(this.body);

            if (res.find) {
                // 找到尾

                rValue.remain = res.remain;
                rValue.find = true;
                rValue.nodes = res.nodes;
            } else {
                rValue.hasChecked = res.hasChecked;

                // 有這項
                // 碰到比較奇怪的狀況
                rValue.remain = res.remain;
            }

            return rValue;
        }
        //--------------------------------------
        _findEnd(content) {
            debugger;

            const rValue = {
                remain: undefined,
                find: false,
                hasChecked: undefined,
                nodes: undefined
            };

            let hasChecked;
            let copyContent = content;

            let rgRes;


            while ((rgRes = this.checkReg_1.exec(content)) != null) {
                debugger;

                hasChecked = (hasChecked || '');
                hasChecked += RegExp.leftContext;

                let match = RegExp.lastMatch;

                if (rgRes[2] != null) {
                    // 確定是錯誤........
                    break;
                } else if (rgRes[1] != null) {
                    // debugger;
                    // 找到了結尾
                    rValue.remain = RegExp.rightContext;
                    rValue.find = true;
                    //-------------
                    this.foot = rgRes[1];
                    this.textContent = hasChecked;

                    rValue.nodes = this._getNode();

                    return rValue;
                }
                hasChecked += match;
                content = RegExp.rightContext;
            }
            //-----------------------
            // 都沒找到

            rValue.hasChecked = this.head;
            rValue.remain = this.body;

            return rValue;
        }
        //--------------------------------------
        _findEnd_1(content) {
            if (options == null) {
                options = 0;
            }

            const rValue = {
                remain: undefined,
                find: false,
                hasChecked: undefined,
                nodes: undefined
            };

            let hasChecked;
            let copyContent = content;

            let rgRes;


            while ((rgRes = this.checkReg_2.exec(content)) != null) {
                debugger;

                hasChecked = (hasChecked || '');
                hasChecked += RegExp.leftContext;

                let match = RegExp.lastMatch;

                if (rgRes[1] != null) {
                    // debugger;
                    // 找到了結尾
                    rValue.remain = RegExp.rightContext;
                    rValue.find = true;
                    //-------------
                    this.foot = rgRes[1];
                    this.textContent = hasChecked;

                    rValue.nodes = this._getNode();

                    return rValue;
                }
                hasChecked += match;
                content = RegExp.rightContext;
            }
            //-----------------------
            // 都沒找到

            rValue.hasChecked = copyContent;
            rValue.remain = '';

            return rValue;
        }
        //--------------------------------------
        _getNode() {
            let node = new CommandNode(this.head, this.head, this.textContent);
            return node;
        }
    }

    TagTools.identifyTagMethod['<%'] = IsCommand_1;
    TagTools.identifyTagMethod['<%-'] = IsCommand_1;
    TagTools.identifyTagMethod['<%='] = IsCommand_1;

    return IsCommand_1;
})();
//==============================================================================
const IsCommand_2 = (function () {

    let CheckReg_1;
    let CheckReg_2;

    class IsCommand_2 extends IsCommand_1 {
        // (%[-=]? %)

        constructor(head, body) {
            debugger;
            super(head, body);
            this.tagEnd = '%)';


            if (CheckReg_1 == null) {
                CheckReg_1 = this._getCheckReg(/(%\))/, false);
            }
            this.checkReg_1 = CheckReg_1;


            if (CheckReg_2 == null) {
                CheckReg_2 = this._getCheckReg(/(%\))/, true);
            }

            this.checkReg_2 = CheckReg_2;
        }
        //--------------------------------------
        check() {
            return super.check();
        }
        //--------------------------------------
        check_1() {
            return super.check_1();
        }
        //--------------------------------------
        _getNode() {
            return super._getNode();
        }
    }

    TagTools.identifyTagMethod['(%'] = IsCommand_2;
    TagTools.identifyTagMethod['(%-'] = IsCommand_2;
    TagTools.identifyTagMethod['(%='] = IsCommand_2;

    return IsCommand_2;
})();



//==============================================================================
