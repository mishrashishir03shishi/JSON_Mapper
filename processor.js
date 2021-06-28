const { json } = require('body-parser');
const { isArray } = require('lodash');
const _ = require('lodash'); 

const process = function(jsonfile, mappings){
    var json_string = jsonfile[0].target_body;
    var json_ = JSON.parse(json_string);
    var source_map = jsonfile[0].source_paths;
    var target_map = jsonfile[0].target_paths;
    var mapping = [];
    var custom = [];
    var loop = [];
    var wrapper = [];
    for(var i=0; i<mappings.length; i++){
        if(mappings[i].mapping_check_ == true){
            mapping.push(mappings[i]);
            // mapping_handler(mappings[i], json_, source_map, target_map);
        }
        else if(mappings[i].custom_check_ == true){
            custom.push(mappings[i]);
            // custom_handler(mappings[i], json_, source_map, target_map);
        }
        else if(mappings[i].foreach_check_ == true){
            loop.push(mappings[i]);
            // foreach_handler(mappings[i], json_, source_map, target_map);
        }
        else if(mappings[i].wrapper_check_ == true){
            wrapper.push(mappings[i]);
        }
        
    }
    mapping.sort(function(a,b){
        return target_map.get(b.target_mapping_select_).distance - target_map.get(a.target_mapping_select_).distance;
    });
    custom.sort(function(a,b){
        return target_map.get(b.target_custom_select_).distance - target_map.get(a.target_custom_select_).distance;
    });
    // console.log(loop);
    loop.sort(function(a,b){
        return target_map.get(b.target_for_each_select_).distance - target_map.get(a.target_for_each_select_).distance;
    });
    // console.log(loop);
    // console.log(wrapper);
    wrapper.sort(function(a,b){
        return target_map.get(b.wrapper_start_).distance -target_map.get(a.wrapper_start_).distance; 
        // var param1b = target_map.get(b.wrapper_start_).distance ;
        // var param1a = target_map.get(a.wrapper_start_).distance;
        // if(param1a == param1b ){
        //     return target_map.get(b.wrapper_start_).heirarchy - target_map.get(a.wrapper_start_).heirarchy;
        // }
        // else{
        //     return param1b-param1a;
        // }
    });
    // console.log(wrapper);
    // console.log(mapping); console.log(custom); console.log(loop);
    for(var i=0; i<mapping.length; i++){
        mapping_handler(mapping[i], json_, source_map, target_map);
        // console.log("mappings done");
    }
    for(var i=0; i<custom.length; i++){
        custom_handler(custom[i], json_, source_map, target_map);
        // console.log("customs done");
    }

    for(var i=0; i<wrapper.length; i++){
        
        wrapper_handler(wrapper[i], json_, target_map, i);
              
        update_map(json_, "root<>/", target_map);
        // console.log("foreachs done");
    }
    for(var i=0; i<loop.length; i++){
        foreach_handler(loop[i], json_, source_map, target_map);
        // console.log("foreachs done");
    }
    
    console.log("exiting processor");
    return json_;
 
}

function update_map(obj, root, map) {        
	var heir = 0.00;    
    for (var key in obj) {        
        
        var path = root + key + '/';  
        
        if(map.has(path)){
            var item = map.get(path)
            var base = item.distance;
            item["heirarchy"] = base+heir;
            map.set(path, item);
        }          
             	
		
		heir += 0.01;	
		
                
        if ((obj[key] instanceof Object )) {                
            update_map(obj[key], root + key + '/', map);                 
        }         	
        
    }       
    
}


function wrapper_handler(obj, json_, t_map, i){
    var start = obj.wrapper_start_;
    var end = obj.wrapper_end_; 
    var statement = obj.wrapper_condition_; 
    statement = state_maker(statement);
    // console.log(t_map);
    if(start!=end){
        var s_index = t_map.get(start).heirarchy;
        var floor = Math.floor(s_index);
        s_index = s_index - floor;
        s_index = s_index*100;
        var parent = t_map.get(start).parent;
        var e_index = t_map.get(end).heirarchy;
        floor = Math.floor(e_index);
        e_index = e_index-floor;
        e_index = e_index*100;
        s_index = Math.round(s_index);
        e_index = Math.round(e_index);
        var mod = _.get(json_,parent);
        if(Array.isArray(mod)){
            mod.splice(s_index, 0, statement);
            mod.splice(e_index+2, 0, '@ #end @');
            // console.log(mod);
            json_ = _.set(json_, parent, mod);
        }
        else{
            var keyValues = Object.entries(mod);
            keyValues.splice(s_index,0, ['if_'+i,statement]);
            keyValues.splice(e_index+2,0, ['end_'+i,'@ #end @']);
            var newObj = Object.fromEntries(keyValues);
            json_ = _.set(json_, parent, newObj);
        }
    }
    else{
        var s_index = t_map.get(start).heirarchy;
        // console.log(s_index);
        var floor = Math.floor(s_index);
        s_index = s_index - floor;
        // console.log(s_index);
        s_index = s_index*100;
        s_index = Math.round(s_index);
        var parent = t_map.get(start).parent;
        var mod = _.get(json_,parent);
        if(Array.isArray(mod)){
            mod.splice(s_index, 0, statement);
            mod.splice(s_index+2, 0, '@ #end @');
            // console.log(mod);
            json_ = _.set(json_, parent, mod);
        }
        else{
            var keyValues = Object.entries(mod);
            keyValues.splice(s_index,0, ['if_'+i,statement]);
            keyValues.splice(s_index+2,0, ['end_'+i,'@ #end @']);
            var newObj = Object.fromEntries(keyValues);
            json_ = _.set(json_, parent, newObj);
        }
        // console.log(mod);
        // console.log(parent);
        // console.log(s_index);
        
    }
  

}

