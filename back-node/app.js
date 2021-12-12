const express = require("express");
const multer = require("multer");
const fs = require("fs");
const upload = multer({dest: 'uploads/'})
const RussianStemmer = require('snowball-stemmer.jsx/dest/russian-stemmer.common.js').RussianStemmer;

// Init express app
const app  = express()
const jsonParser = express.json();
const parser  = express.urlencoded({extended: false});
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/downloads"));
app.use(parser);
app.use(jsonParser);


// Some settings.
const stemmer = new RussianStemmer();
const file_extension = ".csv";
const problems = loadStemmingProblems("problems.json");



app.post("/api/test", upload.single("file"), (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    console.log(request.file);
    let fileData;

    try {
        let data = fs.readFileSync(request.file.destination + request.file.filename, "utf8");
        fileData = data;
    } catch(err) {
        console.log(err);
        response.statusCode = 500;
        response.send(err);
    }

    // Do stuff with `fileData`
    fileData = fileData.toUpperCase();

    try {
        let date = new Date();
        let filename = `${date.getFullYear()}.${date.getMonth()}.${date.getMonth()}__${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}__${date.getMilliseconds()}` + file_extension;
        fs.writeFileSync("downloads/" + filename, fileData);

        let responseData = {
            url: filename,
            text: fileData
        }

        response.send(JSON.stringify(responseData));
    } catch (err) {
        console.log(err);
        response.statusCode = 500;
        response.send(err);
    }


    try {
        fs.unlinkSync(request.file.destination + request.file.filename);
        console.log("Файл был удалён.")
    } catch (err) {
        console.log("Ошибка при удалении файла.")
        console.log(err);
    }

});

app.listen(7788, () => {
    console.log("Сервер запущен...");
});



function loadStemmingProblems(path) {
    let data = fs.readFileSync(path, "utf8");
    data = JSON.parse(data);
    console.log(data);
    return (data);
}