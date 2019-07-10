////////////////////////////////////////////////////////////////////////////////
//
// 輸出的核心
// 可被擴增
// 但很少會用到
//
//
////////////////////////////////////////////////////////////////////////////////

const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
};

class OutputModuleClass {
    constructor(analyzeContent) {

        this.analyzeContent = analyzeContent;        

        // 是否使用非同步模式
        this.async = this.analyzeContent.options.async;

        Object.defineProperty(this, '$$$contentList', {
            enumerable: false,
            writable: false,
            configurable: false,
            value: []
        });
    }
    //----------------------------
    push(html) {
        if (typeof (html) != 'string') {
            throw new TypeError(`output must be string`);
        }
        this.$$$contentList.push(html);
    }
    //----------------------------
    result() {
        return this.$$$contentList.join('');
    }
    //----------------------------
    print(html) {
        html = OutputModuleClass.print(html);
        this.push(html);
    }
    //----------------------------
    escape(html) {

        html = OutputModuleClass.print(html);

        if (typeof (_) == 'object' && _.escape != null) {
            html = _.escape(html);
        } else {

            let reg = RegExp(/(?:\^|<|>|"|'|`)/, 'g');
            html = html.replace(reg, function (m) {
                return escapeMap[m];
            });
        }
        this.push(html);
    }

    //---------------------------------
    // 類似 php.include 功能
    importTemplat(html, data) {
        if (!this.async) {
            throw new Error('_.$template() must use options.async = true');
        }

        data = data || {};
        let $this = this;

        let al = new AnalyzeContent(html, {
            async: true
        });

        let fn = al.getFn();

        // 形成一個封閉環境
        let p = fn(data);

        p.then(function (res) {
            $this.push(res);
        });

        return p;
    }
    //---------------------------------
    static print(html){

        if(typeof html == 'undefined'){
            html = 'undefined';
        }else if(typeof html == 'object'){
            if(html === null){
                html = 'null';
            }else{
                html = JSON.stringify(html);
            }
        }else{
            try {
                html += '';
            } catch (err) {
                html = err.toString();
            }
        }
        return html;
    }
}

export { OutputModuleClass };


OutputModuleClass.addOn_modules = {};
