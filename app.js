const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const crypto = require("crypto");
const multer = require('multer');
const fileRead = require('./helpers/fileRead');
const builder = require('./helpers/builder');
const processor = require('./helpers/processor');

const mongoose = require('mongoose');
const Jsonfile = require('./models/mapping');
const prettyPrint = require('./helpers/prettyPrint');
const fileExporter = require('./helpers/fileExporter');
const bodyParser = require('body-parser');
const _ = require('lodash');


const app = express();
app.use(express.static(__dirname + "/public"));

app.set('port', process.env.PORT || 3000);
const dbURI = "mongodb://iamshishir:shishir2000@cluster0-shard-00-00.nhzzd.mongodb.net:27017,cluster0-shard-00-01.nhzzd.mongodb.net:27017,cluster0-shard-00-02.nhzzd.mongodb.net:27017/jsontoolkit?ssl=true&replicaSet=atlas-nzsotq-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then((result) => {
        console.log('connected to db');
        app.listen(app.get('port'));
        console.log("Listening on port " + app.get('port'));

    })
    .catch((err) => {
        console.log(err);
    });




app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

var storage = multer.diskStorage(
    {
        destination: './uploads/',
        filename: function (req, file, cb) {

            cb(null, req.sessionID + ".json");
        }
    }
);

var upload = multer({ storage: storage });

app.get('/', (req, res) => {    
    res.render('home');
});

app.post('/menu', upload.single('file-to-upload'), (req, res) => {
    var info = fileRead(req.sessionID);
    const file = `${__dirname}/uploads/${req.sessionID}.json`;
    var fs = require('fs');
    fs.unlinkSync(file);

    var items = builder(info.source, info.target, info.map);
    console.log(info.name)
    const jsonfile = new Jsonfile({
        name: info.name,
        session_id: req.sessionID,
        source_body: info.source,
        target_body: info.target,
        source_paths: items.source_paths,
        target_paths: items.target_paths,
        source_result: items.source_result,
        target_result: items.target_result,
        mappings: info.data
    });
    var id;
    jsonfile.save()
        .then((result) => {
            console.log("Uploaded file saved successfully");
            id = result._id;
            var map = result.target_paths;
            var mapped_targets = new Set();
            var unmapped_targets = [];

            var data = result.mappings;

            for (var i = 0; i < data.length; i++) {
                if (data[i].mapping_check_) {
                    mapped_targets.add(data[i].target_mapping_select_);
                }
                else if (data[i].custom_check_) {
                    mapped_targets.add(data[i].target_custom_select_);
                }
            }
            for (let [key, value] of map.entries()) {
                if (!(mapped_targets.has(key)) && value.type != "object") {
                    unmapped_targets.push(key);
                }
            }
            res.render('first', { arr_source: JSON.stringify(items.source_result), arr_target: JSON.stringify(items.target_result), unmapped_targets, id });
        })
        .catch((err) => {
            console.log(err);
        });




});


app.post('/input', (req, res) => {
    res.render('index');
});


app.post('/loopselect', (req, res) => {
    const jsonfile = new Jsonfile({
        name: req.body.title,
        session_id: req.sessionID,
        source_body: req.body.source_file,
        target_body: req.body.target_file,
    });
    jsonfile.save()
        .then((result) => {
            console.log("Files Saved Successfully");
            var s_array = [];
            var t_array = [];
            var root = "root<>/"
            walk(JSON.parse(result.source_body), root, s_array);
            walk(JSON.parse(result.target_body), root, t_array);
            res.render('foreach', { s_array, t_array, id: result._id });
        })
        .catch((err) => {
            console.log(err);
        });
})



