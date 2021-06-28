const express = require('express');

const builder = require('./builder');
const processor = require('./processor');
const pluralize = require('pluralize')
const mongoose = require('mongoose');
const Jsonfile = require('./models/jsoninput');
const Mapping = require('./models/mapping');
const bodyParser = require('body-parser');
// const { result } = require('lodash');

const app = express();
app.set('port', process.env.PORT || 3000);
const dbURI = "mongodb://iamshishir:shishir2000@cluster0-shard-00-00.nhzzd.mongodb.net:27017,cluster0-shard-00-01.nhzzd.mongodb.net:27017,cluster0-shard-00-02.nhzzd.mongodb.net:27017/jsontoolkit?ssl=true&replicaSet=atlas-nzsotq-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        console.log('connected to db');
        app.listen(app.get('port'));
        //console.log("Hello");
    })
    .catch((err) => {
        console.log(err);
    });


app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/public"));


app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', (req, res) => {
    res.render('index');
});

app.post('/loopselect', (req, res)=>{
    const jsonfile = new Jsonfile({
        source_body : req.body.source_file,
        target_body : req.body.target_file,
    });
    // jsonfile.testFunc(); 
    jsonfile.save()
        .then((result) => {            
            console.log("Files Saved Successfully");
            
            var s_array = [];
            var t_array = [];
            var root = "root<>/"
            walk(JSON.parse(result.source_body), root, s_array);
            walk(JSON.parse(result.target_body), root, t_array);
            res.render('foreach', { s_array, t_array});
        })
        .catch((err) => {
            console.log(err);
        });
})



app.post('/menu', (req, res) => {
    console.log(req);
    var src= [];
    var trgt = [];
    var iter = [];
    var src_map = new Map();    
    for (const [key, value] of Object.entries(req.body)) {
        if(key!="iterator"){
            trgt.push(key);
            src.push(value);
            
        }
        else{
            iter = value;
            
        }
    }
    if(src.length>1){
        for(var i=0; i<src.length; i++){
            src_map.set(src[i], iter[i]);
        }
    }
    else{
        src_map.set(src[0], iter);
    }
    
    trgt.forEach(function(item, i){
        const mapping = new Mapping({
            mapping_check_ : false,
            custom_check_ : false,
            wrapper_check_ : false,
            foreach_check_ : true,
            target_for_each_select_ : item,
            source_for_each_select_ : src[i],            
        });
        mapping.save()
            .then((result)=>{
                console.log('foreach saved');
            })
            .catch((err)=>{
                console.log(err);
            });
            
    });
    
    Jsonfile.find({})
        .then((result)=>{
            // var data = result;
            var items = builder(result[0].source_body, result[0].target_body, src_map);
            Jsonfile.findOneAndUpdate({source_body:result[0].source_body, target_body:result[0].target_body}, 
                {source_paths : items.source_paths, target_paths: items.target_paths, source_result : items.source_result, target_result : items.target_result},
                {new : true},
                function(err, doc){
                    if (err) {
                        console.log("Something wrong when updating data!");
                    }
                    else{
                        
                        var map = items.target_paths;                
                        var unmapped_targets = [];
                        for (let [key, value] of  map.entries()) {
                            if(value.type!="object"){
                                unmapped_targets.push(key);
                            }
                        }
                        res.render('first', { arr_source: JSON.stringify(items.source_result), arr_target: JSON.stringify(items.target_result), unmapped_targets });
                    }
                });

        })
        .catch((err)=>{
            console.log(err);
        })
        
    
});


