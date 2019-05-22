

class Tools {

    static findScript(content) {
        return Tools.$findScript(null, content);
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

        let res = Tools.findTagEnd(content);

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
            }
        }
        return rValue;
    }
    //--------------------------------------------------------------------------
    // rValue: 回傳值
    static _findScriptByAssignTag(rValue, content, headTag, footTag) {

    }
    //--------------------------------------------------------------------------
    // 用比較快的方式
    // 不用再去考慮 attr
    static findTagEnd(content) {
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



        let _chart;

        // 文字區(`'")
        let commandCount_1 = 0;
        // 注釋區(//)
        let commandCount_2 = 0;
        // 注釋區(/* */)
        let commandCount_3 = 0;

        let _symbol_1;
        let _symbol_2;


        let check_1 = true;
        let check_2 = true;
        let check_3 = true;
        //------------------

        (function(){
            let reg = RegExp(`([\`'"][\\s\\S]*?${endTag.source}[\\s\\S]*?\1`);

            reg = RegExp(`\/\/[\\s\\S]*?${endTag.source}[\\s\\S]*?\\n`);

            reg = RegExp(`/\*[\\s\\S]*?${endTag.source}[\\s\\S]*?/*`);

        })();
        //------------------
        if (!check_1 && !check_2 && !check_3) {
            // 使用較快的解析方法
            // 只要找出最後

            endTag = RegExp(`^([\\s\\S]*?${endTag.source})([\\s\\S]*)`);

            let res = endTag.exec(content);

            rValue['remain'] = res[2];
            rValue['content'] = res[1];
            rValue['find'] = true;

        } else {
            // 用慢解

            endTag = RegExp(`^${endTag.source}`);

            let i = 0;
            let hasChecked;
            //------------------
            while ((_chart = content[i]) != null) {

                let sample = content.substring(i);

                if (commandCount_1 > 0) {
                    // debugger;
                    // 在文字區中
                    if (_symbol_2.test(sample)) {
                        // 脫逸

                        // console.log('遇到脫逸字(%s)', _symbol_2.source);
                        i++;
                        continue;
                    }

                    if (_symbol_1.test(_chart)) {
                        // 遇到分隔符號
                        commandCount_1--;
                    }

                } else if (commandCount_2 > 0) {
                    // 註釋區(//)
                    // debugger;

                    if (_symbol_1.test(sample)) {
                        commandCount_2--;
                        _symbol_1 = undefined;
                    }
                } else if (commandCount_3 > 0) {
                    if (_symbol_1.test(sample)) {
                        commandCount_3--;
                        _symbol_1 = undefined;
                    }
                } else {
                    // debugger;

                    // 非特異區
                    _symbol_1 = undefined;
                    _symbol_2 = undefined;


                    let res = endTag.exec(sample);
                    if (res != null) {
                        // find

                        rValue['content'] = hasChecked + res[0];
                        rValue['find'] = true;
                        rValue['remain'] = sample.substring(res[0].length);

                        return rValue;
                    }
                    //----------------------------
                    // 如果遇到其他標籤

                    let reg = /^<(?:\/)?([a-z][^\s>/]{0,})[\s\S]*?>/i;
                    let reg_res = reg.exec(sample);
                    if (reg_res != null) {
                        // error

                        rValue['hasChecked'] = hasChecked;
                        rValue['remain'] = sample;

                        return rValue;
                    }
                    //----------------------------

                    if (check_1 && /[`'"]/.test(_chart)) {
                        // 文字區
                        commandCount_1++;
                        _symbol_1 = RegExp(`^${_chart}`);
                        _symbol_2 = RegExp(`^\\\\${_chart}`);

                    } else if (check_2 && /^\/\//.test(sample)) {
                        // 註釋區
                        commandCount_2++;

                        // 換行符號
                        _symbol_1 = /^(\r\n|\n)/;

                    } else if (check_3 && /^\/\*/.test(sample)) {

                        commandCount_3++;
                        _symbol_1 = /^\*\//;
                    }
                }

                hasChecked = (hasChecked || '') + _chart;
                i++;
            } // while end
            //------------------
            rValue['hasChecked'] = hasChecked;
        }

        return rValue;
    }
}

export { Tools };
