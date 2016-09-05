var fs = require('fs')
  , database = process.argv[2]
  , collection = process.argv[3]
  , filename = 'data/shared/' + collection + '.json'
  , json = JSON.parse(fs.readFileSync(filename, 'utf8'));

var newJson = {}
  , termsJson = {}
  , hashtagsJson = {}
  , usernamesJson = {};

var terms = []
  , hashtags = []
  , usernames = [];

for (obj in json) {
    json[obj].name = json[obj]._id;
    json[obj].size = json[obj].value;
    delete json[obj]._id;
    delete json[obj].value;

    var first_char = json[obj].name[0];
    if (first_char == '#') {
      hashtags.push(json[obj]);
    } else if (first_char == '@') {
      usernames.push(json[obj]);
    } else {
      terms.push(json[obj]);
    }
}

termsJson.name = 'terms';
termsJson.children = terms;

hashtagsJson.name = 'hashtags';
hashtagsJson.children = hashtags;

usernamesJson.name = 'usernames';
usernamesJson.children = usernames;

newJson.name = process.argv[2];
newJson.children = [termsJson, hashtagsJson, usernamesJson];

fs.writeFileSync(filename, JSON.stringify(newJson), 'utf8');
