function getQuestionId() {
    var pathParameters = window.location.pathname.split('/'),
        questionId;

    if (pathParameters.length > 3 && (pathParameters[2] === 'question' || pathParameters[2] === 'feed')) {
        questionId = pathParameters[3];
    }

    return questionId;
}

function getNumberOfComments() {
    var numberOfCommentsElement = document.getElementsByClassName('qe-commentCount'),
        numberOfComments = '0';

    if (numberOfCommentsElement.length) {
        numberOfComments = numberOfCommentsElement[0].innerText.split(' ')[0];
    }

    return parseInt(numberOfComments);
}

function injectMarkAsReadButtons() {
    if (!document.getElementById('lma-markasread')) {
        var buttonMarkAsRead = document.createElement('button'),
            buttonMarkAsUnread = document.createElement('button'),
            br = document.createElement('br'),
            logsElement = document.createElement('span'),
            rightColumnElement = document.querySelector('div[data-region-name="rightColumn"]'),
            questionId = getQuestionId(),
            numberOfComments = getNumberOfComments();

        buttonMarkAsRead.id = 'lma-markasread';
        buttonMarkAsRead.textContent = 'Mark As Read';
        buttonMarkAsRead.style['margin-right'] = '20px';
        buttonMarkAsRead.style['margin-bottom'] = '20px';

        buttonMarkAsRead.onclick = function () {
            handleMarkAsRead(true);
        };

        buttonMarkAsUnread.id = 'lma-markasunread';
        buttonMarkAsUnread.textContent = 'Mark As Unread';
        buttonMarkAsUnread.style['margin-bottom'] = '20px';

        buttonMarkAsUnread.onclick = function () {
            handleMarkAsRead(false);
        };

        logsElement.id = 'lma-logs';

        rightColumnElement.prepend(logsElement);
        rightColumnElement.prepend(br);
        rightColumnElement.prepend(buttonMarkAsUnread);
        rightColumnElement.prepend(buttonMarkAsRead);

        chrome.storage.local.get(questionId, function (result) {
            if (result[questionId]) {
                var numberOfReadComments = parseInt(result[questionId]);

                if (numberOfReadComments === numberOfComments) {
                    logsElement.innerText = 'You have read all comments (' + numberOfComments + ').';
                    logsElement.onclick = null;
                    logsElement.style.cursor = null;
                } else {
                    logsElement.innerText = 'You have read ' + numberOfReadComments + ' / ' + numberOfComments + ' comments.';
                    logsElement.onclick = scrollToNewComments;
                    logsElement.style.cursor = 'pointer';
                }
            } else {
                logsElement.innerText = 'You have read nothing Jon Snow...';
                logsElement.onclick = scrollToNewComments;
                logsElement.style.cursor = 'pointer';
            }
        });
    } else {
        var questionId = getQuestionId(),
            logsElement = document.getElementById('lma-logs'),
            numberOfComments = getNumberOfComments();

        chrome.storage.local.get(questionId, function (result) {
            if (result[questionId]) {
                var numberOfReadComments = parseInt(result[questionId]);

                if (numberOfReadComments === numberOfComments) {
                    logsElement.innerText = 'You have read all comments (' + numberOfComments + ').';
                    logsElement.onclick = null;
                    logsElement.style.cursor = null;
                } else {
                    logsElement.innerText = 'You have read ' + numberOfReadComments + ' / ' + numberOfComments + ' comments.';
                    logsElement.onclick = scrollToNewComments;
                    logsElement.style.cursor = 'pointer';
                }
            } else {
                logsElement.innerText = 'You have read nothing Jon Snow...';
                logsElement.onclick = scrollToNewComments;
                logsElement.style.cursor = 'pointer';
            }
        });
    }
}

function scrollToNewComments() {
    self.location.href = '#lmaCurrentRecord';
}

