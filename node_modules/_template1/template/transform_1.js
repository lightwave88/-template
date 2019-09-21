import { innerHTML } from '../innerHTML/index.js';

// 文本轉換工具
const Transform = {};

export { Transform };


(function(){
    const $t = Transform;

    $t.toStandMode = function(){

    };

    $t.toEditMode = function(){

    };

    $t.innerHTML = function(dom, includeRoot){
        return innerHTML(dom, includeRoot);
    };
})();