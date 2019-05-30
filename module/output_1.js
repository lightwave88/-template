
const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
};

class OutputModuleClass {
    constructor() {
        Object.defineProperty(this, '$$$contentList', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: []
        });
    }

    push(html) {
        if(typeof(html) != 'string'){
            throw new TypeError(`output must be string`);
        }
        this.$$$contentList.push(html);
    }

    result() {
        return this.$$$contentList.join('');
    }

    print(html) {
        this.push(html);
    }

    escape(html) {
        if (typeof(_) != 'object' && _.escape != null) {
            html = _.escape(html);
        } else {
            
            let source = Object.keys(escapeMap).join('|');
            source = `(?:${source})`;
            let reg = RegExp(source, 'g');
            html = html.replace(reg, function (m) {
                return escapeMap[m];
            });
        }
        
        this.push(html);
    }
}

export { OutputModuleClass };

