const pluralize = require('pluralize')
const _ = require('lodash'); 
const { sortedLastIndex } = require('lodash');

function walk(obj, root,  get, root2, array_counter, iter) {   
    var data = [];       
    for (var key in obj) {         
        var item = {}; 
		var contents = {};    
		item["text"] = key;
        if(Array.isArray(obj[key])){    			
			array_counter++;
			
        }     
		
		
		contents["type"] = typeof obj[key];
		contents["array_no"] = array_counter;
		
		contents["iterator"] = iter + item.text + "." ;
		contents["path"] = root2 + item.text + '.';
		
		var path = root + item.text + '/';		
				
		get.set(path, contents);
                
        if ((obj[key] instanceof Object ) && !Array.isArray(obj[key])) {                
            item["children"] = walk(obj[key], root + item.text + '/', get, root2 + item.text + '.',  array_counter, iter + item.text +'.');                 
        }
		else if(Array.isArray(obj[key])){
			item["children"] = walk(obj[key], root + item.text + '/', get, root2 + item.text + '.',  array_counter, "$" + pluralize.singular(key) + ".");
		}
           
        data.push(item);  	
        
    }        
    return data;
}




 var king = {
	"authRequire": "Y",
	"data": [
		{
			"poExternalNumber": "",
			"buyerId": "",
			"buyerName": "",
			"supplierId": "",
			"supplierName": "",
			"paymentTerms": "",
			"commodityList": [
				{
					"commodityCode": "",
					"commodityName": "",
					"unitWeight": 0
				}
			],
			"programId": "",
			"preAccepted": "",
			"basePoAmount": 0
		}
	]
};

var source = {
	"orders": [
		{
			"referenceNo": "GHI",
			"externalReferenceId": null,
			"partyId": "",
			"partyName": "",
			"associatedParty": {
				"id": "",
				"name": "Ghalua",
				"address": null
			},
			"programCode": "",
			"programName": "",
			"grossAmount": 0,
			"preAccepted": false,
			"paymentTerms": "cash",
			"commodities": [
				{
					"code": "",
					"name": "",
					"weight": 0,
					"type":"A"					
				},
				{
					"code": "",
					"name": "",
					"weight": 0,
					"type":"B"	
				}
			]
		}
	]
};

var example = {
    "glossary": {
        "title": "example glossary",
		"GlossDiv": {
            "title": "S",
			"GlossList": {
                "GlossEntry": {
                    "ID": "SGML",
					"SortAs": "SGML",
					"GlossTerm": "Standard Generalized Markup Language",
					"Acronym": "SGML",
					"Abbrev": "ISO 8879:1986",
					"GlossDef": {
                        "para": "A meta-markup language, used to create markup languages such as DocBook.",
						"GlossSeeAlso": ["GML", "XML"]
                    },
					"GlossSee": "markup"
                }
            }
        }
    }
};

var root = "root<>/";

var map = new Map();

var root2 = "";
var json_string = JSON.stringify(source);
var json_data = JSON.parse(json_string);
var data = walk(json_data, root, map, root2, 0, "$body.");
// console.log(act_path);

function get_path(act_path){
		
		var split_arr = act_path.split('.');
		var j=0;
		while(j<split_arr.length){
			if(Number.isInteger(parseInt(split_arr[j]))){
				split_arr[j] = '[' + split_arr[j] + ']';
			}		
			j++;
			
		}
		
		for(var k=0; k<split_arr.length-1; k++){
			if(split_arr[k+1][0]=='['){
				split_arr[k] += split_arr[k+1];
				split_arr.splice(k + 1, 1);
			}
		}
		
		act_path = split_arr.join('.');	
		act_path = act_path.substring(0,act_path.length-1);
		
		return act_path;
	
	
}

function remove_num(iter){
	iter = iter.substring(0, iter.length - 1);
	var split_iter = iter.split(".");
	var j=0;
	for(var i=0; i<split_iter.length; i++){
		if(Number.isInteger(parseInt(split_iter[i]))){
			split_iter.splice(i, 1);
		}		
				
	}
	iter = split_iter.join('.');
	return iter
}


for (let [key, value] of  map.entries()) {
	value.path = get_path(value.path);
	value.iterator = remove_num(value.iterator);
	// console.log(key);
	// console.log( value)
	// if(value.type == 'string'){
	// 	console.log(_.get(source, value.path));
	// }
}

// var obj = {
// 	name : ["Hello", "Nello"],
// 	ganjubai : "Dhumdhadaka",
// }

// var path = 'name';
// _.get(obj, path).unshift("Jello");


