BASE_URL = 'http://linkyard.cloudapp.net';
API_URL = BASE_URL + '/api';

// TODO: remember and use token in case we switch away from cookie-based
// auth, or have a separate sessions for the webapp and the extension.
var authToken = 'dummy';

$(function() {
  var $linkSubmissionUrl = $('#link-submission-url');
  var $linkSubmissionTitle = $('#link-submission-title');
  var $linkSubmissionContent = $('#link-submission-content');
  var $submitForm = $('form#submit');
  var $submitButton = $('form#submit').find('input[type=submit]');
  var $loginOrSignup = $('#login-or-signup');
  var $loginForm = $('form#login-form');
  var $connectionErrorMessage = $('#connection-error');
  var $spinner = $('#spinner');

  $spinner.show();

  // Pre-submission query
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
    function(tabs) {
      var currentUrl = tabs[0].url;

      $submitForm.hide();

      $.ajax({
        type: 'GET',
        url: API_URL + '/links/new',
        headers: {
          'Accept': 'application/json'
        },
        data: {
          // auth_token: authToken,
          url: currentUrl,
        }
      })
      .error(function(data, status, error) {
        if (error == 'Unauthorized') {
          $spinner.hide();
          $loginOrSignup.show();
        } else {
          $spinner.hide();
          $connectionErrorMessage.show();
        }
      })
      .done(function(data, status, xhr) {
        $spinner.hide();
        $submitForm.show();

        var linkSubmission = data.link_submission;
        $linkSubmissionUrl.val(linkSubmission.url).removeAttr('disabled');
        $linkSubmissionTitle.val(linkSubmission.title).removeAttr('disabled');
        $linkSubmissionContent.val(linkSubmission.content).removeAttr('disabled');
        $submitButton.val('Add').removeAttr('disabled');

        $.each(linkSubmission.link_interactions, function(index, interaction) {
          var id = interaction.id;
          html = '<label for="interaction-' + id
            + '"> <input type="checkbox" id="interaction-' + id
            + '" name="link_interactions_' + id
            + '" />' + interaction.name + '</label>';
          $('#link-submission-interactions').append(html);
        });

        html = '<label for="digests">Digests<select id="digest" name="digest">';
        $.each(linkSubmission.digests, function(index, digest) {
          html += '<option value="' + digest + '">' + digest + '</option>'
        });
        html += '</select></label>';
        $('#link-submission-digests').append(html);
      });
    }
  );

  // Link submission
  $submitForm.submit(function(event) {
    event.preventDefault();

    var link_submission = {
      link_interactions: []
    };

    $.each($('#submit').find(':input').serializeArray(),
           function(index, input) {
             name = input.name;
             value = input.value;

             if (name.indexOf('link_interactions_') == 0) {
               if (value == 'on') {
                 id = name.replace('link_interactions_', '');
                 link_submission.link_interactions.push({ id: id, checked: '1' });
               }
             } else {
               link_submission[name] = value;
             }
           });

    link_submission['digest'] = $('#digest').val();
    data = JSON.stringify({
      //'auth_token': authToken,
      'link_submission': link_submission,
    });

    $.ajax({
      type: 'POST',
      url: API_URL + '/links',
      contentType: 'application/json',
      headers: {
        'Accept': 'application/json',
      },
      data: data
    })
    .error(function(data, status, error) {
      if (error == 'Unauthorized') {
        $submitForm.hide();
        $loginOrSignup.show();
      } else {
        $submitForm.hide();
        $connectionErrorMessage.show();
      }
    })
    .done(function(data) {
      $('body').html('<p class="success">Link successfully added.</p>');
    });
  });

  // Auth form
  $loginForm.submit(function(event) {
    event.preventDefault();

    $.ajax({
      type: 'POST',
      url: API_URL + '/sessions',
      headers: {
        'Accept': 'application/json'
      },
      data: {
        'user': {
          'email': $('#email').val(),
          'password': $('#password').val(),
          'remember_me': '1'
        }
      }
    })
    .error(function(data, status, error) {
      if (error == 'Unauthorized') {
        $loginOrSignup.show();
      } else {
        $connectionErrorMessage.show();
      }
    })
    .done(function(data, status, xhr) {
      location.reload()
    });

    $(this).find('input').attr('disabled', 'disabled');
  });

  // Miscellaneous hooks
  $('#try-again').click(function() {
    location.reload();
  });

  $('#signup').click(function() {
    window.open(BASE_URL);
  });
});
