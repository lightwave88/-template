const TemplateFilter = function(){
    let args = Array.from(arguments);
    let text = args.shift();

    for (let i = 0; i < args.length; i++) {
        let key = args[i];
        let filter = TemplateFilter.filterMap.get(key);
        if(typeof filter != 'function'){
            throw new Error(`filter(${key}) no exists`);
        }        
        text = filter(text);
    }

    return text;
};

export { TemplateFilter };


TemplateFilter.filterMap = new Map();


