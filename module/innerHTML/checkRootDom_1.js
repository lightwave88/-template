// 只是為了方便而設
// 若真不要也可放棄

const checkRootDom = {
    check: check
};

export { checkRootDom };

const $ruleList = new Set();

function check(dom, includeRoot) {
    // debugger;

    let rule;

    const ruleList = Array.from($ruleList);

    ruleList.some(function (C) {
        if (C.isRule(dom)) {
            rule = new C();
            return true;
        }
        return false;
    });

    if (rule) {
        return rule.getRoot(dom, includeRoot);
    }
    return dom;
}
//================================================

class CheckRule {
    constructor() {
        this.allow_includeRoot;
    }

    static isRule(dom) {
        throw new Error('need override isRule()');
    }

    getRoot(include) {
        if (include && !this.allow_includeRoot) {
            throw new Error('cant get innerHTML include root');
        }
    }
}
//-------------------------------------------

$ruleList.add(class extends CheckRule {
    // 針對 HTMLTemplateElement
    constructor() {
        super();
        this.allow_includeRoot = false;
    }

    static isRule(dom) {
        if (dom instanceof HTMLTemplateElement) {
            return true;
        }
        return false;
    }

    getRoot(dom, includeRoot) {
        debugger;

        super.getRoot(includeRoot);


        dom = dom.content;
        dom = dom.cloneNode(true);
        let _dom = document.createElement('div');
        _dom.appendChild(dom);

        return _dom;
    }
});
//-------------------------------------------

$ruleList.add(class extends CheckRule {
    // 針對 DocumentFragment
    constructor() {
        super();
        this.allow_includeRoot = false;
    }

    static isRule(dom) {
        if (dom instanceof DocumentFragment) {
            return true;
        }
        return false;
    }

    getRoot(dom, includeRoot) {

        super.getRoot(includeRoot);

        dom = dom.cloneNode(true);

        let _dom = document.createElement('div');
        _dom.appendChild(dom);

        return _dom;
    }
});