function handleMarkAsRead(markAsRead) {
    var pathParameters = window.location.pathname.split('/'),
        isQuestion = false,
        questionId,
        logsElement = document.getElementById('lma-logs');

    if (pathParameters.length > 3) {
        isQuestion = pathParameters[2] === 'question' || pathParameters[2] === 'feed';
        questionId = pathParameters[3];
    }

    if (isQuestion) {
        if (markAsRead) {
            // We want to mark the question as read, for now we just store the number of comments.
            var numberOfComments = getNumberOfComments(),
                questionObject = {};

            questionObject[questionId] = numberOfComments;

            chrome.storage.local.set(questionObject, function () {
                logsElement.innerText = 'You have read all comments (' + numberOfComments + ').';
                logsElement.onclick = null;
                logsElement.style.cursor = null;
                flagComments('');
            });
        } else {
            // Mark as non read, we just delete the entry from the local storage.
            chrome.storage.local.remove([questionId], function () {
                logsElement.innerText = 'You have read nothing Jon Snow...';
                logsElement.onclick = scrollToNewComments;
                logsElement.style.cursor = 'pointer';
                flagComments('5px solid #FE5000');
            });
        }
    }
}

function getAllTimestampElements() {
    var timeStamps = document.getElementsByTagName('feeds_timestamping-comment-creation') || [];

    Array.prototype.forEach.call(timeStamps, function (timestamp) {
        var humanDateTime = timestamp.getAttribute('title'),
            relativeDateTimeElement = timestamp.getElementsByTagName('lightning-relative-date-time');

        if (relativeDateTimeElement[0]) {
            relativeDateTimeElement[0].innerText = humanDateTime;
        }
    });
}

function displayAllComments(verticalScrollOffset) {
    var commentCountElement = document.getElementsByClassName('qe-commentCount'),
        numberOfComments = commentCountElement.length ? parseInt(commentCountElement[0].innerText.split(' ')[0].trim()) : 0,
        numberOfCommentsDisplayed = document.getElementsByClassName('cuf-commentItem').length;

    if (numberOfCommentsDisplayed < numberOfComments) {
        var showMoreElement = document.getElementsByTagName('feeds_paging-show-previous-trigger');

        if (showMoreElement.length) {
            button = showMoreElement[0].getElementsByTagName('button')[0].click();
        } else {
            showMoreElement = document.getElementsByTagName('feeds_paging-show-next-trigger');

            if (showMoreElement.length) {
                button = showMoreElement[0].getElementsByTagName('button')[0].click();
            } else {
                showMoreElement = document.getElementsByTagName('feeds_paging-show-more-trigger');

                if (showMoreElement.length) {
                    button = showMoreElement[0].getElementsByTagName('button')[0].click();
                }
            }
        }

        // Let's loop;
        setTimeout(displayAllComments.bind(null, verticalScrollOffset), 1000);
    } else {
        var orderedComments = reorderThisMess();

        expandAllPosts();
        getAllTimestampElements();
        flagUnreadComments(orderedComments, verticalScrollOffset);
    }
}

function flagComments(style) {
    var allCommentsElements = document.getElementsByClassName('cuf-commentItem');

    removeCurrentAnchor();

    Array.prototype.forEach.call(allCommentsElements, function (commentElement, index) {
        if (style && index === 0) {
            commentElement.id = 'lmaCurrentRecord';
        }

        commentElement.style.border = style;
    });
}

function flagUnreadComments(orderedComments, verticalScrollOffset) {
    var questionId = getQuestionId(),
        commentsList = orderedComments || [],
        numberOfOrderedComments = commentsList.length;

    chrome.storage.local.get(questionId, function (result) {
        var startIndex = 0;

        if (result[questionId]) {
            startIndex = parseInt(result[questionId]);
        }

        for (var index = startIndex; index < numberOfOrderedComments; index++) {
            if (index === startIndex) {
                removeCurrentAnchor();

                // Adding anchor.
                commentsList[index].element.id = 'lmaCurrentRecord';
            }

            commentsList[index].element.style.border = '5px solid #FE5000';
        }

        window.scrollTo(0, verticalScrollOffset);

        stopSpinner();
        // window.scrollTo(0, 0);
    });
}

function removeCurrentAnchor() {
    var currentAnchor = document.getElementById('lmaCurrentRecord');

    if (currentAnchor) {
        currentAnchor.removeAttribute('id');
    }
}


