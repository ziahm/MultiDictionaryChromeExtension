chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    var noMeaningTxt = 'No Meaning Found.'
    var networdkErrorTxt = 'Network error.';

    var searchWord = request.text.toLowerCase().replace(/\.$/, "").trim();

    // Block to open the modal
    if(request.type && request.type == 'open_modal') {
      var modalTemplatePromise = new Promise(function(resolve, reject) {
        $.get(chrome.runtime.getURL('/themes/default/templates/modal_template.html'), function(data) {
            resolve(data);
        });
      });

      modalTemplatePromise
      .then(function(modalTemplate) {
        $('#dicModalContainer').remove();
        $('body').append('<div id="dicModalContainer">' + modalTemplate + '</div>');

        $('#dictionaryModal').on('show.bs.modal', function (e) {
          $('html').addClass('dictionaryChromeExtension')
        });

        $('#dictionaryModal').on('hidden.bs.modal', function () {
            $('html').removeClass('dictionaryChromeExtension');
            $('#dicModalContainer').remove();
        })

        $('#dictionary_searched_word').html(searchWord);
        $('#dictionaryModal').modal('show');
        sendResponse({modal_opened: true})
      });
      return true; // To wait for the response
    }

    // Block to show the dictionary meanings in the modal
    if(request.type && request.type == 'dictionary_response') {
      var dictionaryTemplatePromise = new Promise(function(resolve, reject) {
        $.get(chrome.runtime.getURL('/themes/default/templates/dictionary_meaning_template.html'), function(data) {
            resolve(data);
        });
      });

      var dictionaryResponse = request.dictionaryResponse

      console.log('Dictionary Reponse: ')
      console.log(dictionaryResponse);

      dictionaryTemplatePromise
      .then(function(dictionaryDefinitionTemplate) {
        if(!dictionaryResponse) {
          $('#oxford').html(noMeaningTxt);
          $('#longman').html(noMeaningTxt);
          $('#bangla').html(noMeaningTxt);
          return;
        }

        if(dictionaryResponse.error == '500') {
          $('#oxford').html(networdkErrorTxt);
          $('#longman').html(networdkErrorTxt);
          $('#bangla').html(networdkErrorTxt);
          return;
        }

        $('#dictionary_searched_word').html(dictionaryResponse.word);
        if(dictionaryResponse.oxford.word) {
          $('#oxford').html(nunjucks.renderString(dictionaryDefinitionTemplate, {data: dictionaryResponse.oxford}))
        }
        else {
          $('#oxford').html(noMeaningTxt);
        }
        
        if(dictionaryResponse.longman.word) {
          $('#longman').html(nunjucks.renderString(dictionaryDefinitionTemplate, {data: dictionaryResponse.longman}))
        }
        else {
          $('#longman').html(noMeaningTxt);
        }
        
        if(dictionaryResponse.bangla) {
          if(dictionaryResponse.bangla.meaningImage) {
            $('#bangla').html('<img src="' + dictionaryResponse.bangla.meaningImage + '"/>');
          }
          else if(dictionaryResponse.bangla.meaningText) {
            $('#bangla').html(dictionaryResponse.bangla.meaningText);
          }
          else {
            $('#bangla').html(noMeaningTxt)
          }
        }
        else {
          $('#bangla').html(noMeaningTxt)
        }
      })
    }
});


