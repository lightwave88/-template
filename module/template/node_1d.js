////////////////////////////////////////////////////////////////////////////////
//
// 節點
//
////////////////////////////////////////////////////////////////////////////////
const M = {};

const NodeClass = {
    injectModules: function(name, m){
        M[name] = m;
    }
};

export { NodeClass };


// 除了 (command 標籤) (script 標籤)外都是
class Node {
    printCommand() {
        throw new Error('need override printCommand');
    }
    //----------------------------
    _checkHtml(content) {
        // 過濾 `
        // 脫逸 `
        let reg = /`/g;
        content = content.replace(reg, function (m) {
            return ('\\`');
        });
        return content;
    }
    //----------------------------
    toString(){
        return String(this);
    }
}
//==============================================================================
class NormalNode extends Node {
    constructor(content) {
        super();
        this.html = content;
    }
    //----------------------------
    printCommand() {
        this.html = this._checkHtml(this.html)
        let content = `Out.print(\`${this.html}\`);\n`;
        return content;
    }
    //----------------------------
    toString(){
        return `(this.html)`;
    }
}

NodeClass['NormalNode'] = NormalNode;
//==============================================================================

// 部分的 script 內容
class ScriptPartNode extends Node {

    // isContext:是否是內文
    constructor(content, isTag) {
        super();
        this.html = content;

        if (typeof isTag != 'boolean') {
            throw new TypeError("ScriptPartNode.constructor() args[1] typeError");
        }

        this.isTag = isTag;
    }
    //----------------------------
    printCommand() {
        let content;

        if (this.isTag) {
            // 會再經過 String.template 轉換
            content = `Out.print(\`${this.html}\`);\n`;
        } else {
            let html = JSON.stringify(this.html);
            content = `Out.print(${html});\n`;
        }

        return content;
    }
    //----------------------------
    toString(){
        return this.html;
    }
}

NodeClass['ScriptPartNode'] = ScriptPartNode;
//==============================================================================
// 命令標籤
class CommandNode extends Node {

    // include: {}: include() 的位置上
    constructor(tagName, head, textContent, include) {
        super();

        this.head = head.trim();

        this.textContent = textContent || '';

        this.tagName = tagName;

        this.hasCheckInclude = false;

        // 文本 include 分離點
        this.include = [];

        if(Array.isArray(include)){
            this.hasCheckInclude = true;
            this.include = include;
        }
    }
    //----------------------------
    // 分離出 include.node
    separateNode(){

        switch (this.tagName) {
            case '<%=':
            case '(%=':
            case '<%-':
            case '(%-':
                return this;
            default:
                break;
        }
        const $nodeList = [];

        if(!this.hasCheckInclude){

        }

        return $nodeList;
    }
    //----------------------------
    printCommand() {
        let fnCommand = '';
        let textContent;

        switch (this.tagName) {
            case 'script':
            case '<%':
            case '(%':
                fnCommand = this.textContent;
                break;
            case '<%=':
            case '(%=':
                textContent = this.textContent.trim();

                if (textContent) {
                    fnCommand = `Out.print(${textContent});\n`;
                }

                break;
            case '<%-':
            case '(%-':
                textContent = this.textContent.trim();

                if (textContent) {
                    fnCommand = `Out.escape(${this.textContent});\n`;
                }

                break;
            default:
                throw new Error(`commandName Error(${this.tagName})`);
                break;
        }
        return fnCommand;
    }
    //----------------------------
    toString(){
        return this.textContent;
    }

}

NodeClass['CommandNode'] = CommandNode;
//==============================================================================
class IncludeNode extends Node{
    constructor(url){
        this.url = url;
    }

    printCommand() {
        let res = '';

        // test
        res = `require("${this.url}")`;
        return res;
    }

    // 截取文件
    // 再轉成 nodeList
    // 非同步
    getNodeList(){
        const TagTools = M['TagTools'];

        const $nodeList = [];

        // 非同步取得 context
        let context;

        let res = TagTools._getCommandTag(context);
    }

    // 截取文件
    // 再轉成 nodeList
    // 同步
    getNodeListSync(){
        const TagTools = M['TagTools'];
        const $nodeList = [];

        // 同步取得 context
        let context;

        let res = TagTools._getCommandTag(context);

        return res;
    }

    printCommand(){
        throw new Error("IncludeNode cant be printCommand");
    }

    toString(){
        return `include(${this.url})`;
    }
}

NodeClass['IncludeNode'] = IncludeNode;
