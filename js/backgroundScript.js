// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// A generic onclick callback function.
function genericOnClick(info, tab) {

  var wordServerDomain = 'http://localhost:8042';

  var searchWord = info.selectionText.toLowerCase().replace(/\.$/, "").trim();
  var requestUrl = wordServerDomain + '/words/' + searchWord;
  var wordPromise = new Promise(function(resolve, reject) {
      $.get(requestUrl, function(data) {
        console.log('Fetched meaning: ');
        console.log(data);
        resolve(JSON.parse(data));
      })
      .fail(function() {
        resolve({error: '500'});
      });
  });

  // Send message to open modal
  var msgPromise = new Promise(function(resolve, reject) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {text: searchWord, type: 'open_modal'}, function(response) {
        if(response.modal_opened) {
          resolve(wordPromise)
        }
        else {
          reject("couldn't open modal")
        }
      })
    });
  })

  // After modal is opened, send the dictionary meanings to show in the modal
  msgPromise
  .then(function(dictionaryResponse) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {text: searchWord, type: 'dictionary_response', dictionaryResponse: dictionaryResponse}, function(response) {

      })
    });
  })
}


var contexts = ["selection"];              
for (var i = 0; i < contexts.length; i++) {
  var context = contexts[i];
  var title = 'Get meaning for "%s"';
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
  console.log("'" + context + "' item:" + id);
}