app.get('/menu', (req, res) => {
    Jsonfile.find({})
        .then((result) => {     
            var data = result;
            var map = result[0].target_paths;
            var mapped_targets = new Set();
            var unmapped_targets = [];
            Mapping.find({})
                .then((result)=>{
                    // console.log(result);
                    for(var i=0; i<result.length; i++){
                        if(result[i].mapping_check_){
                            mapped_targets.add(result[i].target_mapping_select_);
                        }
                        else if(result[i].custom_check_){
                            mapped_targets.add(result[i].target_custom_select_);
                        }                                               
                    }
                    for (let [key, value] of  map.entries()) {
                        if(!(mapped_targets.has(key)) && value.type!="object"){
                            unmapped_targets.push(key);
                        }
                    }
                    // console.log(unmapped_targets);
                    res.render('first', { arr_source: JSON.stringify(data[0].source_result), arr_target: JSON.stringify(data[0].target_result), unmapped_targets });
                })  
                .then((err)=>{
                    console.log(err);
                })       
            
        })
        .catch((err) => {
            console.log(err);
        });  
});

app.get('/menu/new/', (req, res) => {
    Jsonfile.find({})
        .then((result) => {                 
            res.render('second', { source: result[0].source_paths, target: result[0].target_paths, arr_target: JSON.stringify(result[0].target_result)});
        })
        .catch((err) => {
            console.log(err);
        });    
});

app.post('/menu/new/', (req, res) => {
    console.log(req.body);
    var mapping_check = false; var custom_check = false; var wrapper_check = false; 


    if (req.body.hasOwnProperty('map_check')) {
        mapping_check = true;
        var if_mapping_isNull; var source_mapping_select; var target_mapping_select; var if_mapping_other;
        target_mapping_select = req.body.target_mapping_select;
        source_mapping_select = req.body.source_mapping_select;
        var if_mapping_isNull_else;
        if(req.body.hasOwnProperty('if_mapping_isNull')){
            if_mapping_isNull = true;
            if(req.body.if_mapping_isNull_else==''){
                if_mapping_isNull_else = "";
            }
            else{
                if_mapping_isNull_else = req.body.if_mapping_isNull_else;
            }
            
        }
        else{
            if_mapping_isNull = false;
        }
        if (req.body.hasOwnProperty('if_mapping_other')) {
            if_mapping_other = true;
           
            var if_mapping_condition = req.body.if_mapping_condition;
            var else_mapping_text = req.body.else_mapping_text;           
            
        }
        else {
            if_mapping_other = false;

        }        
    }
    else if (req.body.hasOwnProperty('cust_check')) {
        custom_check = true;
        var ifcheck_custom_other = false; var custom_response;
        var target_custom_select;  
        target_custom_select = req.body.target_custom_select;
        custom_response = req.body.custom_response;
        
        if (req.body.hasOwnProperty('ifcheck_custom_other')) {
            ifcheck_custom_other = true;
            var if_custom_condition = req.body.if_custom_condition;
            var else_custom_text = req.body.else_custom_text;
                     
        }
        
    }
    else if (req.body.hasOwnProperty('wrapper_check')) {
        wrapper_check = true;
        var wrapper_start, wrapper_end, wrapper_condition;
        wrapper_start = req.body.wrapper_start;
        wrapper_end = req.body.wrapper_end;
        wrapper_condition = req.body.wrapper_condition;        
        
    }
    

    const mapping = new Mapping({

        mapping_check_ : mapping_check,        
        target_mapping_select_: target_mapping_select,
        source_mapping_select_: source_mapping_select,
        if_mapping_isNull_ : if_mapping_isNull,
        if_mapping_isNull_else_ : if_mapping_isNull_else,
        if_mapping_other_: if_mapping_other,
        if_mapping_condition_ : if_mapping_condition,        
        else_mapping_text_: else_mapping_text,
        
        
        custom_check_: custom_check,        
        target_custom_select_: target_custom_select,
        custom_response_ : custom_response,
        
        ifcheck_custom_other_: ifcheck_custom_other,
        if_custom_condition_ : if_custom_condition,
        else_custom_text_: else_custom_text, 
        
        foreach_check_ : false,

        wrapper_check_ : wrapper_check,
        wrapper_start_ : wrapper_start,
        wrapper_end_ : wrapper_end,
        wrapper_condition_ : wrapper_condition,
    });

    mapping.save()
        .then((result) => {
            console.log("Mapping Saved Successfully");
        })
        .catch((err) => {
            console.log(err);
        });

    res.redirect('/menu');


});

