////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////

// for test
import { TagTools } from './tagTools_1.js';

// 把文本解析成藥的樣板
import { AnalyzeContent } from './analyzeContent_1.js';

// 應用涵式模組
import { add_methodModules } from './methods_1.js';

// output 模組
import { add_outputModules } from './output_1.js';

const $template = (function () {

    const $template = function (content, options) {
        debugger;

        let al = new AnalyzeContent(content, options);

        let res = al.getFn();

        return res;
    };
    //--------------------------------------------------------------------------
    // $template 類別函式

    (function () {
        // for test

        // <% %> 與 <script type="text/_"> 互換
        $template.transform = function (content, options) {

        };

        $template.TagTools = TagTools;

        // 模板相關設定值
        $template.settings = {};

        // 可擴充 output 功能
        $template.addOutput = function (key, fn) {
            if(typeof(fn) != 'function'){
                throw new TypeError(`args[1] must be function`);
            }
            add_outputModules[key] = fn;
        };

        // 擴充一般功能
        $template.addMethods = function (key, fn) {
            if(typeof(fn) != 'function'){
                throw new TypeError(`args[1] must be function`);
            }
            add_methodModules[key] = fn;
        };

    })();
    //==========================================================================

    return $template;
})();

export { $template };
export default { $template };