// console.log(obj.name);
_.get(king, 'data[0].commodityList').unshift("hello");
console.log(_.get(king, 'data[0].commodityList'));

// king.data.unshift("@ Hello @");
// var string_ver = JSON.stringify(king);
// string_ver = string_ver.replace(/"@/g, "");
// string_ver = string_ver.replace(/@",/g, "");
// console.log(string_ver);
// console.log(king);
// console.log(king.data[1].commodityList);

// console.log(act_path[8]);
// console.log(_.get(source, act_path[8]));
// var jaggi = source["orders"]["0"]["commodities"]["1"];
// console.log(jaggi);




// console.log(json_data);
// console.log(json_string);
// function insert_foreach(dummy){
// 	var index = dummy.lastIndexOf('[');
// 	var init = dummy.substring(0, index+1);
// 	var final = dummy.substring(index+1);
// 	var foreach = "#foreach in bla bla";
// 	dummy = init + foreach + final;
// 	console.log(dummy);	
		
// }
// json_data.authRequire = "Hello";
//insert_foreach(json_string);
// console.log(JSON.parse(json_string).data[0].commodityList[]);
// console.log(json_data);
// var json_data = JSON.parse(json_string);
// console.log(json_data.data[0].paymentTerms);
// json_data.data[0].paymentTerms = "done";
// console.log(json_data.data[0].paymentTerms);

// var result = walk(json_data, root, target_menu);
//console.log(target_menu);

// var source_menu = [];
// var json_string_source = JSON.stringify(source);
// var json_data_source = JSON.parse(json_string_source);
// var result_source = walk(json_data_source, root, source_menu);
// console.log(source_menu);


// var sing = pluralize.singular('commodities');
// console.log(sing);


// var hi = () => {
// 	console.log("Hello World");
// }

// module.exports = {
// 	hi
// };





    
    // for(var i=0; i<mappings.length; i++){
    //     var item = {
    //         "session_id": sessionID,
    //         "mapping_check_": false,
    //         "custom_check_": false,
    //         "wrapper_check_": false,
    //         "foreach_check_": false,
    //     };
    //     if(mappings[i].mapping_check_){
    //         item["mapping_check_"] = true;
    //         item["target_mapping_select_"] = mappings[i].target_mapping_select_;
    //         item["source_mapping_select_"] = mappings[i].source_mapping_select_;
    //         if(mappings[i].if_mapping_isNull_){
    //             item["if_mapping_isNull_"] = true;
    //             item["if_mapping_isNull_else_"] = mappings[i].if_mapping_isNull_else_;

    //         }
    //         else{
    //             item["if_mapping_isNull_"] = false;
    //         }
    //         if(mappings[i].if_mapping_other_){
    //             item["if_mapping_other_"] = mappings[i].if_mapping_other_;
    //             item["if_mapping_condition_"] = mappings[i].if_mapping_condition_;
    //             item["else_mapping_text_"] = mappings[i].else_mapping_text_;
    //         }
    //         else{
    //             item["if_mapping_other_"] = false;
    //         }
    //     }
    //     else if(mappings[i].custom_check_){
    //         item["custom_check_"] = true;
    //         item["target_custom_select_"] = mappings[i].target_custom_select_;
    //         item["custom_response_"] = mappings[i].custom_response_;
    //         if(mappings[i].ifcheck_custom_other_){
    //             item["ifcheck_custom_other_"] = mappings[i].ifcheck_custom_other_;
    //             item["if_custom_condition_"] = mappings[i].if_custom_condition_;
    //             item["else_custom_text_"] = mappings[i].else_custom_text_;
    //         }
    //         else{
    //             item["ifcheck_custom_other_"] = false;
    //         }
    //     }
    //     else if(mappings[i].foreach_check_){
    //         map.set(mappings[i].source_for_each_select_, mappings[i].foreach_iterator_ )
    //         item["foreach_check_"] = true;
    //         item["target_for_each_select_"] = mappings[i].target_for_each_select_;
    //         item["source_for_each_select_"] = mappings[i].source_for_each_select_;
    //         item["foreach_iterator_"] = mappings[i].foreach_iterator_;
    //     }
    //     else if(mappings[i].wrapper_check_){
    //         item["wrapper_check_"] = mappings[i].wrapper_check_;
    //         item["wrapper_start_"] = mappings[i].wrapper_start_;
    //         item["wrapper_end_"] = mappings[i].wrapper_end_;
    //         item["wrapper_condition_"] = mappings[i].wrapper_condition_;
    //     }

    //     data.push(item);
    //     console.log(item);
    // }