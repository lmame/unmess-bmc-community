/**
 * Laurent Matheo (BMC).
 * Icon credits:
 * <a href="https://iconscout.com/icons/broomstick" target="_blank">Broomstick Icon</a> by <a href="https://iconscout.com/contributors/josydomalexis">Josy Dom Alexis</a> on <a href="https://iconscout.com">Iconscout</a>
 * @type {HTMLElement}
 */

//@ sourceURL = popup_lma.js

chrome.storage.local.get('numberOfPagesToLoad', function (result) {
    document.getElementById('numberOfPages').value = result.numberOfPagesToLoad || 0;
});

let imgElement = document.getElementById('cleanUpThisMess');

imgElement.addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({
        active: true, currentWindow: true
    });

    var currentUrl = tab.url || '',
        numberOfPagesToLoad = document.getElementById('numberOfPages').value;

    if (currentUrl.indexOf('/s/question/') !== -1 || currentUrl.indexOf('/s/feed/') !== -1) {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            // function: cleanUpCommunityThread,
            files: ['question-and-feed.js']
        });
    }

    if (currentUrl.indexOf('/s/group/') !== -1 || currentUrl.indexOf('/s/topic/') !== -1) {
        chrome.storage.local.set({'numberOfPagesToLoad': numberOfPagesToLoad}, function () {
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                // function: cleanUpGroupFeed
                files: ['group-and-community.js']
            });
        });
    }
});




