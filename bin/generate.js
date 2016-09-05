#!/usr/bin/env node

var fs = require("fs");

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var _getAllFilesFromFolder = function(dir) {
    var results = [];

    fs.readdirSync(dir).forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);
    });

    for (i in results) {
        console.log(results[i])
        results[i] = results[i].split('dataloop/bin/../data/shared/')[1];
        results[i] = results[i].split('.json')[0];
    }

    return results.filter(function(e) { return e[0] != '.' });
};

var navTemplate = function(names) {
    var template =
`<div class="container-fluid">
  <div class="navbar-header">
    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
      <span class="sr-only">Toggle navigation</span>
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
    </button>
    <a class="navbar-brand" href="/">Dataloop</a>
  </div>

  <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
    <ul class="nav navbar-nav">`

    for (i in names) {
        name = names[i];
        if (i == 0) {
            template += '<li><a href="./' + name + '">' + name.capitalize() + ' <span class="sr-only">(current)</span></a></li>'
        } else {
            template += '<li><a href="./' + name + '">' + name.capitalize() + '</a></li>'
        }
    }

    template +=
`</ul>
    </div>
  </div>
</div>
`
    return template;
}

var htmlTemplate = function(name) {
    var template =
`<html>
  <head>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    <script>
      $(function(){
        $("nav").load("navbar.html");
      });
    </script>
  </head>

  <body>
    <nav class="navbar navbar-default"></nav>
    <div class="container">
      <div class="row">
        <div class="col-md-12 svg-container">
          <script src="//d3js.org/d3.v3.min.js"></script>
          <script>
            var diameter = 960,
                format = d3.format(",d"),
                color = d3.scale.category10();

            var bubble = d3.layout.pack()
                .sort(null)
                .size([diameter, diameter])
                .padding(1.5);

            var svg = d3.select(".svg-container").append("svg")
                .attr("width", diameter)
                .attr("height", diameter)
                .attr("class", "bubble");

            d3.json("../data/shared/` + name + `.json", function(error, root) {
              if (error) throw error;

              var node = svg.selectAll(".node")
                  .data(bubble.nodes(classes(root))
                  .filter(function(d) { return !d.children; }))
                  .enter().append("g")
                  .attr("class", "node")
                  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

              node.append("title")
                  .text(function(d) { return d.className + ": " + format(d.value); });

              node.append("circle")
                  .attr("r", function(d) { return d.r; })
                  .style("fill", function(d) { return color(d.packageName); });

              node.append("text")
                  .attr("dy", ".3em")
                  .style("text-anchor", "middle")
                  .text(function(d) { return d.className.substring(0, d.r / 3); });
            });

            // Returns a flattened hierarchy containing all leaf nodes under the root.
            function classes(root) {
              var classes = [];

              function recurse(name, node) {
                if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
                else classes.push({packageName: name, className: node.name, value: node.size});
              }

              recurse(null, root);
              return {children: classes};
            }

            d3.select(self.frameElement).style("height", diameter + "px");
          </script>
        </div>
      </div>
    </div>
  </body>
</html>
`
    return template;
}

var routeTemplate = function(name) {
    var template =
`var express = require('express')
  , router = express.Router();

router.get('/', function (req, res) {
    res.sendFile('` + name + `.html', {root: './public/'});
});

module.exports = router;
`;
    return template;
}

var appTemplate = function(names) {
    var template =
`var server = require('http').createServer()
  , url = require('url')
  , express = require('express')
  , app = express()
  , port = 8080`

    for (i in names) {
        name = names[i];
        template += "\n  , " + name + " = require('./routes/" + name + "')"
    }
    template += ";\n"

    template +=
`
app.use(express.static(__dirname + '/public'));
app.use('/data', express.static(__dirname + '/data'));
app.get('/', function (req, res) {
    res.sendFile('` + names[0] + `.html', {root: './public/'});
});
`

    for (i in names) {
        name = names[i];
        template += "\napp.use('/" + name + "', " + name + ");"
    }

    template +=
`

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });
`
    return template;
}

var generateNavbar = function(files) {
    fs.writeFileSync(__dirname + "/../public/navbar.html", navTemplate(files), 'utf8');
}

var generateHtml = function(name) {
    fs.writeFileSync(__dirname + "/../public/" + name + '.html', htmlTemplate(name), 'utf8');
}

var generateRoute = function(name) {
    fs.writeFileSync(__dirname + "/../routes/" + name + '.js', routeTemplate(name), 'utf8');
}

var generateApp = function(files) {
    fs.writeFileSync(__dirname + "/../app.js", appTemplate(files), 'utf8');
}

var files = _getAllFilesFromFolder(__dirname + "/../data/shared");

console.log("Generating HTML...");
if (!fs.existsSync("public")) {
    fs.mkdirSync("public");
}
generateNavbar(files);
for (file in files) {
    generateHtml(files[file]);
}

console.log("Generating routes...");
if (!fs.existsSync("routes")) {
    fs.mkdirSync("routes");
}
for (file in files) {
    generateRoute(files[file]);
}

console.log("Generating app...");
generateApp(files);

console.log("Done!");
