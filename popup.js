document.addEventListener('DOMContentLoaded', function () {
  var $link_submission_url = document.querySelector('#link_submission_url'),
      $link_submission_title = document.querySelector('#link_submission_title'),
      $link_submission_content = document.querySelector('#link_submission_content');

  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
    function (tabs) {
      var url = tabs[0].url,
          xhr = new XMLHttpRequest();

      $link_submission_url.value = url;
      xhr.onreadystatechange = function () {
        if ( xhr.readyState === 4 && xhr.status === 200 ) {
          var link_submission = JSON.parse(xhr.responseText).link_submission;
          $link_submission_title.value = link_submission.title;
          $link_submission_content.value = link_submission.content;
        }
      };
      xhr.open("GET", "http://localhost:3000/api/links/new?auth_token=JJ-MJE6og2ZSzAaz84gR&url=" + url, true);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.send();
    }
  );
});
