////////////////////////////////////////////////////////////////////////////////
//
// 節點
//
////////////////////////////////////////////////////////////////////////////////
const InjectModules = {};

const NodeClass = {
    injectModules: function (name, m) {
        InjectModules[name] = m;
    }
};

export { NodeClass };
//--------------------------------------

// 除了 (command 標籤) (script 標籤)外都是
class Node {

    constructor() {
        // 取得使用者設定
        this.renderFactory;
    }

    setRenderFactory(obj) {
        renderFactory = obj;
    }

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
    toString() {
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
    toString() {
        return `N(this.html)`;
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
    toString() {
        return `S(this.html)`;
    }
}

NodeClass['ScriptPartNode'] = ScriptPartNode;
//==============================================================================
// 命令標籤
class CommandNode extends Node {

    // include: {}: include() 的位置上
    constructor(tagName, textContent, hasCheckInclude, include) {
        super();

        // this.head = head.trim();

        this.textContent = textContent || '';

        this.tagName = tagName;

        // 是否檢查過 include
        this.hasCheckInclude = !!hasCheckInclude;

        // 文本 include 分離點
        // [{s:,e:,path:}]
        this.include;

        if (Array.isArray(include)) {
            this.include = include;
        }
    }
    //----------------------------
    // 分離出 include.node
    separateInclude() {
        debugger;

        switch (this.tagName) {
            case '<%=':
            case '(%=':
            case '<%-':
            case '(%-':
                return this;
        }

        if(this.include == null || this.include.length < 1){
            return this;
        }

        let $nodeList = this._separateIncludeNode();

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
                    fnCommand = `Out.print(\`${textContent}\`);\n`;
                }

                break;
            case '<%-':
            case '(%-':
                textContent = this.textContent.trim();

                if (textContent) {
                    fnCommand = `Out.escape(\`${this.textContent}\`);\n`;
                }

                break;
            default:
                throw new Error(`commandName Error(${this.tagName})`);
                break;
        }
        return fnCommand;
    }
    //----------------------------
    toString() {
        return `C(this.textContent)`;
    }
    //----------------------------

    _separateIncludeNode() {
        const nodeList = [];

        let start;

        for (let i = 0; i < this.include.length; i++) {
            const info = this.include[i];

            let s = info.s;
            let e = info.e;
            let path = info.path;

            if (start == null) {
                start = 0;
            }

            let context_1 = this.textContent.slice(start, s);
            let context_2 = this.textContent.slice(s, e + 1);

            let node = new CommandNode(this.tagName, context_1, true);
            nodeList.push(node);

            node = new IncludeNode();
            nodeList.push(node);

            start = e + 1;
        }
    }
    //----------------------------
    _checkInclude() {

    }
}

NodeClass['CommandNode'] = CommandNode;
//==============================================================================
class IncludeNode extends Node {
    constructor(filePath, analyze) {
        super();

        this.filepPath = filePath;

        // pathData
        this.path = {};

        // include 的 root
        this.includePath;

        this._init(analyze);
    }

    _init() {
        this.filepPath = this.filepPath.split(",");

        this.filepPath = this.filepPath.map(function (path) {
            return path.trim();
        });

        Object.assign(this.path, analyze.path);

        this.includePath = analyze.includePath;
    }
    //----------------------------
    printCommand() {
        throw new Error("include no resolve");
    }
    //----------------------------
    // 截取文件
    // 再轉成 nodeList
    // 非同步
    include() {
        const TagTools = InjectModules['TagTools'];

        // 非同步取得 context
        let context;

        const $nodeList = [];

        let path;

        if (this.filepPath.length > 1) {

        } else {

        }

        // 讀取檔案


        let res = TagTools._getCommandTag(context);
    }
    //----------------------------
    // 截取文件
    // 再轉成 nodeList
    // 同步
    includeSync() {
        const TagTools = InjectModules['TagTools'];
        const $nodeList = [];

        // 同步取得 context
        let context;

        let res = TagTools._getCommandTag(context);

        return res;
    }
    //----------------------------
    printCommand() {
        throw new Error("IncludeNode cant be printCommand");
    }
    //----------------------------
    toString() {
        return `I(${this.url})`;
    }
}

NodeClass['IncludeNode'] = IncludeNode;
