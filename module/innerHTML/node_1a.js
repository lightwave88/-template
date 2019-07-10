import { tools } from './tools_1.js';

const NodeClass = {};

export { NodeClass };
//------------------------------------------------------------------------------

// 操作用節點(interface)
class Node {
    // dom: 所屬 dom
    // parent: 父節點
    // index: 隸屬父節點的順位
    constructor(dom, parent, index) {
        // this.fn = Node;
        this.dom = dom;

        //------------------
        // 父節點
        this.parent;

        // 在 parent 的排序
        this.index;
        //------------------
        this.tools = tools;

        // 標籤頭
        this.tagHead;
        // 標籤尾
        this.tagfoot;

        //------------------
        // 正常標籤會有 tagName
        // 但有些標籤則無
        this.tagName;

        // 所有的標籤都會有
        this.nodeName;

        // 是單標籤還是雙標籤
        this.tagNumber;

        // 非一班標籤
        // 如 text, comment
        this.text;
        //------------------
        // atts
        this.attrs = [];
        //------------------
        // 內文陣列
        this.contentLis;

        // 子孫的內文
        this.innerHTML;
        this.outerHTML;
        //-----------------------
        if (parent != null) {
            this.parent = parent;
            this.index = index;
        }
    }
    //--------------------------------------
    resolve() {
        throw new Error('need override Node.resolve()');
    }
    //--------------------------------------
    // 取得包括自己的內文
    getAllContent() {
        throw new Error('need override Node.getAllContent()');
    }
    //--------------------------------------
    // 取得兒子不包含自己的內文
    getChildContent() {
        throw new Error('need override Node.getChildContent()');
    }
    //--------------------------------------
    // 把自己的內文(要包括自己)傳給父親
    callParent(parentNode) {
        // debugger;

        let index = this.index;

        let content = this.getAllContent();

        // 把自己的內文傳給父親
        parentNode.contentLis[index] = content;
        if (index == 0) {
            parentNode.innerHTML = parentNode.contentLis.join('');
        }
    }
}
//==========================================================================
// 一般節點
class Type1Node extends Node {
    constructor(dom, parent, index) {
        super(dom, parent, index);

        if (this.dom.childNodes != null && this.dom.childNodes.length > 0) {
            let arrayLength = this.dom.childNodes.length;
            this.contentLis = new Array(arrayLength);
        }
    }
    //--------------------------------------
    resolve() {
        let tagName = this.dom.tagName;

        if (tagName == null) {
            // 非一般 tag
            // 因為不能包含子孫所以是單一 tag

            this.nodeName = this.dom.nodeName.toLowerCase();
            this.text = this.dom.nodeValue;
            this.tagNumber = 1;

        } else {
            // debugger;

            this.tagName = tagName.toLowerCase();
            this.tagNumber = this.tools.getdomTagNumber(this.tagName);

            if (this.tagNumber > 1) {
                this.tagfoot = `</${this.tagName}>`;
                // this.tagfoot = "</" + this.tagName + ">";
            }
            //------------------
            // 取得屬性

            if (this.dom.attributes.length == 0) {
                this.tagHead = `<${this.tagName}>`;
            } else {

                let outerHTML = this.dom.outerHTML;

                let reg = /[^%]>/;
                let res = reg.exec(outerHTML);

                this.tagHead = RegExp.leftContext + RegExp.lastMatch;
            }
        }
    }
    //--------------------------------------
    // outerHTML
    getAllContent() {
        // debugger;
        let res;

        if (this.tagName == null) {

            switch (this.nodeName) {
                case '#text':
                    res = this.text;
                    break;
                case '#comment':
                    res = `<!--${this.text}-->`;
                    // res = '<!--' + this.text + '-->';
                    break;
                default:
                    console.warn(`>>problem tag (${this.tagName})`);
                    // console.warn('>>problem tag (' + this.tagName + ')');
                    // 真的不知道如何處理這怪異的 tag
                    // 會被忽視
                    res = '';
                    break;
            }
        } else {
            if (this.tagNumber == 2) {
                res = `${this.tagHead}${(this.innerHTML || '')}${this.tagfoot}`;

            } else {
                if (this.innerHTML != null) {
                    throw new TypeError(`tag(${this.tagName}) has childs`);
                }
                res = this.tagHead;
            }
        }
        return res;
    }
    //--------------------------------------
    // innerHTML
    getChildContent() {
        return (this.innerHTML || '');
    }
}

NodeClass["Type1Node"] = Type1Node;
//==========================================================================
// 特殊節點(來自 Type1Node)
// 把內容不含 <% %> 的節點直接壓縮成 textNode
class Type2Node extends Node {

    constructor(node) {

        if (!(node instanceof Type1Node)) {
            throw new Error('node must instanceof Type1Node');
        }
        let dom = node.dom;
        let index = node.index;
        let parent = node.parent;

        super(dom, parent, index);
    }
    //--------------------------------------
    resolve() {
        this.innerHTML = this.dom.innerHTML;
        this.outerHTML = this.dom.outerHTML;
    }
    //--------------------------------------
    // outerHTML
    getAllContent() {
        return this.outerHTML;
    }
    //--------------------------------------
    // innerHTML
    getChildContent() {
        return this.innerHTML;
    }
}

NodeClass["Type2Node"] = Type2Node;
//==============================================================================