app.post('/menu/:id', (req, res) => {
    var src = [];
    var trgt = [];
    var iter = [];

    var src_map = new Map();
    for (const [key, value] of Object.entries(req.body)) {
        if (value[0] != "Select") {
            trgt.push(key);
            src.push(value[0]);
            iter.push(value[1]);
            src_map.set(value[0], value[1]);
        }
    }

    var data = [];
    trgt.forEach(function (item, i) {
        const id_ = crypto.randomBytes(16).toString("hex");
        var obj = {
            id: id_,
            mapping_check_: false,
            custom_check_: false,
            wrapper_check_: false,
            foreach_check_: true,
            target_for_each_select_: item,
            source_for_each_select_: src[i],
            foreach_iterator_: iter[i]
        };
        data.push(obj);

    });


    Jsonfile.findOne({ _id: req.params.id })
        .then((result) => {            
            var items = builder(result.source_body, result.target_body, src_map);
            Jsonfile.findOneAndUpdate({ _id: req.params.id, source_body: result.source_body, target_body: result.target_body },
                {
                    source_paths: items.source_paths, target_paths: items.target_paths, source_result: items.source_result,
                    target_result: items.target_result, $set: { mappings: data }
                },
                { new: true },
                function (err, doc) {
                    if (err) {
                        console.log("Something wrong when updating data!");
                    }
                    else {
                        var map = items.target_paths;
                        var unmapped_targets = [];
                        for (let [key, value] of map.entries()) {
                            if (value.type != "object") {
                                unmapped_targets.push(key);
                            }
                        }
                        res.render('first', { arr_source: JSON.stringify(items.source_result), arr_target: JSON.stringify(items.target_result), unmapped_targets, id: req.params.id });
                    }
                });

        })
        .catch((err) => {
            console.log(err);
        });
});


