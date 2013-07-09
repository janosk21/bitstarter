#!/usr/bin/env node
/*
 Automatically grade files for the presence of specified HTML tags/attributes.
 Uses commander.js and cheerio. Teaches command line application development
 and basic DOM parsing.

 References:

 + cheerio
 - https://github.com/MatthewMueller/cheerio
 - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
 - http://maxogden.com/scraping-with-node.html

 + commander.js
 - https://github.com/visionmedia/commander.js
 - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
 - http://en.wikipedia.org/wiki/JSON
 - https://developer.mozilla.org/en-US/docs/JSON
 - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
 */

var rest = require('restler');
var cheerio = require('cheerio');
var fs = require('fs');
var program = require('commander');

var HTMLFILE_DEFAULT = "index.html";
var HEROKU_URL = "http://rocky-ravine-8302.herokuapp.com/";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function (infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLExists = function (infile) {
    var instr = infile.toString();
    rest.get(instr).on('complete', function (result) {
        if (result instanceof Error) {
            console.log("%s does not exist. Exiting.", instr);
            process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
        }
    });
    return instr;
};


var getHerokuData = function (checksfile) {
    var response2console = function (result) {
        if (result instanceof Error) {
            console.error('Error: ' + result);
        } else {

            console.log(result);
            $ = cheerio.load(result);
            var checks = loadChecks(checksfile).sort();
            var out = {};
            for (var ii in checks) {
                var present = $(checks[ii]).length > 0;
                out[checks[ii]] = present;
            }

            var outJson = JSON.stringify(out, null, 4);
            console.log(outJson);
        }
    };
    return response2console;
};


var loadChecks = function (checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function (herokuurl, checksfile) {
    var herokuURLStream = getHerokuData(checksfile);
    rest.get(herokuurl).on('complete', herokuURLStream);

};

var clone = function (fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};


if (require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <check_url>', 'Path to Heroku URL', clone(assertURLExists), HEROKU_URL)
        .parse(process.argv);
    checkHtmlFile(program.url, program.checks);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}


