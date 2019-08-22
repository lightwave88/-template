////////////////////////////////////////////////////////////////////////////////
//
// 節點
//
////////////////////////////////////////////////////////////////////////////////
const NodeClass = {};

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
}

NodeClass['ScriptPartNode'] = ScriptPartNode;
//==============================================================================
// 命令標籤
class CommandNode extends Node {

    constructor(tagName, head, textContent) {
        super();

        this.head = head.trim();

        this.textContent = textContent || '';

        this.tagName = tagName;
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

}

NodeClass['CommandNode'] = CommandNode;
//==============================================================================
