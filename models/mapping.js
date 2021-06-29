const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mappingSchema = new Schema({
    session_id : {
        type : String,
        required : true
    },

    
    mapping_check_ : {
        type : Boolean,
        required : true
    },    
    target_mapping_select_ : {
        type : String,  
        required : mappingCheckHandler    
    },
    source_mapping_select_ : {
        type : String,
        required : mappingCheckHandler
    },
    if_mapping_isNull_ : {
        type : Boolean,     
        required : mappingCheckHandler 
    },
    if_mapping_isNull_else_ : {
        type : String,    
        
    },
    if_mapping_other_ : {
        type: Boolean,
        required : mappingCheckHandler
    },
    if_mapping_condition_ : {
        type : String,
        required : ifMappingCheckHandler
    },
    else_mapping_text_ : {
        type : String,
        required : ifMappingCheckHandler
    },
   
    

    custom_check_ : {
        type : Boolean,
        required : true
    },    
    target_custom_select_ : {
        type : String,
        required : customCheckHandler       
    },
    custom_response_ : {
        type : String,  
        required : customCheckHandler      
    },    
    ifcheck_custom_other_ : {
        type : Boolean,
        required : customCheckHandler
    },
    if_custom_condition_ : {
        type : String,
        required : ifCustomCheckHandler
    },
    else_custom_text_ : {
        type : String,
        required : ifCustomCheckHandler
    },
  

    foreach_check_ : { 
        type : Boolean,
        required : true
    },
    target_for_each_select_ : {
        type:String,
        required : forEachCheckHandler
    },
    source_for_each_select_ : {
        type:String,
        required : forEachCheckHandler
    },
    foreach_iterator_ : {
        type :String,
        required : forEachCheckHandler
    },
    

    wrapper_check_ : {
        type : Boolean,
        required : true
    },
    wrapper_start_ : {
        type:String,
        required : wrapperCheckHandler
    },
    wrapper_end_ : {
        type:String,
        required : wrapperCheckHandler
    },
    wrapper_condition_ : {
        type:String,
        required : wrapperCheckHandler
    }

});

function isNullmappingCheckHandler(){
    if(this.mapping_check_ === true && this.if_mapping_isNull_ === true)  
        return true;
    else    
        return false;
}

function mappingCheckHandler(){
    if(this.mapping_check_ === true)  
        return true;
    else    
        return false;
}

function customCheckHandler(){
    if(this.custom_check_ === true)  
        return true;
    else    
        return false;
}


function ifMappingCheckHandler(){
    if(this.mapping_check_ === true && this.if_mapping_other_ === true)  
        return true;
    else    
        return false;
}


function ifCustomCheckHandler(){
    if(this.custom_check_ === true && this.ifcheck_custom_other_ === true)  
        return true;
    else    
        return false;
}

function forEachCheckHandler(){
    if(this.foreach_check_ === true)  
        return true;
    else    
        return false;
}

function wrapperCheckHandler(){
    if(this.wrapper_check_ === true)
        return true;
    else
        return false;
}

const Mapping = mongoose.model('Mapping', mappingSchema);

module.exports = Mapping;