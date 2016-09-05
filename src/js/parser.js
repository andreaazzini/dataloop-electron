var csvtojson = require("csvtojson")
  , fs = require("fs")
  , partyConverter = new csvtojson.Converter({})
  , topicConverter = new csvtojson.Converter({})
  , database = process.argv[2]
  , collection = process.argv[3];

partyConverter.on("end_parsed", function (jsonArray) {
    key = Object.keys(jsonArray[0])[0];
    array = [key];
    for (obj in jsonArray) {
        array.push(jsonArray[obj][key]);
    }
    fs.writeFileSync("./data/json/parties/" + database + ".json", JSON.stringify(array), 'utf8');
});

topicConverter.on("end_parsed", function (jsonArray) {
    key = Object.keys(jsonArray[0])[0];
    array = [key];
    for (obj in jsonArray) {
        array.push(jsonArray[obj][key]);
    }
    fs.writeFileSync("./data/json/topics/" + collection + ".json", JSON.stringify(array), 'utf8');
});

fs.createReadStream("./data/csv/parties/" + database + ".csv").pipe(partyConverter);
fs.createReadStream("./data/csv/topics/" + collection + ".csv").pipe(topicConverter);
