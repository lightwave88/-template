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
    //----------------------------
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
        let content = 'Out.print(`' + this.html + '`);\n';
        return content;
    }
    //----------------------------
}

NodeClass['NormalNode'] = NormalNode;
//==============================================================================
// 一般 (script 標籤)
class ScriptNode extends Node {

    constructor(head, textContent, foot) {
        super();

        if (this._isCommand(head)) {
            let node = new CommandNode(head, textContent, foot);
            node.setCommandTag('script');
            return node;
        } else {
            this.html = head + textContent + foot;
        }
    }
    //----------------------------
    // 確定是 command 標籤
    // 還是標準 <script> 標籤
    _isCommand(content) {
        let reg = /\stype=(["'])text\/(?:javascript|_)\1/;
        return reg.test(content);
    }
    //----------------------------

    printCommand() {
        let content;
        // 這邊很重要
        // 跟其他地方不同
        let html = JSON.stringify(this.html);
        content = `Out.print(${html});\n`;

        return content;
    }
}

NodeClass['ScriptNode'] = ScriptNode;
//==============================================================================
// 命令標籤
class CommandNode extends Node {

    constructor(head, textContent, foot) {
        super();

        this.head = head.trim();

        this.textContent = textContent || '';

        this.foot = foot.trim();

        this.commandTag = this.head;
    }
    //----------------------------
    setCommandTag(tagName) {
        this.commandTag = tagName;
    }
    //----------------------------
    printCommand() {
        let fnCommand = '';

        let textContent;

        switch (this.commandTag) {
            case 'script':
            case '<%':
            case '(%':
                fnCommand = this.textContent;
                break;
            case '<%=':
            case '(%=':
                fnCommand = 'Out.print(`' + this.textContent + '`);\n';
                break;
            case '<%-':
            case '(%-':
                fnCommand = 'Out.escape(' + this.textContent + ');\n';
                break;
            default:
                throw new Error('commandName Error(' + this.tagName + ')');
                break;
        }


        return fnCommand;
    }
    //----------------------------

}

NodeClass['CommandNode'] = CommandNode;
//==============================================================================
