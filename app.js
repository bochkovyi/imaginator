"use strict";
const request = require('request');
const fs = require('fs');

const URI = 'https://static.panoramio.com.storage.googleapis.com/photos/1920x1280/';
const FILE_EXTENTION = ".jpg";
const IMAGE_DIRECTORY = "./downloads/";
const LOG_FILE_DIRECTORY = "./logs/";
const MIN = 76;
const MAX = 134628776;
const REQUEST_LIMIT = 20;

let numberOfPictures = 0;
let downloadedPictures = 0;
let errorNumber = 0;

mkdirSync(IMAGE_DIRECTORY);
mkdirSync(LOG_FILE_DIRECTORY);

if (process.argv[2]) {
	numberOfPictures = +process.argv[2];
	if (numberOfPictures > REQUEST_LIMIT) {
		console.log(`Download limit is ${REQUEST_LIMIT}`);
		process.exit();
	}

	for (let i = 0; i < numberOfPictures; i++) {
		let random = randomIntFromInterval(MIN,MAX);
		let timeout = +(i + "000");
		setTimeout(()=> getOneAndSave(random), timeout);
	}
} else {
	console.log("USAGE: node app number");
}

function getOneAndSave(imageNumber) {
	request(URI + imageNumber + FILE_EXTENTION, { encoding: 'binary' }, function (error, response, body) {
		if ( response.statusCode !== 200 ) {
			let retry = randomIntFromInterval(MIN,MAX);
			setTimeout(()=> getOneAndSave(retry), 4000);
			writeLog(`Error: ${response.statusCode} number ${++errorNumber}\n`);
			
		} else {
			fs.writeFile(IMAGE_DIRECTORY + imageNumber + FILE_EXTENTION, body, 'binary', function (err) {
				if (err) console.log(err) 
				process.stdout.write(".");
				checkComplete();
			});
		}
	});
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function checkComplete() {
	if (++downloadedPictures >= numberOfPictures) {
		console.log(`\nDownloaded ${downloadedPictures} pictures`);
		process.exit();
	}
}
function writeLog(msg) {
	fs.appendFile(LOG_FILE_DIRECTORY + "log.txt", msg, function (err) { if (err) console.log(err)});
}

function mkdirSync (path) {
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}
