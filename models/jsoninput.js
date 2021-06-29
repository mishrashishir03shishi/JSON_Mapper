const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const jsoninput = new Schema({
    session_id : {
        type : String,
        required : true
    },
    source_body : {
        type: String,
        required: true,
        unique : true
    },
    target_body : {
        type : String,
        required: true,
        unique : true
    },
    source_paths : {
        type : Map,        
    },
    target_paths : {
        type : Map,        
    },
    source_result : {
        type : []
    },
    target_result : {
        type :   []
    },    
    
});




const Jsonfile = mongoose.model('Jsonfile', jsoninput);

module.exports = Jsonfile;