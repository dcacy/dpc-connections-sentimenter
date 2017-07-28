var express = require('express');
var cfenv = require('cfenv');
var app = express();

// var bodyParser = require('body-parser');
var json2csv = require('json2csv');
var session = require('express-session');

var forums = require('./modules/forums');
var watson = require('./modules/watson-nlu');
var testdata = require('./modules/testdata');

var appEnv = cfenv.getAppEnv();

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'shh-its-a-secret',
  cookie: {
      maxAge: 1000 * 60 * 60
  }
}));


// read parameters from a properties file
// var propertiesReader = require('properties-reader');
// var properties = propertiesReader('./connections_gatherer.properties');

require('dotenv').config({silent: true, path: 'local.env'});

// var connections_host = properties.get('connections_host');
// var connections_userid = properties.get('connections_userid');
// var connections_password = properties.get('connections_password');
// var communityUuid = properties.get('communityUuid');

// we have a TEST mode so we can test the rendering without making calls to Watson
var run_mode = process.env.RUN_MODE;//properties.get('RUN_MODE');
if ( run_mode === 'TEST' ) {
  console.log('starting in test mode');
} else {
  console.log('starting in production mode');
}





/**
 * this will export the Connections data to a CSV file
 * @param none
 * @returns {string} a CSV of Connections data
 */
app.get('/makeCSV', function(req, res) {
  /*  If the user clicked the button to get data from Connections,
  then there should be an object in session. We save the object to avoid
  unnecessary calls to Watson, which costs money.
  */
  if ( req.session.data ) {
  	var fields = [ "topic", "author", "userid", "likes", "updated", "summary", "sentiment", "sentimentScore", "joy", "sadness", "fear", "disgust", "anger"];
  	var csv = json2csv({ data: req.session.data, fields: fields});
    res.attachment('output.csv');
    res.end(csv);
  } else {
    console.log('did not find data in session');
    res.end('no data found');
  }
});


/**
* this call will get the data from Connections
* @param none
* @return {object} json containing the data from Connections
*/
app.get('/getHits', function(req, res) {
  console.log('in getHits; mode =', run_mode);
  if ( run_mode == 'TEST') {
    setTimeout(function() {
      var result = testdata.getTestData();
      req.session.data = result;
      res.json(result);
    }, 3000);
  } else {
   getForumData()
   .then((data) => {
  		console.log('success getting data');
      req.session.data = data;
  		res.json(data);
   })
  	.catch((err) => {
  		console.log('error getting data:', err);
  		res.status(500).json(err);
  	});
  }
});

/**
* This function does the work of getting the data from Connections.
* It first gets all the Topics in a community.  Then for each topic,
* it gets all its replies.  It puts all of this into an array, and
* then calls Watson to get tone and sentiment.
* @param none
@ @return {object} a Promise which resolves to json containing the data from Connections
*/
function getForumData() {
	return new Promise( (resolve, reject) => {
		forums.getForumTopics()
		.then(function(topics) {
			var promises = [];
      var results = [];
			for (var i = 0; i < topics.length; i++) {
        results.push(topics[i]);
				promises.push(forums.getForumReplies(topics[i]));
			}
		  Promise.all(promises).then(function(allData) {
		  	// flatten results
		  	for (var j = 0; j < allData.length; j++ ) {
		  		for ( var k = 0; k < allData[j].replies.length; k++ ) {
		  			results.push( {
		  				topic : allData[j].topic.title,
		  				author : allData[j].replies[k].author,
		  				userid : allData[j].replies[k].userid,
		  				likes : allData[j].replies[k].likes,
		  				updated : allData[j].replies[k].updated,
		  				summary: allData[j].replies[k].summary
		  			});
		  		}
			  }
        resolve(results);
//         watson.getSentiment(results)
// 		  	.then((sentimented) => {
// //		  		console.log('success calling getSentiment');
// 		  		resolve(sentimented);
// 		  	})
// 		  	.catch((err) => {
// 		  		console.log('error calling getSentiment:', err);
// 		  		reject(err);
// 		  	});

		  })
		  .catch((err) => {
		  	console.log('error resolving the promises:', err);
		  	reject(err);
		  });
		})
		.catch(function(err){
			console.log('error!', err);
			console.dir(err);
			console.log('type is', typeof err);
			console.log('stringified:',JSON.stringify(err));
			reject(err);
		});
	});
}

app.use(express.static(__dirname + '/public'));

app.listen(appEnv.port || 3001, '0.0.0.0', function() {
  console.log('server starting on ', appEnv.url);
});
