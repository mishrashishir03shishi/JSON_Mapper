const fileExporter = function generate_export(jsonfiles,  session_id, name_){
    // console.log(jsonfiles);
    var source_body = jsonfiles.source_body;
    var target_body = jsonfiles.target_body;
    var title = jsonfiles.name;
    var mappings = jsonfiles.mappings;
    
    
    var obj = {
        title : title, 
        source : source_body,
        target : target_body,
        transformations : mappings,
    }
    // console.log(obj);

    var json = JSON.stringify(obj);
    var fs = require('fs');
    fs.writeFileSync('./export_files/' + name_ + '_' + session_id + '.json', JSON.stringify(obj));
}

module.exports = fileExporter;