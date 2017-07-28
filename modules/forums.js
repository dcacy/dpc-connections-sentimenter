/* jshint latedef:nofunc */
var S = require('string');
var rp = require('request-promise');
var xml2js = require('xml2js-es6-promise');
// var propertiesReader = require('properties-reader');
// var properties = propertiesReader('./connections_gatherer.properties');
require('dotenv').config({silent: true, path: 'local.env'});

var connections_host = process.env.connections_host;
var connections_userid = process.env.connections_userid;
var connections_password = process.env.connections_password;
var communityUuid = process.env.communityUuid;

/**
*  Get all topics from a specific forum
* @param none
* @return {object} a Promise which resolves to json containing topic data
*/
exports.getForumTopics = function() {
	return new Promise( (resolve, reject) => {
	  var connections_path = `/communities/service/atom/community/forum/topics?communityUuid=${communityUuid}`;
	  var options = {
		    method: 'GET',
		    uri: `https://${connections_host}${connections_path}`,
		    'auth': {
		      'user': `${connections_userid}`,
		      'pass': `${connections_password}`
		    },
		    json: false // don't parse the result as JSON, since it's XML
		};
		rp(options)
	  .then((result) => {
			//	convert XML to JSON and then find the data we want
	  	xml2js(result)
	  	.then((json) => {
	  		var topics = [];
	  		for (var i = 0; i < json.feed.entry.length; i++) {
	  			var id = json.feed.entry[i].id[0].substring(json.feed.entry[i].id[0].lastIndexOf(':') + 1);

					// scrub the content
	  			var cleanedContent = (S(json.feed.entry[i].content[0]._.replace(/(\r\n|\n|\r|&nbsp;)/gm," ")).stripTags().s).trim();
	  			cleanedContent = cleanedContent.replace(/ +(?= )/g,'');

					// get likes
					var likes = json.feed.entry[i].link.find(function(link) {
		      		return link.$.rel === 'recommendations';
		      	}).$['snx:recommendation'];

					// we will keep this subset of the data
	  			var topic = {
	  					id: id,
							topic: '[parent]',
	  					title: json.feed.entry[i].title[0]._,
							summary: cleanedContent,
							updated: json.feed.entry[i].published[0],
							author: json.feed.entry[i].author[0].name[0],
							userid: json.feed.entry[i].author[0]["snx:userid"][0]._,
							likes: likes
	  			};
	  			topics.push(topic);
	  		}
	  		resolve(topics);
	  	})
	  	.catch((err) => {
	  		console.log('error in parsing xml', err);
	  		reject('error in parsing xml');
	  	});
	  })
	  .catch(function (err) {
	  	console.log(err);
	  	var msg = err.statusCode ? {error:"Error calling Connections", statusCode: err.statusCode, statusMessage: err.statusMessage} : err;
	      console.log(msg);
	      reject(msg);
	  });
	});
};

/**
* Get all replies for a specific topic
* @param {object} json containing a topic
* @return {object} a promise which resolves to json containing the replies to a topic
*/
exports.getForumReplies = function(topic) {
	return new Promise( (resolve, reject) => {
	  var connections_path = `/forums/atom/replies?topicUuid=${topic.id}&ps=100`;
	  var options = {
		    method: 'GET',
		    uri: `https://${connections_host}${connections_path}`,
		    'auth': {
		      'user': `${connections_userid}`,
		      'pass': `${connections_password}`
		    },
		    json: false // don't convert the result to JSON, since it's XML
		};
		rp(options)
	  .then((result) => {
	  	parseRepliesFeed(result)
	  	.then((parsedResults) => {
	  		resolve({topic:topic, replies:parsedResults});
	  	})
	  	.catch((err) => {
	  		console.log('error in parsing:', err);
	  		reject(err);
	  	});
	  })
	  .catch(function (err) {
	  	console.log(err);
	  	var msg = err.statusCode ? {error:"Error calling Connections", statusCode: err.statusCode, statusMessage: err.statusMessage} : err;
	      console.log(msg);
	      reject(msg);
	  });
	});
};

/**
* Parse the XML feed to pull out just the values we want
* @param {string} the XML of replies to a topic
* @return {object} a Promise which resolves to a subset of the XML, converted to JSON
*/
function parseRepliesFeed(result) {
	return new Promise( (resolve, reject) => {

		xml2js(result)
		.then((parsedXml) => {
	    var entries = parsedXml.feed.entry;
	    var replies = [];
	    for (var i = 0; i < entries.length; i++) {

	      // a deleted reply will still show up in the list, so check for it
	      var deleted = entries[i].category.find(function(category) {
	      		return category.$.term === 'deleted';
	      });
	      if ( typeof deleted === 'undefined') {
		      var id = entries[i].id[0];
		      var title = entries[i].title[0]._;
		      var author = entries[i].author[0].name[0];
		      var userid = entries[i].author[0]["snx:userid"][0]._;
		      var updated = entries[i].updated[0];

		      // we want the number of likes, which is in one of the links elements
		      var likes = entries[i].link.find(function(link) {
		      		return link.$.rel === 'recommendations';
		      	}).$['snx:recommendation'];

		      var summary = cleanText(entries[i].content[0]._);

		      replies.push(
		        {
		          'id':id.substring(id.lastIndexOf(":") + 1),
		          'summary':summary,
		          'author':author,
		          'userid':userid,
		          'likes': likes,
		          'updated':updated
		        }
		      );
		    }
	    }
			resolve(replies);
		})
		.catch((err) => {
			console.log('error in parsing replies:', err);
			reject(err);
		});
	});
}

/**
* Utility function to strip out HTML, carriage returns, and other unnecessary strings
* @param string the text to clean
* @return string the cleaned text
*/
function cleanText(text) {
	var cleanedContent = '';
	if ( typeof text !== 'undefined') {
		// remove new lines, crriage returns, html tags
		cleanedContent = (S(text.replace(/(\r\n|\n|\r|&nbsp;)/gm," ")).stripTags().s).trim();
		// remove multiple spaces
		cleanedContent = cleanedContent.replace(/ +(?= )/g,'');
	}
	return cleanedContent;
}