app.post('/typeDisplay', (req, res)=>{
    // console.log(Object.keys(req.body)[0]);   
    Jsonfile.find({})   
        .then((result)=>{
            var value;
            if(req.body.flag==1){
                var pass = result[0].source_paths.get((req.body.datum)).type;
                var iter = result[0].source_paths.get((req.body.datum)).iterator;
            }
            else{
                var pass = result[0].target_paths.get((req.body.datum)).type;
                value = result[0].target_paths.get((req.body.datum)).value;
                var iter = null;
            }
                
            // console.log(pass);
            res.send({type : pass, iterator :iter, value});
        })
        .catch((err)=>{
            console.log(err);
        })
});

app.post('/foreach', (req, res)=>{
    console.log(req.body);
    Jsonfile.find({})
        .then((result)=>{
            var text = result[0].source_paths.get(req.body.foreach_source).text;
            var iterator = result[0].source_paths.get(req.body.foreach_source).iterator;
            res.send({text, iterator});
        })
        .catch((err)=>{
            console.log(err);
        })
});

app.post('/targetsearch', (req, res)=>{
    var target = req.body.target;
    Mapping.count({$or : [{target_mapping_select_ : target},{target_custom_select_ : req.body.target}]}, function(err, count){
        if(err){
            console.log(err);
        }
        else if(count>0){
            res.send({msg : true});
        }
        else{
            res.send({msg : false})
        }
    })
});

app.post('/deleteMapping', (req, res)=>{
    Mapping.findOneAndDelete({_id : req.body.id}, function(err, doc){
        if(err){
            console.log(err);
        }
        else{
            res.send({msg : true});
        }
    })
});

app.post('/deleteAll', (req, res)=>{
    Mapping.deleteMany({})
        .then(()=>{
            console.log('All Mappings Deleted!');
            res.redirect('/menu');
        })
        .catch((err)=>{
            console.log(err);
        })
});

app.get('/menu/mappings/', (req, res) => {
    Mapping.find({})
        .then((result) => {
            //console.log(result);
            var mappings = []; var customs = []; var foreachs = []; var wrappers = [];
            result.forEach((record) => {
                if (record.mapping_check_ === true) {
                    mappings.push(record);
                }
                else if (record.custom_check_ === true) {
                    customs.push(record);
                }
                else if(record.foreach_check_ === true) {
                    foreachs.push(record);
                }
                else{
                    wrappers.push(record);
                }
            })
            res.render('view_mappings', { mappings, customs, foreachs, wrappers })
        })
        .catch((err) => {
            console.log(err);
        });
});


//To be edited
app.get('/menu/preview/', (req, res) => {
    var jsonfiles; var mappings;
    Jsonfile.find({})
        .then((result) => {                
            jsonfiles = result;
             Mapping.find({})
            .then((result) => {
                mappings = result;
                var obj = processor(jsonfiles, mappings);
                var pretty = JSON.stringify(obj, undefined, 4);
                
                pretty = resultGenerator(pretty);
                
             
                res.render('preview', {pretty});
            })
            .catch((err)=>{
                console.log(err);
            });
        })
        .catch((err) => {
            console.log(err);
        });    
    
});

app.use((req, res) => {
    Mapping.deleteMany({})
        .then((result) => {
            // res.redirect('/');
            console.log("Deleted mappings");
        })
        .catch((err) => {
            console.log(err);
        });

    Jsonfile.deleteMany({})
        .then((result) => {
            console.log("Deleted jsonfiles");
        })
        .catch((err) => {
            console.log(err);
        });
    res.status(404).render('404');
});


function walk(obj, root,  get){
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

function resultGenerator(pretty) {
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

