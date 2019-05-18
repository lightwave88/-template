////////////////////////////////////////////////////////////////////////////////
//
// 搜尋 tag 工具
//
////////////////////////////////////////////////////////////////////////////////

const TagTools = (function () {

    class TagTools {
        //--------------------------------------

        static findScript(content) {

            const rValue = {
                hasChecked: undefined,
                find: false,
                remain: undefined
            }

            let nodeList = [];

            while (content) {
                debugger;

                // 專門找 <script>
                // 正常程序是先找出 tagHead
                let res = _findScript(content);

                debugger;

                let node;

                if (res['hasChecked'] != null) {
                    node = {};
                    node['name'] = 'text';
                    node['content'] = res['hasChecked'];
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

    }


    (function () {
        // 找尋各種 tag 的方法
        // 用 tagName 做 key
        TagTools.identifyTagMethod = {};

    })();
    return TagTools;


    //--------------------------------------
    // 是否要從文本的某處開始(可以不指定)
    // content: 文本
    // headTag:
    // footTag:
    /* 返回
        {
            hasChecked: undefined,
            find: false,
            remain: undefined
        }
    */
    function _findScript(content, headTag, footTag) {
        // 有兩種搜尋方法
        let res;
        if (headTag == null) {
            // 預設是以 <script>...</script>
            res = _findDefaultScript(content);
        } else {
            // 若有指定標籤格式
            // 如 (%...%), <%...%>
            res = _findScriptByAssignTag(content, headTag, footTag);
        }
        return res;
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
            rValue['hasChecked'] = hasChecked + (res['hasChecked'] || '');
        }

        return rValue;
    }
    //--------------------------------------------------------------------------
    // rValue: 回傳值
    function _findScriptByAssignTag(rValue, content, headTag, footTag) {

    }
})();


export { TagTools };


////////////////////////////////////////////////////////////////////////////////

class IsTag {
    constructor(content) {
        this.source = content;

        this.head;
        this.content;
        this.foot;

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
    constructor(content) {
        super(content);

        this.foot = '</script>';
        this.checkReg = this._getCheckReg('</script>');
    }
    //--------------------------------------
    _getCheckReg(endTag) {
        debugger;

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
        reg = RegExp(`(${endTag})`);
        list.push(reg);

        let list_1 = [];

        list.forEach(function (v, i) {
            list_1.push(v.source);
        });

        let str = list_1.join('|');
        str = `(${str})`;

        console.log(str);

        list = undefined;
        list_1 = undefined;

        reg = RegExp(str);

        console.log(reg.source);
        // console.error('');

        return reg;
    }
    //--------------------------------------
    check() {
        let res = this._findTagEnd(this.source);

        if (res['find']) {

            this.head = res['content'];
            let remain = res['remain'];

            let res_1 = this._findScriptEnd(remain);

            if (res_1['find']) {
                // 找到尾

                let reg_res = /^([\s\S]*?)<\/script>/.exec(res_1['content']);
                this.content = reg_res[1];

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
        debugger;

        const rValue = {
            remain: undefined,
            find: false,
            content: undefined,
            hasChecked: undefined
        };
        //-----------------------
        let index = content.search(/>/);

        if (index < 0) {
            rValue['find'] = false;
            rValue['hasChecked'] = content;
        } else {
            rValue['find'] = true;
            rValue['content'] = content.substring(0, index + 1);
            rValue['remain'] = content.substring(index + 1);
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

        while (true) {
            debugger;

            let rgRes = this.checkReg.exec(content);
            if (rgRes == null) {
                break;
            }

            let index = rgRes.index;

            hasChecked = (hasChecked || '');
            hasChecked += content.substring(0, index);

            if (rgRes[2] != null) {
                // 找到了結尾
                rValue['remain'] = RegExp.rightContext;
                rValue['find'] = true;
                rValue['content'] = (hasChecked || '') + rgRes[2];

                return rValue;
            }

            hasChecked += rgRes[1];

            content = (RegExp.rightContext || '');
        }

        hasChecked = undefined;

        rValue['hasChecked'] = content;

        return rValue;
    }
    //--------------------------------------
    _getNode() {
        return {
            name: 'script',
            contnet: (this.content)
        };
    }
}

TagTools.identifyTagMethod['script'] = IsScript;
//==============================================================================
(function () {
    let reg = /((?:[`][\s\S]*?[^\\][`])|(?:['][\s\S]*?[^\\]['])|(?:["][\s\S]*?[^\\]["])|(?:\/\/[\s\S]*?\n)|(?:\/\*[\s\S]*?\*\/)|(<\/script>))([\s\S]*)/;

    
})();