app.get('/menu/:id', (req, res) => {  

    Jsonfile.findOne({ _id: req.params.id })
        .then((data) => {

            var map = data.target_paths;
            var mapped_targets = new Set();
            var unmapped_targets = [];

            var result = data.mappings;

            for (var i = 0; i < result.length; i++) {
                if (result[i].mapping_check_) {
                    mapped_targets.add(result[i].target_mapping_select_);
                }
                else if (result[i].custom_check_) {
                    mapped_targets.add(result[i].target_custom_select_);
                }
            }
            for (let [key, value] of map.entries()) {
                if (!(mapped_targets.has(key)) && value.type != "object") {
                    unmapped_targets.push(key);
                }
            }            
            res.render('first', { arr_source: JSON.stringify(data.source_result), arr_target: JSON.stringify(data.target_result), unmapped_targets, id: req.params.id });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/menu/:id/new/', (req, res) => {    
    Jsonfile.findOne({ _id: req.params.id })
        .then((result) => {
            res.render('second', { source: result.source_paths, target: result.target_paths, arr_target: JSON.stringify(result.target_result), id: req.params.id });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post('/menu/:id/new/', (req, res) => {   
    var mapping_check = false; var custom_check = false; var wrapper_check = false;
    if (req.body.hasOwnProperty('map_check')) {
        mapping_check = true;
        var if_mapping_isNull; var source_mapping_select; var target_mapping_select; var if_mapping_other;
        target_mapping_select = req.body.target_mapping_select;
        source_mapping_select = req.body.source_mapping_select;
        var if_mapping_isNull_else;
        if (req.body.hasOwnProperty('if_mapping_isNull')) {
            if_mapping_isNull = true;
            if (req.body.if_mapping_isNull_else == '') {
                if_mapping_isNull_else = "";
            }
            else {
                if_mapping_isNull_else = req.body.if_mapping_isNull_else;
            }

        }
        else {
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

    const id_ = crypto.randomBytes(16).toString("hex");
    console.log(id_);
    var item = {
        id: id_,

        mapping_check_: mapping_check,
        target_mapping_select_: target_mapping_select,
        source_mapping_select_: source_mapping_select,
        if_mapping_isNull_: if_mapping_isNull,
        if_mapping_isNull_else_: if_mapping_isNull_else,
        if_mapping_other_: if_mapping_other,
        if_mapping_condition_: if_mapping_condition,
        else_mapping_text_: else_mapping_text,


        custom_check_: custom_check,
        target_custom_select_: target_custom_select,
        custom_response_: custom_response,

        ifcheck_custom_other_: ifcheck_custom_other,
        if_custom_condition_: if_custom_condition,
        else_custom_text_: else_custom_text,

        foreach_check_: false,

        wrapper_check_: wrapper_check,
        wrapper_start_: wrapper_start,
        wrapper_end_: wrapper_end,
        wrapper_condition_: wrapper_condition,
    };

    Jsonfile.findOneAndUpdate({ _id: req.params.id }, { $push: { mappings: item } }, function (err, doc) {
        if (err) {
            console.log(err);
        }
        else {            
            console.log("Mapping saved successfully");
            res.redirect(`/menu/${req.params.id}`);
        }
    });
});

app.get('/menu/:id/mappings/', (req, res) => {    
    Jsonfile.findOne({ _id: req.params.id })
        .then((item) => {
            //console.log(result);
            var result = item.mappings;
            var mappings = []; var customs = []; var foreachs = []; var wrappers = [];
            result.forEach((record) => {
                if (record.mapping_check_ === true) {
                    mappings.push(record);
                }
                else if (record.custom_check_ === true) {
                    customs.push(record);
                }
                else if (record.foreach_check_ === true) {
                    foreachs.push(record);

                }
                else {
                    wrappers.push(record);
                }
            });
            var s_array = [];
            var t_array = [];
            var root = "root<>/"
            walk(JSON.parse(item.source_body), root, s_array);
            walk(JSON.parse(item.target_body), root, t_array);
            res.render('view_mappings', { mappings, customs, foreachs, wrappers, s_array, t_array, id: req.params.id })
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post('/menu/:id/mappings', (req, res) => {

    var src = [];
    var trgt = [];
    var iter = [];

    var src_map = new Map();
    for (const [key, value] of Object.entries(req.body)) {
        if (value[0] != "Select") {
            trgt.push(key);
            src.push(value[0]);
            iter.push(value[1]);
            src_map.set(value[0], value[1]);
        }
    }

    var data = [];
    trgt.forEach(function (item, i) {
        var obj = {
            mapping_check_: false,
            custom_check_: false,
            wrapper_check_: false,
            foreach_check_: true,
            target_for_each_select_: item,
            source_for_each_select_: src[i],
            foreach_iterator_: iter[i]
        };
        data.push(obj);

    });


    Jsonfile.findOne({ _id: req.params.id })
        .then((result) => {            
            var items = builder(result.source_body, result.target_body, src_map);
            var array = [];            
            for (var i = 0; i < result.mappings.length; i++) {
                if (result.mappings[i].foreach_check_ == false) {
                    array.push(result.mappings[i]);
                }
            }           
            for (var i = 0; i < data.length; i++) {
                array.push(data[i]);
            }            
            var mappings = []; var customs = []; var foreachs = []; var wrappers = [];
            for (var i = 0; i < array.length; i++) {
                const id_ = crypto.randomBytes(16).toString("hex");
                array[i]["id"] = id_;
                if (array[i].mapping_check_ === true) {
                    mappings.push(array[i]);
                }
                else if (array[i].custom_check_ === true) {
                    customs.push(array[i]);
                }
                else if (array[i].foreach_check_ === true) {
                    foreachs.push(array[i]);

                }
                else {
                    wrappers.push(array[i]);
                }
            }

            var s_array = [];
            var t_array = [];
            var root = "root<>/"
            walk(JSON.parse(result.source_body), root, s_array);
            walk(JSON.parse(result.target_body), root, t_array);

            Jsonfile.findOneAndUpdate({ _id: req.params.id },
                {
                    source_paths: items.source_paths, target_paths: items.target_paths, source_result: items.source_result,
                    target_result: items.target_result, $set: { mappings: array },
                },
                function (err, doc) {
                    if (err) {
                        console.log("err");
                    }
                    else {
                        res.render('view_mappings', { mappings, customs, foreachs, wrappers, s_array, t_array, id: req.params.id })
                    }
                });
        })
        .catch((err) => {
            console.log(err);
        })
});

app.post('/typeDisplay/:id', (req, res) => {      
    Jsonfile.findOne({ _id: req.params.id })
        .then((result) => {
            var value;
            if (req.body.flag == 1) {
                var pass = result.source_paths.get((req.body.datum)).type;
                var iter = result.source_paths.get((req.body.datum)).iterator;
            }
            else {
                var pass = result.target_paths.get((req.body.datum)).type;
                value = result.target_paths.get((req.body.datum)).value;
                var iter = null;
            }            
            res.send({ type: pass, iterator: iter, value });
        })
        .catch((err) => {
            console.log(err);
        });
});


app.post('/foreach/:id', (req, res) => {    
    Jsonfile.findOne({ _id: req.params.id })
        .then((result) => {
            var text = result.source_paths.get(req.body.foreach_source).text;
            var iterator = result.source_paths.get(req.body.foreach_source).iterator;
            res.send({ text, iterator });
        })
        .catch((err) => {
            console.log(err);
        })
});

app.post('/targetsearch/:id', (req, res) => {
    var target = req.body.target;
    Jsonfile.findOne({ _id: req.params.id })
        .then((result) => {
            var mappings = result.mappings;
            var count = 0;            
            for (var i = 0; i < mappings.length; i++) {
                if ((mappings[i].mapping_check_ && target == mappings[i].target_mapping_select_) || (mappings[i].custom_check_ && target == mappings[i].target_custom_select_)) {
                    count++;
                }
            }
            if (count > 0) {
                res.send({ msg: true });
            }
            else {
                res.send({ msg: false });
            }
        })
        .catch((err)=>{
            console.log(err);
        });

});


app.post('/deleteMapping/:id', (req, res) => {
    Jsonfile.findOneAndUpdate({ _id: req.params.id }, { $pull: { mappings: { id: req.body.id } } }, function (err, doc) {
        if (err) {
            console.log(err);
            res.send({ msg: false });
        }
        else {
            console.log("Deleted mapping successfully");
            res.send({ msg: true });
        }
    });

});

app.post('/deleteAll/:id', (req, res) => {
    Jsonfile.findOne({ session_id: req.sessionID })
        .then((result) => {
            var mappings = result.mappings;
            var new_array = [];
            for (var i = 0; i < mappings.length; i++) {
                if (mappings[i].foreach_check_ == true) {
                    new_array.push(mappings[i]);
                }
            }
            Jsonfile.findOneAndUpdate({ _id: req.params.id }, { $set: { mappings: new_array } }, function (err, doc) {
                if (err) {
                    console.log(err);
                }
                else {

                    res.redirect(`/menu/${req.params.id}`);
                }
            });
        })
        .catch((err) => {
            console.log(err);
        })

});


app.get('/menu/:id/preview', (req, res) => {
    Jsonfile.findOne({ _id: req.params.id })
        .then((result) => {

            var target = result.target_body;
            target = JSON.parse(target);


            var source_map = result.source_paths;
            var target_map = result.target_paths;
            var mappings = result.mappings;
            var obj = processor(target, source_map, target_map, mappings);
            var pretty = JSON.stringify(obj, undefined, 4);

            pretty = prettyPrint(pretty);

            res.render('preview', { pretty, id: req.params.id });

        })
        .catch((err) => {
            console.log(err);
        });

});

app.get('/download/:id', (req, res) => {
    Jsonfile.findOne({ _id: req.params.id })
        .then((result) => {
            fileExporter(result, req.params.id, result.name);
            const file = `${__dirname}/export_files/${result.name}_${req.params.id}.json`;
            res.download(file, `${result.name}_${req.params.id}.json`, (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    var fs = require('fs');
                    fs.unlinkSync(file);
                    console.log("Successfully deleted downloaded file");
                }
            });
        })
        .catch((err) => {
            console.log(err);
        })


});

app.post('/goHome/:id', (req, res) => {
    Jsonfile.deleteOne({ _id: req.params.id })
        .then((result) => {
            console.log("Deleted jsonfiles");
            res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
        });
});

app.use((req, res) => {
    res.status(404).render('404');
});


function walk(obj, root, get) {
    for (var key in obj) {
        var path = root + key + '/';
        if (Array.isArray(obj[key])) {
            get.push(path);
        }

        if (obj[key] instanceof Object) {
            walk(obj[key], path, get);
        }

    }
}




