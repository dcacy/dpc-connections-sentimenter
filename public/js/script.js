/**
 *
 *********************** IBM COPYRIGHT START  *********************************
// @copyright(disclaimer)
//
// Licensed Materials - Property of IBM
// 5724-L31
// (C) Copyright IBM Corp. 2017. All Rights Reserved.
//
// US Government Users Restricted Rights
// Use, duplication or disclosure restricted by GSA ADP Schedule
// Contract with IBM Corp.
//
// DISCLAIMER OF WARRANTIES :
//
// Permission is granted to copy and modify this Sample code, and to
// distribute modified versions provided that both the copyright
// notice, and this permission notice and warranty disclaimer appear
// in all copies and modified versions.
//
// THIS SAMPLE CODE IS LICENSED TO YOU "AS-IS".
// IBM  AND ITS SUPPLIERS AND LICENSORS  DISCLAIM
// ALL WARRANTIES, EITHER EXPRESS OR IMPLIED, IN SUCH SAMPLE CODE,
// INCLUDING THE WARRANTY OF NON-INFRINGEMENT AND THE IMPLIED WARRANTIES
// OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT
// WILL IBM OR ITS LICENSORS OR SUPPLIERS BE LIABLE FOR ANY DAMAGES ARISING
// OUT OF THE USE OF  OR INABILITY TO USE THE SAMPLE CODE, DISTRIBUTION OF
// THE SAMPLE CODE, OR COMBINATION OF THE SAMPLE CODE WITH ANY OTHER CODE.
// IN NO EVENT SHALL IBM OR ITS LICENSORS AND SUPPLIERS BE LIABLE FOR ANY
// LOST REVENUE, LOST PROFITS OR DATA, OR FOR DIRECT, INDIRECT, SPECIAL,
// CONSEQUENTIAL,INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER CAUSED AND REGARDLESS
// OF THE THEORY OF LIABILITY, EVEN IF IBM OR ITS LICENSORS OR SUPPLIERS
// HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
//
// @endCopyright
//*********************** IBM COPYRIGHT END  ***********************************
 *
 */
/*jshint jquery:true*/
/*global dateFormat*/

var connectionsData = {};

//function saveCSV() {
//  console.log('in saveCSV');
//  console.log('going to send ', connectionsData);
//  // convert to CSV
//  $.ajax({
//    type: "GET",
//    url: "/makeCSV",
//    //dataType: 'json',
//    // json: JSON.parse(connectionsData),
////    json: connectionsData,
//    headers: {
//      'Content-Type': 'application/json',
//      'accept':'*/*'
//    },
//    // beforeSend : function(xhrObj) {
//		// 	xhrObj.setRequestHeader("Content-Type", "application/json");
//		// },
//    success: function (data, status, jq){
//      console.log('success');
//    },
//    error: function (xhr, ajaxOptions, thrownError) {
//      console.log(xhr.status);
//      console.log(thrownError);
//    }
//});
//
//}


function getResults() {
  console.log('in getResults');
  document.getElementById('errorMessage').innerHTML = '';
  $('#pleaseWait').mask('Please Wait...<br/><img src="/images/watson.gif">',200);

	if ( $.fn.dataTable.isDataTable( '#resultsTable' ) ) {
    $('#resultsTable').DataTable().destroy();
	}
	$('#resultsTable').hide();
  $('#saveCSVWrapper').hide();

  $.ajax({
    type: "GET",
    url: "/getHits",
    dataType: 'json',

    success: function (data, status, jq) {
    	console.log(data);
//    	success: function (data, status, jq) {
        var table = $('#resultsTable').DataTable( {
        	data: data,
//        responsive: true,
        autoWidth: false,
//        "columns": [
////            {
////                "className": 'details-control',
////                "defaultContent": ''
////            },
////            { "data": "topic" },
//            { "data": "author" },
//            { "data": "updated" },
//            { "data": "likes" },
//            { data: "sentiment"},
//            { "data": "summary" }
//        ],
        "columnDefs" : [
          { "title": "Topic", data: "topic", "targets": 0 },
          { "title": "Author", data: "author", "targets": 1 },
          { "title": "Date", data: "updated", className: "dateColumn dt-body-left", "targets": 2, render: function(data, type) {
		      		// if type is display or filter, then format the date
		      		if ( type === 'display' || type === 'filter') {
		      			return dateFormat(new Date(data), 'dd mmm yyyy h:MM:sstt');
		      		} else {
		      			// otherwise it must be for sorting so return the raw value
		      			return data;
		      		}
		      	}
		      },
	        { title: "Likes", data: "likes", "targets": 3 },
	        { title: "Sentiment", data: "sentiment", className: "dt-body-left", targets: 4 , render: function(data, type, row) {
//	        	console.log('data is', data,' and row is', row);
	        	return data + ' (' + row.sentimentScore + ')';
	        }},
	        { title: "Joy", data: "joy", targets: 5},
	        { title: "Sadness", data: "sadness", targets: 6},
	        { title: "Fear", data: "fear", targets: 7},
	        { title: "Disgust", data: "disgust", targets: 8},
	        { title: "Anger", data: "anger", targets: 9},
          { title: "Post", data: "summary", "targets": 10 },
          { className: "dt-body-left", "targets": [ 2, 10 ] }
	//          { "width": "10%", "targets": 0 },
	//          { "width": "40%", "targets": 1 },
	//          { "width": "40%", "targets": 2 },
	//          { "width": "10%", "targets": 3 }
	        ]
      });

        $('#resultsTable').show();
      $('#pleaseWait').unmask();
      $('#saveCSVWrapper').show();

    },
    error: function (xhr, ajaxOptions, thrownError) {
      console.log(xhr.status);
      console.log(thrownError);
      document.getElementById('errorMessage').innerHTML = 'An error has occurred: ' + thrownError;
      $('#pleaseWait').unmask();
    },
    always: function() {
    	$('#pleaseWait').unmask();

    }
  });
}


//function formatDate(connectionsDate) {
//  // date looks like 2016-09-30T01:04:49.546Z
//	var dateIso = connectionsDate.split('T');
//	var time = dateIso[1].split("."); // we don't care about 10ths of a second
//	var splitIso = dateIso[0].split("-");
//	var uYear = splitIso[0];
//	var uMonth = splitIso[1];
//	var uDay = splitIso[2];
//	// var uDate = uMonth + '-' + uDay + '-' + uYear + ' ' + time[0] + ' UTC';
//  var uDate = splitIso + ' ' + time[0] + ' UTC';
//	return uDate;
//}
