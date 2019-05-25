////////////////////////////////////////////////////////////////////////////////
//
// 搜尋 tag 工具
//
////////////////////////////////////////////////////////////////////////////////

import { NodeClass } from './node_1.js';
const NormalNode = NodeClass['NormalNode'];
const ScriptNode = NodeClass['ScriptNode'];
const CommandNode = NodeClass['CommandNode'];
//------------------------------------------------

const TagTools = class {
};

export { TagTools };

(function () {
    // 找尋各種 tag 的方法
    // 用 tagName 做 key
    TagTools.identifyTagMethod = {};

})();

//---------------------------------
(function () {

    TagTools.findCommandTag = function (content) {
        debugger;

        let nodeList = [];

        let tagName = _checkTagName(content);
        console.log('-------------------');

        while (content) {
            debugger;

            // console.log(content);

            // 專門找 <script>
            // 正常程序是先找出 tagHead
            let res;

            if (tagName == null) {
                res = _findDefaultScript(content);
            } else {
                res = _findScriptByAssignTag(content, tagName);
            }

            // console.dir(res);

            debugger;

            let node;

            if (res['hasChecked'] != null) {
                node = new NormalNode(res['hasChecked']);
                nodeList.push(node);
            }
            //-----------------------
            if (res['find']) {
                node = res['find'];
                nodeList.push(node);
                content = res['remain'];
            } else {
                break;
            }
        }

        return nodeList;
    }
    //--------------------------------------------------------------------------
    function _checkTagName(content) {
        // debugger;

        let tagName;

        let methodList = [];
        methodList.push(/(<%[-=]?)(\s+[\s\S]*?\s+|\s+)%>/g);
        methodList.push(/(\(%[-=]?)(\s+[\s\S]*?\s+|\s+)%\)/g);

        methodList.some(function (reg) {
            // debugger;

            let res;
            while ((res = reg.exec(content)) != null) {
                let commandContent = res[2] || '';

                if (/<[/]?(?:[a-z][^\s>/]{0,})(?:>|\s[\s\S]*?>)/.test(commandContent)) {
                    continue;
                }

                tagName = res[1];
                return true;
            }
        });

        methodList = undefined;

        return tagName;
    }
    //--------------------------------------------------------------------------
    /* 返回
     {
     hasChecked: undefined,
     find: false,
     remain: undefined
     }
     */
    function _findDefaultScript(content) {
        debugger;

        const rValue = {
            hasChecked: undefined,
            find: false,
            remain: undefined
        }
        //-----------------------
        // 先抓到標籤開頭
        // 抓到標籤名
        let res = /<script[\s>]/.exec(content);

        if (res == null) {
            // 沒找到 <script 開頭

            rValue['hasChecked'] = content;
            return rValue;
        }

        let hasChecked;
        // hasChecked = content.substring(0, res.index);
        hasChecked = RegExp.leftContext;
        content = RegExp.lastMatch + RegExp.rightContext;

        //-----------------------
        // 繼續追查是否是完整 <script> 標籤

        let methodClass = TagTools.identifyTagMethod['script'];
        if (methodClass == null) {
            throw new Error(`script no support method`);
        }

        let method = new methodClass(content);
        res = method.check();

        if (res['find']) {
            rValue['find'] = res['find'];
            rValue['hasChecked'] = hasChecked;
            rValue['remain'] = res['remain'];
        } else {
            rValue['hasChecked'] = content;
        }

        return rValue;
    }
    //--------------------------------------------------------------------------
    // rValue: 回傳值
    function _findScriptByAssignTag(content, tagName) {
        debugger;

        const rValue = {
            hasChecked: undefined,
            find: false,
            remain: undefined
        }
        //-----------------------
        let headTag;
        // let footTag;

        if (/^\(%/.test(tagName)) {
            // headTag = /(?:<!--[\s\S]*?-->)|\((%[-=]?)\s/;
            headTag = /\((%[-=]?)\s/;
        } else if (/^<%/.test(tagName)) {
            // headTag = /(?:<!--[\s\S]*?-->)|<(%[-=]?)\s/;
            headTag = /<(%[-=]?)\s/;
        } else {
            throw new TypeError(`error  tag(${tagName})`);
        }
        //-----------------------

        let methodClass = TagTools.identifyTagMethod[tagName];
        if (methodClass == null) {
            throw new Error(`script no support method`);
        }

        let res;
        let hasChecked;
        // let i = 0;

        while ((res = headTag.exec(content)) != null) {
            debugger;

            // console.log(RegExp.lastMatch)

            hasChecked = (hasChecked || '');
            hasChecked += RegExp.leftContext;

            if (res[1] == null) {
                // console.log('comment(%s)', RegExp.lastMatch);
                hasChecked += RegExp.lastMatch;
                content = RegExp.rightContext;
            } else {

                // 有抓到標籤開頭

                let _content = RegExp.lastMatch + RegExp.rightContext;

                let method = new methodClass(_content);
                // debugger;

                // return;

                res = method.check();

                debugger;

                if (res['find']) {
                    rValue['find'] = res['find'];
                    // rValue['hasChecked'] = hasChecked + (res['hasChecked'] || '');
                    rValue['hasChecked'] = hasChecked;
                    rValue['remain'] = res['remain'];

                    // console.log('find tag(%s)', res['hasChecked']);

                    return rValue;
                }

                hasChecked += (res['hasChecked'] || '');
                content = (res['remain'] || '');
            }
        } // while end
        //-----------------------
        // 都沒找到

        rValue['hasChecked'] = content;

        return rValue;
    }
})();


////////////////////////////////////////////////////////////////////////////////

class IsTag {
    constructor(source) {
        this.source = source;

        this.head;
        this.html;
        this.foot;
        this.textContent;

        this.rValue = {
            hasChecked: undefined,
            find: false,
            remain: undefined
        }
    }

    check() {
        throw new Error('need override');
    }
}
//==============================================================================
// 辨別是否是 script 的方法
class IsScript extends IsTag {

    // tagHead: 指定的標籤頭
    // tagFoot: 指定的標籤尾
    constructor(source) {
        super(source);

        this.foot = '</script>';
        this.checkReg = this._getCheckReg('</script>');
    }
    //--------------------------------------
    get reg() {
        let reg = /(?:[`][\s\S]*?[^\\][`])|(?:['][\s\S]*?[^\\]['])|(?:["][\s\S]*?[^\\]["])|(?:\/\/[\s\S]*?\n)|(?:\/\*[\s\S]*?\*\/)|(<\/script>)/;
        // capture_1: 目標
    }
    //------- -------------------------------
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
        list.push(/(?:\/\/[\s\S]*?\n)/);

        // 捕捉 /* */
        list.push(/(?:\/\*[\s\S]*?\*\/)/);

        // 捕捉目標

        if (endTag instanceof RegExp) {
            list.push(endTag);
        } else {
            reg = RegExp(`(${endTag})`);
            list.push(reg);
        }

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
        let res = this._findTagEnd(this.source);

        if (res['find']) {


            let remain = res['remain'];

            let res_1 = this._findScriptEnd(remain);

            if (res_1['find']) {
                // 找到尾

                this.rValue['remain'] = res_1['remain'];
                this.rValue['find'] = this._getNode();
            }
        }
        //-----------------------
        if (this.rValue['find'] == null) {
            this.rValue['hasChecked'] = this.source;
        }

        return this.rValue;
    }
    //--------------------------------------
    _findTagEnd(content) {
        // debugger;

        const rValue = {
            remain: undefined,
            find: false,
            hasChecked: undefined
        };
        //-----------------------
        let index = content.search(/>/);

        if (index < 0) {
            rValue['find'] = false;
            rValue['hasChecked'] = content;
        } else {
            rValue['find'] = true;
            rValue['remain'] = RegExp.rightContext;
            this.head = RegExp.leftContext + RegExp.lastMatch;
        }

        return rValue;
    }
    //--------------------------------------
    _findScriptEnd(content) {
        const rValue = {
            remain: undefined,
            find: false,
            content: undefined,
            hasChecked: undefined
        };

        let hasChecked;
        let copyContent = content;

        let rgRes;

        while ((rgRes = this.checkReg.exec(content)) != null) {
            // debugger;

            hasChecked = (hasChecked || '');
            // hasChecked += content.substring(0, index);
            hasChecked += RegExp.leftContext;

            if (rgRes[1] != null) {
                // 找到了結尾
                rValue['remain'] = RegExp.rightContext;
                rValue['find'] = true;

                let tagContent = hasChecked + rgRes[1];
                this._splitTag(tagContent);

                return rValue;
            }

            hasChecked += RegExp.lastMatch;
            content = RegExp.rightContext;
        }

        hasChecked = undefined;

        rValue['hasChecked'] = copyContent;

        return rValue;
    }

    _splitTag(content) {
        let reg = /<\/script>/i;

        reg.test(content);

        this.textContent = RegExp.leftContext;
    }
    //--------------------------------------
    _getNode() {

        let node = new ScriptNode(this.head, this.textContent, this.foot);

        return node;
    }
}

TagTools.identifyTagMethod['script'] = IsScript;
//==============================================================================
class IsCommand_1 extends IsTag {
    // <%[-=]? %>

    constructor(content) {
        super(content);

        this.checkReg = this._getCheckReg('\\s%>');
    }
    //--------------------------------------
    get reg() {
        // let reg = /(?:[`][\s\S]*?[^\\][`])|(?:['][\s\S]*?[^\\]['])|(?:["][\s\S]*?[^\\]["])|(?:\/\/[\s\S]*?\n)|(?:\/\*[\s\S]*?\*\/)|(<[\/]?(?:[a-z][^\s>\/]{0,})(?:>|\s[\s\S]*?>))|(\s%>)/i;
        /* capture_2: 目標 */
        /* capture_1: 有問題 */

    }

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
        list.push(/(?:\/\/[\s\S]*?\n)/);

        // 捕捉 /* */
        list.push(/(?:\/\*[\s\S]*?\*\/)/);

        // 捕捉 <htmlTag>
        // (% %), <% %> 屬於 textNode
        // 其中不能有標籤
        list.push(/(<[/]?(?:[a-z][^\s>/]{0,})(?:>|\s[\s\S]*?>))/);

        // 捕捉目標
        if (endTag instanceof RegExp) {
            list.push(endTag);
        } else {
            reg = RegExp(`(${endTag})`);
            list.push(reg);
        }

        let list_1 = [];

        list.forEach(function (v, i) {
            list_1.push(v.source);
        });

        let str = list_1.join('|');
        // str = `(${str})`;

        // console.log(str);

        list = undefined;
        list_1 = undefined;

        reg = RegExp(str, 'i');

        // console.log(reg.source);
        // console.error('');

        return reg;
    }
    //--------------------------------------
    check() {
        let res = this._findEnd(this.source);

        if (res['find']) {

            this.rValue['remain'] = res['remain'];
            this.rValue['find'] = this._getNode();
        } else {
            this.rValue['remain'] = res['remain'];
            this.rValue['hasChecked'] = res['hasChecked'];
        }

        return this.rValue;
    }

    //--------------------------------------
    _findEnd(content) {
        const rValue = {
            remain: undefined,
            find: false,
            hasChecked: undefined
        };

        let hasChecked;
        let copyContent = content;


        let isErrorTag;
        let rgRes;

        while ((rgRes = this.checkReg.exec(content)) != null) {
            debugger;

            hasChecked = (hasChecked || '');
            hasChecked += RegExp.leftContext;

            if (rgRes[2] != null) {
                debugger;
                // 找到了結尾
                rValue['remain'] = RegExp.rightContext;
                rValue['find'] = (isErrorTag ? false : true);

                if (isErrorTag) {
                    rValue['hasChecked'] = hasChecked + rgRes[2];
                } else {
                    this.foot = rgRes[2];
                    this._splitTag(RegExp.leftContext);
                }

                return rValue;
            } else if (rgRes[1] != null) {
                // <% %>, (% %) 裡面有 htmlTag
                // error

                isErrorTag = true;
            }
            hasChecked += RegExp.lastMatch;
            content = RegExp.rightContext;
        }
        //-----------------------
        // 都沒找到
        rValue['hasChecked'] = copyContent;

        return rValue;
    }
    //--------------------------------------
    _splitTag(content) {
        debugger;
        let reg = /([(<]%[-=]?)\s([\s\S]*)/;

        let res = reg.exec(content);

        this.head = res[1];
        this.textContent = res[2];
    }
    //--------------------------------------
    _getNode() {
        let node = new CommandNode(this.head, this.textContent, this.foot);

        return node;
    }
}

TagTools.identifyTagMethod['<%'] = IsCommand_1;
TagTools.identifyTagMethod['<%-'] = IsCommand_1;
TagTools.identifyTagMethod['<%='] = IsCommand_1;
//==============================================================================

class IsCommand_2 extends IsCommand_1 {
    // (%[-=]? %)

    constructor(content) {
        super(content);
        this.tagEnd = '%)';
        this.checkReg = this._getCheckReg('\\s%\\)');
    }
    //--------------------------------------
    check() {
        return super.check();
    }

}

TagTools.identifyTagMethod['(%'] = IsCommand_2;
TagTools.identifyTagMethod['(%-'] = IsCommand_2;
TagTools.identifyTagMethod['(%='] = IsCommand_2;
