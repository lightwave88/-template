// 要匯出的 funList
const identifyTagMethod = {};


////////////////////////////////////////////////////////////////////////////////
//
// 下面是是辨識 commandTag 的方法
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

    // main
    check() {
        throw new Error('need override');
    }

    _getNode() {
        throw new Error('need override');
    }
}
//==============================================================================


const IsScript = (function () {
    let checkReg_1 = /<\/script>/;

    class IsScript extends IsTag {

        // tagHead: 指定的標籤頭
        // tagFoot: 指定的標籤尾
        constructor(head, body) {
            super(head, body);

            this.foot = '</script>';
            this.checkReg_1 = checkReg_1;
        }
        //--------------------------------------
        get reg() {

        }
        //--------------------------------------
        _getCheckReg() {
            return /<\/script>/;
        }
        //--------------------------------------
        check() {
            // debugger;

            const rValue = {
                remain: undefined,
                find: false,
                hasChecked: undefined,
                nodes: undefined
            };

            let res = this._findEnd_1();


            if (!res) {
                rValue.hasChecked = this.body;
                rValue.remain = '';

                return rValue;
            }

            res = this._findEnd_2();

            if (res.find) {
                // 找到尾

                rValue.remain = res.remain;
                rValue.find = true;
                rValue.nodes = res.nodes;
            } else {
                // 沒找到尾
                rValue.hasChecked = this.head + res.hasChecked;
                rValue.remain = '';
            }

            return rValue;
        }
        //----------------------------------------------------------------------
        _findEnd_1() {

            if (/^>/.test(this.body)) {
                this.head += RegExp.lastMatch;
                this.body = RegExp.rightContext;
                return true;
            }

            let reg = /[^%]>/;
            let res = reg.exec(this.body);

            if (res != null) {
                this.head += RegExp.leftContext + RegExp.lastMatch;
                this.body = RegExp.rightContext;
                return true;
            }

            return false;
        }
        //--------------------------------------
        _findEnd_2() {
            // debugger;

            let content = this.body;

            const rValue = {
                remain: undefined,
                find: false,
                hasChecked: undefined,
                nodes: undefined
            };

            let copyContent = content;

            // 最重要是(this.checkReg_1)
            if (this.checkReg_1.test(content)) {
                // debugger;
                rValue.find = true;

                rValue.remain = RegExp.rightContext;
                this.textContent = RegExp.leftContext;
                this.foot = RegExp.lastMatch;

                rValue.nodes = this._getNode();
                return rValue;
            }

            rValue.hasChecked = copyContent;
            return rValue;
        }
        //--------------------------------------
        // 比較麻煩的地方
        _getNode() {
            // debugger;

            const nodeList = [];

            const s_head = this.head;
            const s_context = this.textContent;
            const s_foot = this.foot;

            let node;

            let reg = /\sclass=(["'])_\1)/;
            let isCommand = reg.test(s_head);

            if (isCommand) {
                node = new CommandNode('script', s_head, s_context);
                nodeList.push(node);

                return nodeList;
            }
            //-----------------------
            // 若不是 command 那就是 一般<script>

            // 處理 context
            if (!G.analyzeScript) {
                // script 不用經過模板解析
                // 少用且速度較快

                let content = s_head + s_context + s_foot;
                node = new ScriptPartNode(content, false);
                nodeList.push(node);
            } else {
                // script 要經過模板解析(暫時不用這)

                // 處理 head
                this._aboutTagHead(nodeList, s_head);

                // 處理 body + footer
                this._aboutTagContext(nodeList, (s_context + s_foot));
            }

            return nodeList;
        }
        //----------------------------------------------------------------------
        _aboutTagHead(nodeList, head) {
            this._findCommad(nodeList, head, true);
        }
        //----------------------------------------------------------------------
        // 若使用者想在 <script>使用模板
        _aboutTagContext(nodeList, content) {
            this._findCommad(nodeList, content, false);

        }
        //----------------------------------------------------------------------
        // 分離(文字)(命令)
        // isContext: 現在檢查的內容是否是內文
        // 若是內文則輸出的格式要改變
        _findCommad(nodeList, context, isTag) {
            // debugger;

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

                let methodClass = identifyTagMethod[tagName];
                if (methodClass == null) {
                    throw new Error(`tag(${tagName}) no find solution`);
                }

                if (G.commandTagName == null) {
                    G.commandTagName = tagName.substr(0, 2);
                    reg_1 = this._getReg_1();
                }

                let method = new methodClass(match, remain);
                let r = method.check();
                //-----------------------
                // debugger;
                // 是否有找到尾是正確的 tag

                if (r.find) {

                    if (checked) {
                        node = new ScriptPartNode(checked, isTag);

                        nodeList.push(node);
                        checked = '';
                    }

                    let nodes = r.nodes;

                    if (!Array.isArray(nodes)) {
                        throw new TypeError('tagMethod must be return []');
                    }
                    nodeList = nodeList.concat(nodes);

                    context = r.remain;
                } else {
                    checked += res.hasChecked;
                    context = res.remain;
                }
            }
            //-----------------------
            let final = '' + checked + context;

            if (final) {
                node = new ScriptPartNode(final, isTag);
                // debugger;

                nodeList.push(node);
            }
        }

        //----------------------------------------------------------------------
        _getReg_1() {
            let reg;

            if (G.commandTagName != null) {
                if (/\(%/.test(G.commandTagName)) {
                    reg = /(\(%[-=]?)(?=\s)/;
                } else {
                    reg = /(<%[-=]?)(?=\s)/;
                }
            } else {
                reg = /(\(%[-=]?|<%[-=]?)(?=\s)/;
            }
            return reg;
        }
    }

    identifyTagMethod['script'] = IsScript;

    return IsScript;
})();


//==============================================================================
// <% %>
const IsCommand_1 = (function () {

    let CheckReg_1;


    class IsCommand_1 extends IsTag {
        // <%[-=]? %>

        constructor(head, body) {
            super(head, body);

            if (CheckReg_1 == null) {
                CheckReg_1 = this._getCheckReg(/(\s%>)/, false);
            }
            this.checkReg_1 = CheckReg_1;

            this.checkReg_2 = /\binclude\(['"][\s\S]*?\1\)[;\b]/;
        }
        //--------------------------------------
        get reg() {

        }
        //--------------------------------------
        _getCheckReg(endTag) {
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
            list.push(/(?:\/\/[\s\S]*?(?:\n|\r))/);

            // 捕捉 /* */
            list.push(/(?:\/\*[\s\S]*?\*\/)/);

            // 捕捉 include()
            list.push(/(?:\binclude\([\s\S]*?\)[\b;])/);

            list.push(endTag);
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
            // debugger;

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
        _findEnd(content) {
            // debugger;

            const rValue = {
                remain: undefined,
                find: false,
                hasChecked: undefined,
                nodes: undefined
            };

            let hasChecked;

            //  記錄有包含 include() 的區塊
            let includes = [];

            let rgRes;
            while ((rgRes = this.checkReg_1.exec(content)) != null) {
                // debugger;

                // 之前檢查過的所有字數
                // let prevWordCount = hasChecked.length;

                let match = RegExp.lastMatch;
                let rightContext = RegExp.rightContext;
                let leftContext = RegExp.leftContext;

                hasChecked = (hasChecked || '');
                hasChecked += leftContext;

                if (rgRes[2] != null) {
                    // debugger;
                    // 找到了結尾
                    rValue.remain = rightContext
                    rValue.find = true;
                    //-------------
                    this.foot = rgRes[2];
                    this.textContent = hasChecked;

                    rValue.nodes = this._getNode(includes);

                    return rValue;
                } else if (rgRes[1] != null) {
                    // 找到 include() 命令
                    let s = hasChecked.length;
                    let e = s + match.length - 1;
                    let url = this._getIncludeUrl(match);

                    includes.push({
                        s: s,
                        e: e,
                        url: url
                    });
                }

                hasChecked += match;
                content = rightContext;
            }
            //-----------------------
            // 都沒找到
            // 這裡影響速度

            rValue.hasChecked = this.head + this.body;
            rValue.remain = '';

            return rValue;
        }
        //--------------------------------------
        _getNode(includes) {
            let node = new CommandNode(this.head, this.head, this.textContent, includes);
            return [node];
        }
        //--------------------------------------
        _getIncludeUrl(text){
            let res;

            res = text.replace(/^[\s\S]*?['"]/, "");
            res = res.replace(/['"][\s\S]*$/, "");
            return res;
        }
    }

    identifyTagMethod['<%'] = IsCommand_1;
    identifyTagMethod['<%-'] = IsCommand_1;
    identifyTagMethod['<%='] = IsCommand_1;

    return IsCommand_1;
})();
//==============================================================================
const IsCommand_2 = (function () {

    let CheckReg_1;
    // let CheckReg_2;

    class IsCommand_2 extends IsCommand_1 {
        // (%[-=]? %)

        constructor(head, body) {
            // debugger;
            super(head, body);
            this.tagEnd = '%)';


            if (CheckReg_1 == null) {
                CheckReg_1 = this._getCheckReg(/(\s%\))/, false);
            }
            this.checkReg_1 = CheckReg_1;
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

    identifyTagMethod['(%'] = IsCommand_2;
    identifyTagMethod['(%-'] = IsCommand_2;
    identifyTagMethod['(%='] = IsCommand_2;

    return IsCommand_2;
})();

//==============================================================================
export { identifyTagMethod };
