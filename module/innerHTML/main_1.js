import { NodeClass } from './node_1a.js';
import { checkRootDom } from './checkRootDom_1.js';

const Type1Node = NodeClass.Type1Node;
const Type2Node = NodeClass.Type2Node;
const $checkRootDom = checkRootDom;
//==============================================================================
// includeRoot:輸出的內容包含 root
// rule: 給與自訂規則
function innerHTMLCommand(dom, includeRoot) {

    if (window == null || window.document == null) {
        throw new Error('_.$temlate.innerHTML() cant run in this system');
    }

    let innerHTML = new InnerHTML();

    return innerHTML.main(dom, includeRoot);
}

export { innerHTMLCommand as innerHTML };

//==============================================================================
class InnerHTML {

    constructor() {

        this.nodeList = [];

        this.checkRule;
    }
    //-------------------------------------------
    // includeRoot:輸出的內容包含 root
    // rule: 給與自訂規則
    main(dom, includeRoot) {

        includeRoot = !!includeRoot;

        dom = this._checkRootDom(dom, includeRoot);
        //----------------------------
        let htmlContent;
        let node = new Type1Node(dom);
        this.nodeList.push(node);

        let i = 0;
        let j = 0;
        while (i < this.nodeList.length) {
            // debugger;

            let parentNode = this.nodeList[i];
            let parentDom = parentNode.dom;
            //-----------------------            
            if ('innerHTML' in parentDom) {
                // 正常的 tag 都會有(innerHTML)
                let r = this._hasScriptContent(parentDom);

                // debugger;
                if (!r) {
                    // console.log('(%d)%s', ++j, parentDom.innerHTML);
                    // 若子孫沒有包含 script
                    // 壓縮成 textNode
                    // 轉換節點
                    this.nodeList[i] = new Type2Node(parentNode);

                    ++i;
                    continue;
                }
            }
            //-----------------------
            let childs = parentDom.childNodes;

            if (childs != null && childs.length > 0) {

                childs = Array.from(childs);
                childs.forEach(function (dom, i) {
                    // debugger;
                    let node = new Type1Node(dom, parentNode, i);
                    this.nodeList.push(node);
                }, this);
            }
            ++i;
        }
        //----------------------------
        // debugger;

        let root;
        while((node = this.nodeList.pop()) != null){
            root = node;
            node.resolve();
    
            if (node.parent != null) {
                node.callParent(node.parent);
            }
        }

        if (includeRoot) {
            htmlContent = root.getAllContent();
        } else {
            htmlContent = root.getChildContent();
        }

        return htmlContent;
    }
    //-------------------------------------------
    // 處理特殊的 dom
    _checkRootDom(dom, includeRoot) {
        return $checkRootDom.check(dom, includeRoot);
    }
    //-------------------------------------------
    // 檢查 dom.text 內是否有 <% %>, (% %)
    // 不用管 attr
    // 若沒有可以直接取 innerHTML
    // 避免耗時運算
    _hasScriptContent(dom) {
        // debugger;

        if (dom instanceof HTMLScriptElement) {
            // script 的內文不會被改動
            return false;
        }

        let innerText = dom.innerText;

        if (!innerText) {
            return false;
        }

        if (this.checkRule != null) {
            return this.checkRule(innerText);
        }

        // 找出是屬於哪種標籤
        InnerHTML.ruleList.some(function (r) {
            let res = r(innerText);
            if (res) {
                this.checkRule = r;
            }
            return res;
        }, this);

        if (this.checkRule != null) {
            // 若有一解
            return true;
        }

        // 內容沒有任何 <% %>
        return false;
    }
    //-------------------------------------------
}

(function () {
    InnerHTML.ruleList = [];

    // 最主要減少運算的判別
    InnerHTML.ruleList.push(function (innerText) {
        // debugger;

        let reg = /<%[-=]?\s(?:[\s\S]*?)(?:(\s%>)|[\r\n])/;

        let res;

        let copy_innerText = innerText;

        while ((res = reg.exec(copy_innerText)) != null) {
            // debugger;
            copy_innerText = RegExp.rightContext;

            if (res[1] != null) {
                return true;
            }
        }
        //----------------------------
        return false;
    });


    // 最主要減少運算的判別
    InnerHTML.ruleList.push(function (innerText) {
        // debugger;

        let reg = /\(%[-=]?\s(?:[\s\S]*?)(?:(\s%\))|[\r\n])/;

        let res;

        let copy_innerText = innerText;

        while ((res = reg.exec(copy_innerText)) != null) {
            // debugger;
            copy_innerText = RegExp.rightContext;

            if (res[1] != null) {
                return true;
            }
        }
        //----------------------------
        return false;
    });
})();
