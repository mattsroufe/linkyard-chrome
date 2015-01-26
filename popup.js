BASE_URL = 'http://localhost:3000/api';
var authToken = 'JJ-MJE6og2ZSzAaz84gR';

$(function () {
  var $linkSubmissionUrl = $('#link-submission-url'),
      $linkSubmissionTitle = $('#link-submission-title'),
      $linkSubmissionContent = $('#link-submission-content'),
      $submitButton = $('input[type=submit]');

  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
    function (tabs) {
      var currentUrl = tabs[0].url;

      $linkSubmissionUrl.val(currentUrl);
      $.ajax({
        type: 'GET',
        url: BASE_URL + '/links/new',
        headers: {
          'Accept': 'application/json'
        },
        data: {
          auth_token: authToken,
          url: currentUrl
        }
      })
      .done(function (data) {
        var linkSubmission = data.link_submission;
        $linkSubmissionTitle.val(linkSubmission.title).removeAttr('disabled');
        $linkSubmissionContent.val(linkSubmission.content).removeAttr('disabled');
        $submitButton.val('Add').removeAttr('disabled');
      });
    }
  );

  $submitButton.click(function (event) {
    event.preventDefault();
    $.ajax({
      type: 'POST',
      url: BASE_URL + '/links',
      headers: {
        'Accept': 'application/json'
      },
      data: {
        auth_token: authToken,
        link_submission: {
          url: $linkSubmissionUrl.val(),
          tags: $('#link-submission-tags').val(),
          description: $('#link-submission-description').val(),
          title: $linkSubmissionTitle.val(),
          content: $linkSubmissionContent.val()
        }
      }
    })
    .done(function (data) {
      $('body').html('<p class="success">Link successfully added.</p>');
    });
  });
});
