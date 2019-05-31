////////////////////////////////////////////////////////////////////////////////
//
//
//
////////////////////////////////////////////////////////////////////////////////
import { TagTools } from './module/tagTools_1.js';
import { AnalyzeContent } from './module/analyzeContent_1.js';
import { add_methodModules } from './module/methods_1.js';
import { add_outputModules } from './module/output_1.js';

const $template = (function () {

    
    const $template = function (content, options) {
        debugger;

        let al = new AnalyzeContent(content, options);
        let res;

        // let res = m.fnCommand;
        // console.log(res);
        // console.log(JSON.stringify(m.SCRIPTS));

        res = al.getFn();

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

