const fileExporter = function generate_export(jsonfiles, mappings, session_id){
    // console.log(jsonfiles);
    var source_body = jsonfiles[0].source_body;
    var target_body = jsonfiles[0].target_body;
    
    
    var obj = {
        source : source_body,
        target : target_body,
        transformations : mappings,
    }
    // console.log(obj);

    var json = JSON.stringify(obj);
    var fs = require('fs');
    fs.writeFile('./export_files/' + session_id + '.json', json, 'utf8', function (err) {
        if (err) throw err;               console.log('Results Received');
      }); 
}

module.exports = fileExporter;