function reorderThisMess() {
    var commentZone = document.getElementsByClassName('threaded-discussion has-comments')[0],
        allCommentsElements = document.getElementsByClassName('cuf-commentItem'),
        allComments = [];

    if (!commentZone) {
        commentZone = document.getElementsByClassName('slds-feed__item-comments has-comments')[0];
    }

    Array.prototype.forEach.call(allCommentsElements, function (commentElement) {
        var comment = {
            timestamp: commentElement.getElementsByTagName('time')[0].getAttribute('datetime'),
            element: commentElement
        };

        allComments.push(comment);
    });

    allComments.sort(function (firstComment, nextComment) {
        if (firstComment.timestamp < nextComment.timestamp) {
            return -1;
        }

        if (firstComment.timestamp > nextComment.timestamp) {
            return 1;
        }

        return 0;
    });

    allComments.forEach(function (comment) {
        commentZone.appendChild(comment.element);
    });

    // We put the reply zone back at the end.
    var replyElement = document.getElementsByClassName('commentInputArea');

    if (replyElement.length && commentZone) {
        commentZone.appendChild(replyElement[0]);
    }

    // Changing reply button behaviors to use the main answer zone.
    var replyButtons = document.getElementsByTagName('feeds_replying-trigger');

    if (replyButtons.length) {
        Array.prototype.forEach.call(replyButtons, function (replyButton) {
            var buttonElement = replyButton.getElementsByTagName('button')[0];

            buttonElement.onclick = function () {
                var replyElement = document.getElementsByClassName('commentInputArea');

                if (replyElement.length) {
                    var inputElement = replyElement[0].getElementsByTagName('input');

                    if (inputElement.length) {
                        inputElement[0].focus();
                    } else {
                        var richTextEditor = replyElement[0].getElementsByClassName('ql-editor');

                        if (richTextEditor.length) {
                            richTextEditor[0].focus();
                        }
                    }
                }

                // window.scrollTo(0, document.body.scrollHeight);
            };
        });
    }

    return allComments;
}

function expandAllPosts() {
    var showMoreElements = document.getElementsByClassName('cuf-more fadeOut');

    Array.prototype.forEach.call(showMoreElements, function (showMoreElement) {
        if (!showMoreElement.classList.contains('hidden')) {
            showMoreElement.click();
        }
    });
}

function removeBestAnswer() {
    var bestAnswerElement = document.getElementsByClassName('cuf-feedback slds-feed__item-comments  feed__item-comments--threadedCommunity forceChatterFeedback');

    if (bestAnswerElement.length > 1) {
        bestAnswerElement[0].remove();
    }
}

function insertSpinner() {
    var cssId = 'lma-spinner-styles';

    if (!document.getElementById(cssId)) {
        var head = document.getElementsByTagName('head')[0],
            styleElement = document.createElement('style');

        var css = '/*Loader*/' +
            '.lma-spinner {' +
            'position: fixed;' +
            'left: 50%;' +
            'top: 50%;' +
            'z-index: 1;' +
            'width: 240px;' +
            'height: 240px;' +
            'margin: -76px 0 0 -76px;' +
            'border: 16px solid #FE5000;' +
            'border-radius: 50%;' +
            'border-top: 16px solid #1067BB;' +
            '-webkit-animation: lma-spinner-spin 2s linear infinite;' +
            'animation: lma-spinner-spin 2s linear infinite;' +
            '}' +
            '@-webkit-keyframes lma-spinner-spin {' +
            '  0% { -webkit-transform: rotate(0deg); }' +
            '  100% { -webkit-transform: rotate(360deg); }' +
            '}' +
            '@keyframes lma-spinner-spin {' +
            '  0% { transform: rotate(0deg); }' +
            '  100% { transform: rotate(360deg); }' +
            '}';

        styleElement.type = 'text/css';
        styleElement.id = cssId;
        styleElement.innerHTML = css;
        head.appendChild(styleElement);

        var divSpinner = document.createElement('div'),
            bodyElement = document.getElementsByTagName('body')[0];

        divSpinner.className = 'lma-spinner';
        divSpinner.style.display = 'none';
        bodyElement.appendChild(divSpinner);
    }
}

function startSpinner() {
    insertSpinner();

    var spinner = document.getElementsByClassName('lma-spinner');

    if (spinner.length) {
        spinner[0].style.display = 'block';
    }
}


function stopSpinner() {
    var spinner = document.getElementsByClassName('lma-spinner');

    if (spinner.length) {
        spinner[0].style.display = 'none';
    }
}

var verticalScrollOffset = window.pageYOffset || document.documentElement.scrollTop;

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

// testExternal();
startSpinner();
injectMarkAsReadButtons();
removeBestAnswer();
displayAllComments(verticalScrollOffset);
