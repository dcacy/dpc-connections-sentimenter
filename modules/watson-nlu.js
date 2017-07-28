require('dotenv').config({silent: true, path: 'local.env'});

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const nlu = new NaturalLanguageUnderstandingV1({
  version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2017_02_27
});


/**
* Call Watson Natual Language Understanding to get sentiment and tone for the array of text items
* @param array of text
* @return a Promise which resolves to data containg the result of
* the Natural Language Understanding API call for all text items
*/
exports.getSentiment = function(data) {
	'use strict';

	return new Promise( (resolve, reject) => {
		var promises = [];
		var timeout = 0;
	  for (let i = 0; i < data.length; i++) {
	  	let delay = i * 500; // every Promise delays a half-second more than the previous one
  		promises.push(makePromise(data[i], delay));
	  }
  	Promise.all(promises)
  	.then((result) => {
  		console.log('in promise.all');
  		resolve(result);
  	})
  	.catch((err) => {
  		console.log('error in one of the getSentiment promises:', err);
  		reject(err);
  	});
	});

};

/**
* Call Watson NLU for each text item
* @param data {object} JSON containing the text to analyze
* @return {object} a Promise resolving to the original JSON object, plus the Watson analysis
*/
function makePromise(data, delay) {
	return new Promise((resolve,reject) => {
    // have to have a delay because the Watson API complains if you invoke it too fast
  	setTimeout(function() {
  		console.log('delaying ', delay);
  		var payload = {
  			  "text": data.summary,
  			  "features": {
  			    "sentiment": {},  // we want sentiment and emotion
  			    "emotion": {}
  			  }
  			};
  			nlu.analyze(payload, (err, results) => {
  		    if (err) {
  		      console.log('error in analysis!', err);
  		      reject(err);
  		    } else {
  		      console.log('success calling analysis');
            // add to the JSON
  		      data.sentiment = results.sentiment.document.label;
  		      data.sentimentScore = results.sentiment.document.score;
  			    data.joy = results.emotion.document.emotion.joy;
  			    data.sadness = results.emotion.document.emotion.sadness;
  			    data.fear = results.emotion.document.emotion.fear;
  			    data.disgust = results.emotion.document.emotion.disgust;
  			    data.anger = results.emotion.document.emotion.anger;
  			    resolve(data);
  		    }
  		  });
  	}, delay);
	});
}
