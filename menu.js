const for_menu_maker = function(obj, root,  get){
    for (var key in obj) {              
        var path = root + key + '/';
        if(Array.isArray(obj[key])){    			
			get.push(path);
        }     
        
        if (obj[key] instanceof Object ) {                
            walk(obj[key], path, get);                 
        }	    	
        
    }   
}

module.exports = for_menu_maker;