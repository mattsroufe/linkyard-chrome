document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
    function (tabs) {
      document.querySelector('#link_submission_url').value = tabs[0].url;
    }
  );
});
