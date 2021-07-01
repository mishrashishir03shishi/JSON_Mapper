const crypto = require("crypto");

var fs = require('fs');


const fileRead = function (name) {
    
    var obj;
    // var info;
    const data = fs.readFileSync('./uploads/' + name + '.json', { encoding: 'utf8', flag: 'r' });
    obj = JSON.parse(data);
    // console.log(obj);
    var info = createData(obj, name);
    // console.log(info);

    
    
    return {
        data : info.data,
        map: info.map,
        name : obj.title,
        source: obj.source,
        target: obj.target
    };

}

function createData(obj, sessionID) {
    var data = [];
    var map = new Map();
    var mappings = obj.transformations;
    for (let item of mappings) {
        const id_ =  crypto.randomBytes(16).toString("hex");
        var content = {
            id : id_,
            mapping_check_ : false,
            custom_check_ : false,
            wrapper_check_ : false,
            foreach_check_ : false,
        }
        

        if (item.mapping_check_) {
            content.mapping_check_ = true;
            
            content["target_mapping_select_"] = item.target_mapping_select_;
            content["source_mapping_select_"] = item.source_mapping_select_;
            
            if (item.if_mapping_isNull_) {
                content["if_mapping_isNull_"] = true;                
                content["if_mapping_isNull_else_"] = item.if_mapping_isNull_else_;         

            }
            else {
                content["if_mapping_isNull_"] = false;
            }
            if (item.if_mapping_other_) {
                content["if_mapping_other_"] = true;

                content["if_mapping_condition_"] = item.if_mapping_condition_;
                content["else_mapping_text_"] = item.else_mapping_text_;

            }
            else {
                content["if_mapping_other_"] = false;
            }
        }
        else if (item.custom_check_) {
            content["custom_check_"] = true;
            content["ifcheck_custom_other_"] = false;
            
            content["target_custom_select_"] = item.target_custom_select_;
            content["custom_response_"] = item.custom_response_;

            if (item.ifcheck_custom_other_) {
                content["ifcheck_custom_other_"] = true;
                content["if_custom_condition_"] = item.if_custom_condition_;
                content["else_custom_text_"] = item.else_custom_text_;
            }

        }
        else if (item.wrapper_check_) {
            content["wrapper_check_"] = true;            
            content["wrapper_start_"] = item.wrapper_start_;
            content["wrapper_end_"] = item.wrapper_end_;
            content["wrapper_condition_"] = item.wrapper_condition_;

        }
        else if (item.foreach_check_) {
            map.set(item.source_for_each_select_, item.foreach_iterator_)
            content["foreach_check_"] = true;
            content["target_for_each_select_"] = item.target_for_each_select_;
            content["source_for_each_select_"] = item.source_for_each_select_;
            content["foreach_iterator_"] = item.foreach_iterator_;

        }      
        
        data.push(content);
        // console.log("--------------");
        // console.log(item);
        // console.log(content);
        // console.log("--------------");


    }
    
    
    return {map, data};
}

module.exports = fileRead;