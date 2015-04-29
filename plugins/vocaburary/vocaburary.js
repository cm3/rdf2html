/**
* Vocaburary plugin
*
* Adds all data it can find in the N3 db
* @author: Pieter Colpaert
* @author: Michiel Vancoillie
* @author: Akihiro Kameda
*/

var $ = require('jquery');

// Main closure
module.exports =  function(db, container, prefixes) {
    var list_temp = []
    db.find(null, null, null).forEach(function (data) {list_temp.push(data["subject"])});
    var list_remain = list_temp.filter(function (x, i, self) {return self.indexOf(x) === i;}); //kill duplication
    list_remain = addAbout(db, container, prefixes,list_remain);
    list_remain = addClasses(db, container, prefixes, list_remain );
    list_remain = addProperties(db, container, prefixes, list_remain);
    list_remain = addMisc(db, container, prefixes, list_remain);
};

    // Add 2 column table row
    var createTableRow = function (col1, col2) {
        var row = $('<tr></tr>');
        row.append('<td class="col1">' + col1 + '</td>');
        row.append('<td class="col2">' + col2 + '</td>');
        return row;
    }

    var resource2Html = function (db, resource, prefixes) {
        var rows = [];

            // Get all triples for resource
            db.find(resource, null, null).forEach(function (data) {

                // Add prefix to blank nodes to display level
                var prefix = "";
                if (isBlank(resource)) {
                    console.log("blank node is ignored... [TODO]")
                    //
                    //for (var i = 0; i < level ; i++) {
                    //    prefix += "&raquo; ";
                    //}
                }

                var predicate = prefix +  linkify(data.predicate, prefixes);
                var object = "";

                // Check for blank nodes / URI's / Literals
                if (isBlank(data.object)){
                    // container.append('<p><span class="predicate">'+ prefix +  linkify(data.predicate, prefixes) +'</span><span class="object"></span></p>');
                    // resource2Html(data.object, triples, level+1);
                } else if (isIRI(data.object) ) {
                    object = linkify(data.object, prefixes);
                } else if (isLiteral(data.object)){
                    object = getLiteralValue(data.object);
                }

                // Add row
                rows.push(createTableRow(predicate, object));
            });

        return rows;
    };

var addAbout = function (db, container, prefixes, list_remain) {
    var self_url = window.location.href.replace(location.hash,"");
    console.log(self_url);
    list_remain.splice(list_remain.indexOf(self_url), 1);
    var triples = db.find(self_url, null, null);
 
    if (triples.length > 0) { 
        subjectContainer = $('<h4>About this Namespace</h4><div id="rdf2html-about"></div>');

        var table = $('<table class="triples table table-hover"></table>');
        table.append(resource2Html(db, self_url, prefixes));
        subjectContainer.append(table);
                    
        container.append(subjectContainer);
    }
    
    return list_remain 
};

 
var addClasses = function (db, container, prefixes, list_remain) {

    var triples = db.find(null, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/2000/01/rdf-schema#Class");
    
    if (triples.length > 0) {
        container.append('<h4>Classes</h4><div id="rdf2html-classes"></div>');

        triples.forEach(function (data) {
            if (data["subject"] != ""){
                var subjectContainer = $("#rdf2html-classes").append("<h5>" + linkify(data["subject"]) + "</h5>");
                list_remain.splice(list_remain.indexOf(data["subject"]), 1);

                var table = $('<table class="triples table table-hover"></table>');
                table.append(resource2Html(db, data["subject"], prefixes));
                subjectContainer.append(table);
                
                container.append(subjectContainer);
            }
        });
    }
     return list_remain
};

var addProperties = function (db, container, prefixes, list_remain) {
    
    var triples = db.find(null, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type","http://www.w3.org/1999/02/22-rdf-syntax-ns#Property");

    if (triples.length > 0) {
        container.append('<h4>Propaties</h4><div id="rdf2html-propaties"></div>');

        triples.forEach(function (data) {
            if (data["subject"] != ""){
                var subjectContainer = $("#rdf2html-propaties").append("<h5>" + linkify(data["subject"]) + "</h5>");
                list_remain.splice(list_remain.indexOf(data["subject"]), 1);

                var table = $('<table class="triples table table-hover"></table>');
                table.append(resource2Html(db, data["subject"], prefixes));
                subjectContainer.append(table);
                
                container.append(subjectContainer);
            }
        });
    }
    
     return list_remain
};

var addMisc = function (db, container, prefixes, list_remain) {
    if (list_remain.length > 0) {
        container.append('<h4>Misc</h4><div id="rdf2html-misc"></div>');

        list_remain.forEach(function (data) {
                var subjectContainer = $("#rdf2html-misc").append("<h5>" + linkify(data) + "</h5>");
                list_remain.splice(list_remain.indexOf(data), 1);
                
                var table = $('<table class="triples table table-hover"></table>');
                table.append(resource2Html(db, data, prefixes));
                subjectContainer.append(table);
                
                container.append(subjectContainer);
        });
    }    
    return list_remain
};
