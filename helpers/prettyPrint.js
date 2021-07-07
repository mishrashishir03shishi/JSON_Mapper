const prettyPrint = function resultGenerator(pretty) {
    pretty = pretty.replace(/"@/g, "");
    pretty = pretty.replace(/@",/g, "");         
    pretty = pretty.replace(/@"/g, "");            
    pretty = pretty.replace(/\\/g, "");
    pretty = pretty.replace(/-"/g, "");
    pretty = pretty.replace(/"if_[0-9]+": /g, "");
    pretty = pretty.replace(/"end_[0-9]+": /g, "");
    var regex = /foreach.last/g, result, indices = [];
    while ( (result = regex.exec(pretty)) ) {
        indices.push(result.index);
    }
    for(var i=0; i<indices.length; i++){
        var index = indices[i];
        while(true){
            if(pretty.charAt(index) == ','){
                pretty = pretty.substring(0, index) + pretty.substring(index+1);
                // console.log(index);
                break;
            }
            else{
                index--;
            }
        }
    }
    return pretty; 
}

module.exports = prettyPrint;