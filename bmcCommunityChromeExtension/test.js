
function testExternal() {
    var localCache = {};

    chrome.storage.local.get(null, function (items) {
        try {
            if (chrome.runtime.lastError) {
                console.warn(chrome.runtime.lastError.message);
            }
            // else {
            //     console.log(Object.getOwnPropertyNames(items));
            // }
        } catch (exception) {
            // window.alert('exception.stack: ' + exception.stack);
            console.error((new Date()).toJSON(), "exception.stack:", exception.stack);
        }

        // localCache = items;
        console.log(items);
        // loadMorePages(localCache.numberOfPagesToLoad, 0);
    });

    alert('I am external!');
}