function state_maker(statement){
    return `@ #if(${statement}) @`;
    
}




function mapping_handler(obj, json_, s_map, t_map){
    var target_select = obj.target_mapping_select_;
    var source_select = obj.source_mapping_select_;
    var null_text = obj.if_mapping_isNull_else_;
    var iter = s_map.get(source_select).iterator;
    var path = t_map.get(target_select).path;
    var type = t_map.get(target_select).type;
    var iter_buffer = iter;
    if(obj.if_mapping_isNull_){
        if(obj.if_mapping_other_){
            iter_buffer = mapping_if_handler(obj, iter, type);
            iter = mapping_wrap(iter, iter_buffer, type, null_text);
        }
        else{
            iter = mapping_isNull_handler(iter, type, null_text);
        }        
    }
    else if(obj.if_mapping_other_){
        iter = mapping_if_handler(obj, iter, type);
        iter = "@ " + iter + " @";
    }
    
    json_ = _.set(json_, path, iter);
}

function mapping_isNull_handler(iter, type, null_text){
    var output;
    if(type=="string"){
        output = `@ #if(!$custom.isNull(${iter})) "${iter}" #{else} "${null_text}" #end, @`;
    }
    else{
        output = `@ #if(!$custom.isNull(${iter}))  ${iter}  #{else} ${null_text} #end, @`;
    }
    
    return output;
}

function mapping_if_handler(obj, iter, type){
    var output;
    if(type=="string"){
        output = `#if(${obj.if_mapping_condition_}) "${iter}" #{else} "${obj.else_mapping_text_}" #end,`;
    }
    else{
        output = `#if(${obj.if_mapping_condition_})  ${iter}  #{else} ${obj.else_mapping_text_} #end,`;
    }
    
    return output;
}

function mapping_wrap(iter, iter_buffer, type, null_text){
    var output;
    if(type=="string"){
        output = `@ #if(!$custom.isNull(${iter}))  ${iter_buffer}  #{else} "${null_text}" #end, @`;
    }
    else{
        output = `@ #if(!$custom.isNull(${iter}))  ${iter_buffer}  #{else} ${null_text} #end, @`;
    }
    
    return output;
    
}

function custom_handler(obj, json_, s_map, t_map){
    var target_select = obj.target_custom_select_;
    var custom_response = obj.custom_response_;    
    var path = t_map.get(target_select).path;
    var type = t_map.get(target_select).type;
    
    
    if(obj.ifcheck_custom_other_){
        custom_response = custom_if_handler(obj, custom_response, type);

    }
    else{
        if(type!="string"){
            custom_response = `@ ${custom_response} -`;
        }
       
    }
    json_ = _.set(json_ , path, custom_response);
}

function custom_if_handler(obj, iter, type){
    var output;
    if(type=="string"){
        output = `@ #if(${obj.if_custom_condition_}) "${iter}" #{else} "${obj.else_custom_text_}" #end, @`;
    }
    else{
        output = `@ #if(${obj.if_custom_condition_})  ${iter}  #{else} ${obj.else_custom_text_} #end, @`;
    }
    
    return output;
}

function foreach_handler(obj, json_, s_map, t_map){
    var target_select = obj.target_for_each_select_;    
    var source_select = obj.source_for_each_select_;    
    var path = t_map.get(target_select).path;
    // console.log(json_);
    // console.log(json_.data[0].poExternalNumber);
    var text = s_map.get(source_select).text;
    var iterator = s_map.get(source_select).iterator;
    var statement = statement_generator( text, iterator);
    var footer = footer_generator();
    // console.log(path);
    // console.log(_.get(json_, path));
    _.get(json_, path).unshift(statement);    
    
    _.get(json_, path).push(footer);    
}

function statement_generator (text, iterator){
    var output = `@ #foreach($${text} in ${iterator}) @`;
    return output;
}

function footer_generator(){
    return `@ #if(!$foreach.last), #end #end @`;
}






module.exports = process;