////////////////////////////////////////////////////////////////////////////////
//
// 搜尋 tag 工具(為獨立模組)
//
// TagTools.findCommandTag()為對外命令
//
////////////////////////////////////////////////////////////////////////////////

import { NodeClass } from './node_1c.js';
import { identifyTagMethod } from './isScript_1.js';

const $identifyTagMethod = identifyTagMethod;

const NormalNode = NodeClass['NormalNode'];
const ScriptPartNode = NodeClass['ScriptPartNode'];
const CommandNode = NodeClass['CommandNode'];
const IncludeNode = NodeClass['IncludeNode'];
//------------------------------------------------

const G = {
    // 是否要解析 <script>裡面的指令
    analyzeScript: false,
    // 命令標籤名稱是哪一個[<%, (%]
    // 減少運算
    commandTagName: null,

    "reg_1": null,
};

const TagTools = {};

export { TagTools };

// 雙向注入
NodeClass.injectModules(TagTools);
//------------------------------------------------



(function () {
    const $t = TagTools;

    // main
    // analyzeScript: 是否要分析 <script></script>
    // 預設是否
    // return(nodeList, promise) 
    $t.getCommandTag = function (content, async, analyzeScript) {

        // 太麻煩，關閉
        analyzeScript = false;
        async = !!async;

        // 第一次分離出節點
        let nodeList = $t.step_1(content, analyzeScript);

        // 從 command 分離出 include.node
        // loop，直到把所有的 include 都引入
        // async 返回 promise
        // sync 返回 nodeList
        let res = $t.step_2(nodeList, async);

        // return res;

        // test
        return nodeList;
    };
    //-----------------------
    $t._getCommandTag = function (content) {
        // 第一次分離出節點
        let nodeList = $t.step_1(content, analyzeScript);

        return nodeList;
    }
})();




(function () {

    const $t = TagTools;


    // 從文本分離出 commandTag

    // analyzeScript 是否要在 script 標籤內使用命令
    // 速度會變慢
    $t.step_1 = function (content, analyzeScript) {
        // debugger;

        G.analyzeScript = !!analyzeScript;

        let nodeList = [];

        G.reg_1 = _getReg_1();

        while (content) {
            // debugger;

            // 找到 target 一次一個
            // res要返回 nodeList
            // 返回 remain
            let res = _findCommandTag(content);

            // debugger;

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

        let res;
        let hasChecked;

        // 先找尋可能的 taghead
        while ((res = G.reg_1.exec(content)) != null) {
            // debugger;

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
                    G.reg_1 = _getReg_1();
                }
            } else {
                // <script> 標籤
                tagName = res[1] || null;
            }
            //-----------------------
            let methodClass = $identifyTagMethod[tagName];
            if (methodClass == null) {
                throw new Error(`(${tagName}) no support method`);
            }

            // 找標籤所屬的尾
            let method = new methodClass(tagHead, remain);
            let _res = method.check();

            // debugger;
            let find = _res.find;

            if (find) {
                remain = _res.remain;
                let nodes = _res.nodes;

                if (!Array.isArray(nodes)) {
                    throw new TypeError('tagMethod must be return []');
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
            hasChecked += _res.hasChecked;
            content = _res.remain;
        } // while end
        //-----------------------
        // 都沒找到

        rValue.hasChecked = hasChecked + content;
        return rValue;
    }
    //--------------------------------------------------------------------------
    // 標籤頭的規則
    // 根據 G.commandTagName 傳回不同的 Reg
    function _getReg_1() {
        // debugger;

        const commandTagName = G.commandTagName;

        let mainReg;

        let reg_1 = /(\(%[-=]?)(?=\s)/;
        let reg_2 = /(<%[-=]?)(?=\s)/;
        let reg_3 = /<(script)(?=>|\s)/;

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
//==============================================================================
(function () {
    const $t = TagTools;

    $t.step_2 = function (nodeList, async) {

        if (async) {
            return getResult(nodeList);
        } else {
            return getResultSync(nodeList);
        }
    };
    //---------------------------------
    function getResultSync(nodeList) {

        while (true) {

            let nodeList_1 = [];

            // 分離出 include
            nodeList.forEach(function (node) {
                if (!(node instanceof CommandNode)) {
                    nodeList_1.push(node);
                } else {
                    let nodeList_2 = node.separateNode();
                    nodeList_1 = nodeList_1.concat(nodeList_2);
                }
            });

            nodeList = nodeList_1;
            //-----------------------
            nodeList_1 = [];

            // 記錄還有多少 include
            let k = 0;

            // 確定是否有 include
            // 有就執行
            nodeList.forEach(function (node) {
                if (node instanceof IncludeNode) {
                    ++k;

                    let list_1 = node.getNodeListSync();
                    nodeList_1 = nodeList_1.concat(list_1);
                } else {
                    nodeList_1.push(node);
                }
            });

            nodeList = nodeList_1;

            if (k < 0) {
                // 所有的 include 都已 load
                return nodeList;
            }
        }

    }
    //---------------------------------
    async function getResult() {
        while (true) {

            let nodeList_1 = [];

            // 分離出 include
            nodeList.forEach(function (node) {
                if (!(node instanceof CommandNode)) {
                    nodeList_1.push(node);
                } else {
                    let nodeList_2 = node.separateNode();
                    nodeList_1 = nodeList_1.concat(nodeList_2);
                }
            });

            nodeList = nodeList_1;
            //-----------------------
            nodeList_1 = [];

            // 記錄還有多少 include
            let k = 0;

            // 確定是否有 include
            // 有就執行
            nodeList.forEach(function (node) {
                if (node instanceof IncludeNode) {
                    ++k;

                    // 可考慮用 Promise.all()
                    let list_1 = await node.getNodeList();
                    nodeList_1 = nodeList_1.concat(list_1);
                } else {
                    nodeList_1.push(node);
                }
            });

            nodeList = nodeList_1;

            if (k < 0) {
                // 所有的 include 都已 load
                return nodeList;
            }
        }
    }

})();
