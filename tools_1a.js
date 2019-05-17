

class Tools {

    static findScript(content) {
        let nodeList = [];

        while (content) {
            debugger;
            let res = Tools.$findScript(null, content);
            debugger;

            let node;

            if (res['find']) {

                if (res['hasChecked'] != null) {

                    node = {};
                    node['name'] = 'text';
                    node['content'] = res['hasChecked'];
                    nodeList.push(node);
                }
                node = {};
                node['name'] = 'script';
                node['content'] = res['tagContent']
                nodeList.push(node);

                content = res['remain'];
            } else {
                node = {};
                node['name'] = 'text';
                node['content'] = res['hasChecked'];

                nodeList.push(node);

                content = null;
            }
        }
        debugger;

        console.dir(nodeList);
    }


    // 是否要從文本的某處開始(可以不指定)
    // content: 文本
    // headTag:
    // footTag:
    static $findScript(index, content, headTag, footTag) {

        const rValue = {
            hasChecked: undefined,
            find: false,
            remain: undefined,
            tagHead: undefined,
            tagFoot: undefined,
            tagContent: undefined
        };

        if (index != null) {
            rValue['hasChecked'] = content.substring(0, index);
            content = content.substring(index);
        }

        if (headTag == null) {
            return Tools._findScript(rValue, content);
        } else {
            return Tools._findScriptByAssignTag(rValue, content, headTag, footTag);
        }
    }
    //--------------------------------------------------------------------------
    // rValue: 回傳值
    static _findScript(rValue, content) {
        debugger;

        let index = content.search(/<script/);

        if (index < 0) {
            // 沒找到 <script 開頭

            rValue['hasChecked'] = (rValue['hasChecked'] || '') + content;
            return rValue;
        }
        //-----------------------

        let hasChecked = content.substring(0, index);
        content = content.substring(index);

        let scriptHead;
        let scriptTextcontent;
        let scriptFoot;

        let res = Tools.$findTagEnd(content);

        if (!res['find']) {
            // 沒找到頭
            rValue['hasChecked'] = (rValue['hasChecked'] || '') + content;
        } else {

            scriptHead = res['content'];
            let remain = res['remain'];

            let res_1 = Tools.findScriptEnd(remain, /<\/script>/);

            if (!res_1['find']) {
                // 沒找到尾
                rValue['hasChecked'] = (rValue['hasChecked'] || '') + content;
            } else {
                let scriptContent = res_1['content'];
                rValue['remain'] = res_1['remain'];
                rValue['find'] = true;
                rValue['tagHead'] = scriptHead;

                let reg_res = /^([\s\S]*?)<\/script>/.exec(res_1['content']);

                rValue['tagContent'] = reg_res[1];
                rValue['tagFoot'] = '</script>';
                rValue['hasChecked'] = (rValue['hasChecked'] || '') + hasChecked;
            }
        }
        return rValue;
    }
    //--------------------------------------------------------------------------
    // rValue: 回傳值
    static _findScriptByAssignTag(rValue, content, headTag, footTag) {

    }
    //--------------------------------------------------------------------------

    // 比較穩當的作法
    // 但慢
    static findTagEnd(content) {
        debugger;

        let rValue = {
            remain: undefined,
            find: false,
            content: undefined,
            hasChecked: undefined
        };
        //-----------------------
        let reg = /(?:((['"])[\s\S]+?\2)|(>))([\s\S]*)/;
        let sourceContent = content;

        let length = 0;
        while (true && content) {
            let res = reg.exec(content);

            if (res == null) {
                // no find
                break;
            } else {

                if (res[1] != null) {

                    length = length + (res.index + 1) + res[1].length;
                    content = res[4];

                } else if (res[3] != null) {
                    // find
                    length = length + (res.index + 1) + res[3].length;
                    rValue['find'] = true;
                    rValue['content'] = content.substr(0, length);
                    rValue['remain'] = res[4];

                    return rValue;
                }
            }
        }

        rValue['hasChecked'] = content;
        return rValue;
    }


    // 用比較快的方式
    // 不用再去考慮 attr
    static $findTagEnd(content) {
        debugger;

        let rValue = {
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
    //--------------------------------------------------------------------------
    // 必須先找到標籤頭
    // 從標籤頭後開始搜尋
    static findScriptEnd(content, endTag) {
        let rValue = {
            remain: undefined,
            find: false,
            content: undefined,
            hasChecked: undefined
        };

        const reg = Tools._getReg_1(endTag);

        let hasChecked;

        while (true) {
            debugger;

            let rgRes = reg.exec(content);
            if (rgRes == null) {
                break;
            }

            let index = rgRes.index;

            hasChecked = (hasChecked || '');
            hasChecked += content.substring(0, index);

            if (rgRes[6] != null) {
                // 找到了結尾
                rValue['remain'] = rgRes[7];
                rValue['find'] = true;
                rValue['content'] = (hasChecked || '') + rgRes[6];

                return rValue;
            }

            hasChecked += (rgRes[1] || rgRes[2] || rgRes[3] || rgRes[4] || rgRes[5] || '');

            content = (rgRes[7] || '');
        }

        hasChecked = undefined;

        rValue['hasChecked'] = content;

        return rValue;
    }
    //--------------------------------------------------------------------------
    static _getReg_1(target) {
        // debugger;

        if (!(target instanceof RegExp)) {
            throw new TypeError(`${target} must be RegExp`);
        }

        let list = [];

        // 捕捉 ``
        list.push(/[`][\s\S]*?[^\\][`]/);

        // 捕捉 ''
        list.push(/['][\s\S]*?[^\\][']/);

        // 捕捉 ""
        list.push(/["][\s\S]*?[^\\]["]/);

        // 捕捉 // \n
        list.push(/\/\/[\s\S]*?\n/);

        // 捕捉 /* */
        list.push(/\/\*[\s\S]*?\*\//);

        // 捕捉目標
        // list.push(/<\/script>/);
        list.push(target);

        let list_1 = [];

        list.forEach(function (v) {
            list_1.push(`(${v.source})`);
        });

        let str = list_1.join('|');
        str = `(?:${str})([\\s\\S]*)`;

        console.log(str);

        list = undefined;
        list_1 = undefined;

        let reg = RegExp(str);

        return reg;
    }
}

export { Tools };
