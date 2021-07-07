const builder = function(source_body, target_body, src_map){
    source_paths = new Map();
    target_paths = new Map();

    source_result = source_walk(JSON.parse(source_body),"root<>/", source_paths, "", 0, "$body.", 0, src_map, 0);
    target_result = target_walk(JSON.parse(target_body),"root<>/", target_paths, "", 0, 0);
    
    for (let [key, value] of  source_paths.entries()) {
        value.path = get_path(value.path);      
        value.iterator = remove_num(value.iterator);  
    }
    for (let [key, value] of  target_paths.entries()) {
		var parent = value.path.substring(0, value.path.length-1);
		var index =  parent.lastIndexOf('.');
		parent = parent.substring(0, index);
		parent = parent + '.';
		parent = get_path(parent);
		value["parent"] = parent;
        value.path = get_path(value.path);   
	       
    }
    return {
        source_paths, target_paths, source_result, target_result
    };
    
}


function source_walk(obj, root,  get, root2, array_counter, iter, distance, src_map, array_flag) {   
    var data = [];       
	
    for (var key in obj) {         
        var item = {}; 
		var contents = {};  
        var path = root + key + '/';  
		item["text"] = key;
		var identity = 1;
		var iter_id;
		contents["text"] = key;
		var subs = iter;
		// console.log(key + " -> " + array_flag);
		var lush = 0;
        if(Array.isArray(obj[key])){    			
			array_counter++;
			contents["isArray"] = true;            
            if(src_map.has(path)){                
                var josh = src_map.get(path);
                iter_id = key;
                identity = 0;
				contents["text"] = josh;
				
            }
			else{
				if(Number.isInteger(parseInt(key)) && array_flag!=1){
					iter_id = '[' + key + ']';
					lush = 1;
				}
				else{
					iter_id = key;
				}	
					
			}
        }     
        else{
			if(Number.isInteger(parseInt(key)) && array_flag!=1){
				iter_id = '[' + key + ']';
				lush = 1;
			}
			else{
				iter_id = key;
			}
			
            contents["isArray"] = false;
            
        }
        
        contents["distance"] = distance;
		
		contents["type"] = typeof obj[key];
		contents["array_no"] = array_counter;
		if(lush==1){
			subs = subs.substring(0, iter.length-1);			
		}
		contents["iterator"] = subs + iter_id + "." ;
		contents["path"] = root2 + item.text + '.';
		if(obj[key]==null){	
            contents["type"] = 'null';
        }
				
				
		get.set(path, contents);
                
        if ((obj[key] instanceof Object ) && identity) {                
            item["children"] = source_walk(obj[key], root + item.text + '/', get, root2 + item.text + '.',  array_counter, subs + iter_id +'.', ++distance, src_map,0);                 
        }
		else if(identity == 0){
			item["children"] = source_walk(obj[key], root + item.text + '/', get, root2 + item.text + '.',  array_counter, "$" + josh + ".", ++distance, src_map,1);
		}
           
        data.push(item);  	
        
    }        
    return data;
}


function target_walk(obj, root,  get, root2, array_counter, distance) {   
    var data = [];   
	var heir = 0.00;    
    for (var key in obj) {         
        var item = {}; 
		var contents = {};  
        var path = root + key + '/';  
		item["text"] = key;
        if(Array.isArray(obj[key])){    			
			array_counter++;
			contents["isArray"] = true;
            
        }     
        else{
            contents["isArray"] = false;
            
        }        
        contents["distance"] = distance;		
		contents["type"] = typeof obj[key];
		contents["array_no"] = array_counter;		
		contents["heirarchy"] = distance + heir;
		heir += 0.01;
		contents["path"] = root2 + item.text + '.';
		if(obj[key]==null){
            contents["type"] = 'string';
        }			
		if(!(obj[key] instanceof Object )){
			contents["value"] = obj[key];
		}	
				
		get.set(path, contents);
                
        if ((obj[key] instanceof Object )) {                
            item["children"] = target_walk(obj[key], root + item.text + '/', get, root2 + item.text + '.',  array_counter, ++distance );                 
        }
		
        data.push(item);  	
        
    }        
    return data;
}

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


module.exports = builder;