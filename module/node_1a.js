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
    printCommand(dataArray) {
        this.html = this._checkHtml(this.html)
        let content = 'print(`' + this.html + '`);\n';
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

    printCommand(dataArray) {
        let content;

        if (Array.isArray(dataArray)) {
            // 正式用法
            let index = dataArray.length;
            dataArray.push(this.html);
            content = `print(SCRIPTS[${index}]);\n`;
        } else {
            // test
            let html = JSON.stringify(this.html);
            content = `print(${html});\n`;
        }
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
    printCommand(dataArray) {
        let fnCommand = '';

        if (Array.isArray(dataArray)) {
            let index = dataArray.length;

            let textContent;

            switch (this.commandTag) {
                case 'script':
                case '<%':
                case '(%':
                    textContent = this.textContent;

                    if(!/\n\s*$/.test()){
                        textContent += '\n';
                    }

                    fnCommand = textContent;
                    break;
                case '<%=':
                case '(%=':
                    dataArray.push(this.textContent);
                    fnCommand = `print(SCRIPTS[${index}]);\n`;
                    break;
                case '<%-':
                case '(%-':
                    dataArray.push(this.textContent);
                    fnCommand = `escape(SCRIPTS[${index}]);\n`;
                    break;
                default:
                    throw new Error('commandName Error(' + this.tagName + ')');
                    break;
            }
        } else {
            let textContent;

            switch (this.commandTag) {
                case 'script':
                case '<%':
                case '(%':
                    fnCommand = this.textContent;
                    break;
                case '<%=':
                case '(%=':
                    textContent = JSON.stringify(this.textContent);
                    fnCommand = `print(${textContent});\n`;
                    break;
                case '<%-':
                case '(%-':
                    textContent = JSON.stringify(this.textContent);
                    fnCommand = `escape(${textContent});\n`;
                    break;
                default:
                    throw new Error('commandName Error(' + this.tagName + ')');
                    break;
            }
        }

        return fnCommand;
    }
    //----------------------------

}

NodeClass['CommandNode'] = CommandNode;
//==============================================================================
