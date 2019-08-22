import { settings } from './settings_1.js';



// 標籤的標籤數
// 事前設定可以免去辨識的時間
const init_tagNumberMap = {
    a: 2,
    abbr: 2,
    address: 2,
    area: 1,
    article: 2,
    aside: 2,
    audio: 2,
    b: 2,
    base: 1,
    bdi: 2,
    bdo: 2,
    blockquote: 2,
    body: 2,
    br: 1,
    button: 2,
    canvas: 2,
    cite: 2,
    code: 2,
    command: 2,
    datalist: 2,
    dd: 2,
    del: 2,
    details: 2,
    dfn: 2,
    dialog: 2,
    div: 2,
    dl: 2,
    dt: 2,
    em: 2,
    embed: 1,
    fieldset: 2,
    figcaption: 2,
    figure: 2,
    footer: 2,
    form: 2,
    h1: 2,
    h2: 2,
    h3: 2,
    h4: 2,
    h5: 2,
    h6: 2,
    head: 2,
    header: 2,
    hr: 1,
    html: 2,
    i: 2,
    iframe: 2,
    img: 1,
    input: 1,
    ins: 2,
    kbd: 2,
    label: 2,
    legend: 2,
    li: 2,
    link: 1,
    main: 2,
    map: 2,
    mark: 2,
    menu: 2,
    menuitem: 2,
    meta: 1,
    meter: 2,
    nav: 2,
    noscript: 2,
    object: 2,
    ol: 2,
    optgroup: 2,
    option: 2,
    output: 2,
    p: 2,
    param: 1,
    path: 2,
    pre: 2,
    progress: 2,
    q: 2,
    rp: 2,
    rt: 2,
    ruby: 2,
    s: 2,
    samp: 2,
    script: 2,
    section: 2,
    select: 2,
    small: 2,
    span: 2,
    strong: 2,
    style: 2,
    summary: 2,
    svg: 2,
    table: 2,
    tbody: 2,
    td: 2,
    textarea: 2,
    th: 2,
    thead: 2,
    time: 2,
    title: 2,
    tr: 2,
    track: 1,
    tt: 2,
    u: 2,
    ul: 2,
    var: 2,
    video: 2,
};
//==========================================================================
// 工具
class Tools {
    constructor() {
        this.tagNumberMap;

        if (settings.useSessionStorage && ('sessionStorage' in window)) {
            sessionStorage.setItem('$$_innerHTML', JSON.stringify(init_tagNumberMap));
        } else {
            this.tagNumberMap = Object.assign({}, init_tagNumberMap);
        }
    }
    //--------------------------------------
    // 取得 tag是單標籤還是雙標籤
    getdomTagNumber(tagName) {
        // debugger;

        let res = this._getTagData(tagName);

        if (res == null) {
            let p = document.createElement('div');
            let target = document.createElement(tagName);

            p.appendChild(target);

            let content = p.innerHTML;

            let list = content.split('>');

            p = null;
            target = null;

            res = (list.length - 1);

            this._setTagData(tagName, res);
        }

        return res;
    }
    //--------------------------------------
    // 設定標籤數
    _setTagData(tagName, tagNumber) {
        // debugger;

        if (this.tagNumberMap == null) {
            // debugger;
            let data = sessionStorage.getItem('$$_innerHTML');

            if (data == null) {
                data = {};
            } else {
                // 速度會被拖慢
                data = JSON.parse(data);
            }

            if (data[tagName] == null) {
                data[tagName] = tagNumber;
                sessionStorage.setItem('$$_innerHTML', JSON.stringify(data));
            }
        } else {
            this.tagNumberMap[tagName] = tagNumber;
        }
    }
    //--------------------------------------
    _getTagData(tagName) {
        // debugger;

        let res;

        if (this.tagNumberMap == null) {
            let data = sessionStorage.getItem('$$_innerHTML');

            if (data != null) {
                data = JSON.parse(data);
                res = (data[tagName] == null ? null : data[tagName]);
            }
        } else {
            res = (this.tagNumberMap[tagName] == null ? null : this.tagNumberMap[tagName]);
        }
        return res;
    }
}
//==============================================================================
const tools = new Tools();

export { tools };
