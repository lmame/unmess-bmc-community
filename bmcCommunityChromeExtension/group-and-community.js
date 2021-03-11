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

    localCache = items;
    loadMorePages(localCache.numberOfPagesToLoad, 0);
});

function getQuestionId(url) {
    var pathParameters = url.split('/'),
        questionId;

    if (pathParameters.length > 5) {
        questionId = pathParameters[5];
    }

    return questionId;
}

function clearCommunityHeader() {
    var header = document.getElementsByClassName('x7s-layout__lead-content');

    if (header.length) {
        var headerBackgroundImage = header[0].getElementsByClassName('backgroundIcon'),
            headerIconImage = header[0].getElementsByClassName('headerIcon'),
            backgroundContainer = header[0].getElementsByClassName('backgroundColor'),
            contentContainer = header[0].getElementsByClassName('contentContainer'),
            metricsContainer = header[0].getElementsByClassName('metricsArea'),
            askButton = header[0].getElementsByClassName('buttonOnly text');

        if (backgroundContainer.length) {
            backgroundContainer[0].style.height = '200px';
        }

        if (headerBackgroundImage.length) {
            headerBackgroundImage[0].style.height = '130px';
        }

        if (headerIconImage.length) {
            headerIconImage[0].style.height = '130px';
        }

        if (contentContainer.length) {
            contentContainer[0].style.float = 'left';
            contentContainer[0].style['margin-left'] = '200px';
        }

        if (metricsContainer.length) {
            metricsContainer[0].style.float = 'right';
            metricsContainer[0].style['margin-right'] = '200px';
            metricsContainer[0].style['margin-top'] = '105px';
        }

        if (askButton.length) {
            askButton[0].style.display = 'none';
        }

    }
}

function clearHeader() {
    var header = document.getElementsByTagName('c-cmty_-community-banner');

    if (header.length) {
        var headerBackgroundImage = header[0].getElementsByClassName('backgroundImage');

        if (headerBackgroundImage.length) {
            headerBackgroundImage[0].style['min-height'] = '100px';
            headerBackgroundImage[0].style['max-height'] = '100px';
        }

        var headerTextContainer = header[0].getElementsByClassName('container');

        if (headerTextContainer.length) {
            headerTextContainer[0].style['margin-top'] = '-50px';
        }
    } else {
        clearCommunityHeader();
    }
}

function isGroup() {
    return window.location.pathname.split('/')[2] === 'group';
}

function removeAnnouncements() {
    if (isGroup()) {
        var announcements = document.getElementsByClassName('forceChatterGroupAnnouncement');

        if (announcements.length) {
            Array.prototype.forEach.call(announcements, function (announcement) {
                announcement.style.display = 'none';
            });
        }

        var extraPadding = document.getElementsByClassName('slds-p-vertical_large');

        if (extraPadding.length) {
            extraPadding[0].style.display = 'none';
        }
    }
}

function moveGroupDescription() {
    var groupDescriptionElement = document.getElementsByClassName('forceCommunityRecordHeadline'),
        rightColumnElement = document.querySelector('div[data-region-name="rightColumn"]'),
        leftColumnElement = document.querySelector('div[data-region-name="leftColumn"]');

    if (leftColumnElement) {
        leftColumnElement.style['max-width'] = '100%';
    }

    if (groupDescriptionElement.length && rightColumnElement) {
        // Trying to find the right column
        rightColumnElement.prepend(groupDescriptionElement[0]);
        groupDescriptionElement[0].style['margin-bottom'] = '20px';

        // Changing Group Layout
        var groupImage = groupDescriptionElement[0].getElementsByClassName('image');

        if (groupImage.length) {
            groupImage[0].style['max-width'] = '50px';
            groupImage[0].style['max-height'] = '50px';
            groupImage[0].style['margin'] = '0';
        }

        var imageContainer = groupDescriptionElement[0].getElementsByClassName('entityPhotoSpecificity');

        if (groupImage.length) {
            imageContainer[0].style['max-width'] = '50px';
            imageContainer[0].style['max-height'] = '50px';
        }

        var notificationContainer = groupDescriptionElement[0].getElementsByClassName('forceActionsContainer'),
            actionsContainer = groupDescriptionElement[0].getElementsByClassName('actions');

        if (notificationContainer.length && actionsContainer.length) {
            actionsContainer[0].prepend(notificationContainer[0]);
        }
    }


    // Sections
    var sections = document.getElementsByClassName('siteforceContentArea');

    if (sections.length > 2) {
        var commentSection = sections[sections.length - 2],
            container = commentSection.getElementsByClassName('slds-container_center');

        // siteforceContentArea

        // Main comment Section
        commentSection.style['max-width'] = '100%';
        commentSection.style['margin-left'] = '25px';
        commentSection.style['margin-right'] = '25px';

        // Container
        if (container.length) {
            container[0].style['max-width'] = '100%';
        }

        // Left and Right columns
        if (leftColumnElement) {
            leftColumnElement.parentElement.style['flex'] = '1';
        }

        if (rightColumnElement) {
            rightColumnElement.parentElement.style['max-width'] = '500px';
        }
    }
}

function cleanUpNewPostsView() {
    var announcements = document.getElementsByClassName('groupAnnouncement');

    if (announcements.length) {
        Array.prototype.forEach.call(announcements, function (announcement) {
            announcement.style.display = 'none';
        });
    }

    var questions = document.getElementsByClassName('cuf-feedElementIterationItem slds-feed__item');

    if (questions.length) {
        Array.prototype.forEach.call(questions, function (question) {
            var questionTitleElement = question.getElementsByClassName('cuf-questionTitle'),
                questionHeaderElement = question.getElementsByClassName('forceChatterFeedItemHeader'),
                questionLinkObject = question.getElementsByClassName('cuf-timestamp'),
                article = question.getElementsByTagName('article'),
                hasBestAnswer = question.getElementsByClassName('cuf-bestAnswerContainer'),
                numberOfComments = 0,
                isQuestionAlreadyHandled = question.getElementsByClassName('lmaTitle');

            if (isQuestionAlreadyHandled.length) {
                var url = isQuestionAlreadyHandled[0].href,
                    questionId = getQuestionId(url),
                    titleTextElement = questionTitleElement[0].getElementsByClassName('uiOutputText')[0],
                    numberOfCommentsElement = question.getElementsByClassName('qe-commentCount');

                if (numberOfCommentsElement.length) {
                    numberOfComments = parseInt(numberOfCommentsElement[0].innerText.split(' ')[0].trim());
                }

                // We should still update the read status though.
                if (localCache.hasOwnProperty(questionId)) {
                    if (numberOfComments > localCache[questionId]) {
                        titleTextElement.style['font-weight'] = 'bold';
                    } else {
                        titleTextElement.style['font-weight'] = '500';
                    }
                } else {
                    titleTextElement.style['font-weight'] = 'bold';
                }

                return;
            }

            question.style.padding = '0';
            article[0].style.padding = '0';
            article[0].style['padding-left'] = '5px';
            article[0].style['padding-right'] = '5px';
            article[0].style['padding-top'] = '5px';
            article[0].style['margin-bottom'] = '5px';
            article[0].style['background-color'] = '#F2F2F3';
            article[0].style.border = '1px solid var(--lwc-colorBorderInput,#D4D4D4)';
            article[0].style['border-radius'] = 'var(--lwc-borderRadiusMedium,0.25rem)';

            var isPoll = false,
                isAnnouncement = false,
                isGeneric = false;

            if (question.getElementsByClassName('cuf-auxBodyPollPost').length) {
                questionTitleElement = question.getElementsByClassName('cuf-body');
                isPoll = true;
            }

            if (question.querySelector('img[alt="Announcement"]')) {
                questionTitleElement = question.getElementsByClassName('cuf-bodyRight');
                isAnnouncement = true;
            }

            // ??? If it has a cuf-body let's try to handle it as a poll...
            if (!questionTitleElement.length && question.getElementsByClassName('cuf-body').length) {
                questionTitleElement = question.getElementsByClassName('cuf-body');
                isGeneric = true;
            }

            // Change in a group (name etc...). Useless.
            if (question.querySelector('article[data-type="TrackedChange"]')) {
                questionTitleElement = [];
                question.style.display = 'none';
            }

            if (questionTitleElement.length && questionHeaderElement.length > 1 && questionLinkObject.length) {
                var url = questionLinkObject[0].href,
                    timestamp = questionLinkObject[0].innerText,
                    additionalInformation = ' (' + timestamp,
                    titleTextElement = questionTitleElement[0].getElementsByClassName('uiOutputText')[0],
                    questionId = getQuestionId(url);

                if (isPoll || isAnnouncement || isGeneric) {
                    var expandElement = questionTitleElement[0].getElementsByClassName('cuf-more'),
                        feedElement = question.getElementsByClassName('cuf-feedBodyText');
                    // allStrings = titleTextElement.innerText.split(/\r?\n/);

                    questionTitleElement[0].classList.add('cuf-questionTitle');

                    if (isPoll) {
                        titleTextElement.innerText = '[POLL] ' + titleTextElement.innerText;
                    } else if (isAnnouncement) {
                        titleTextElement.innerText = '[PSA] ' + titleTextElement.innerText;
                    }

                    if (expandElement.length) {
                        expandElement[0].style.display = 'none';
                    }

                    if (feedElement.length) {
                        feedElement[0].style.display = 'none';
                    }

                    // if (allStrings.length) {
                    //     titleTextElement.innerText = allStrings[0];
                    // }

                    // debugger;


                }

                titleTextElement.innerText = titleTextElement.innerText.replace(/\r/g, ' ');
                titleTextElement.innerText = titleTextElement.innerText.replace(/\n/g, ' ');

                if (hasBestAnswer.length) {
                    var icon = hasBestAnswer[0].getElementsByClassName('bLeft');

                    titleTextElement.style.color = 'rgb(2, 126, 70)';

                    if (icon.length) {
                        icon[0].style.color = 'rgb(2, 126, 70)';
                        icon[0].style['margin-right'] = '20px';
                        questionHeaderElement[1].parentElement.insertBefore(icon[0], questionHeaderElement[1]);
                    }
                }

                var link = document.createElement('a');

                link.classList.add('lmaTitle');
                link.href = url;
                link.target = '_blank';
                link.classList.add('cuf-questionTitle');
                link.style.color = 'inherit';

                if (isPoll || isAnnouncement || isGeneric) {
                    link.prepend(titleTextElement);
                } else {
                    link.prepend(questionTitleElement[0]);
                }

                questionHeaderElement[1].prepend(link);

                // Put more information next to the username to save space...
                var upvoteCount = question.getElementsByClassName('upvoters-card-target'),
                    commentCount = question.getElementsByClassName('qe-commentCount'),
                    viewCount = question.getElementsByClassName('qe-viewCount'),
                    userInformation = question.getElementsByClassName('cuf-preamble');

                if (upvoteCount.length) {
                    additionalInformation += ', ' + upvoteCount[0].innerText;
                }

                if (commentCount.length) {
                    additionalInformation += ', ' + commentCount[0].innerText;
                    numberOfComments = parseInt(commentCount[0].innerText.split(' ')[0].trim());
                } else {
                    additionalInformation += ', no reply yet';
                    titleTextElement.style.color = '#FE5000';
                }

                if (viewCount.length) {
                    additionalInformation += ', ' + viewCount[0].innerText;
                }

                additionalInformation += ')';

                if (userInformation.length) {
                    var userAdditionalInformation = userInformation[0].getElementsByClassName('uiOutputText');

                    if (userAdditionalInformation.length && !userAdditionalInformation[userAdditionalInformation.length - 1].classList.contains('lma')) {
                        userAdditionalInformation[userAdditionalInformation.length - 1].classList.add('lma');
                        userAdditionalInformation[userAdditionalInformation.length - 1].innerText += additionalInformation;
                    }
                }

                if (localCache.hasOwnProperty(questionId)) {
                    if (numberOfComments > localCache[questionId]) {
                        titleTextElement.style['font-weight'] = 'bold';
                    } else {
                        titleTextElement.style['font-weight'] = '500';
                    }
                } else {
                    titleTextElement.style['font-weight'] = 'bold';
                }

                if (isPoll || isGeneric) {
                    questionTitleElement[0].classList.remove('cuf-body');
                }

                if (isAnnouncement) {
                    questionTitleElement[0].classList.remove('cuf-bodyRight');
                }

                // Deleting useless Stuff.
                var uselessStuffList = [
                    {
                        type: 'class',
                        name: 'cuf-questionBody',
                        allowPartial: true
                    },
                    {
                        type: 'class',
                        name: 'forceChatterSimpleFeedItemTopics',
                        allowPartial: true
                    },
                    {
                        type: 'class',
                        name: 'cuf-subPreamble',
                        allowPartial: true
                    },
                    {
                        type: 'class',
                        name: 'cuf-feedback',
                        allowPartial: true
                    },
                    {
                        type: 'tag',
                        name: 'footer',
                        allowPartial: true
                    },
                    {
                        type: 'class',
                        name: 'forceChatterFeedAuxBody',
                        allowPartial: true
                    },
                    {
                        type: 'class',
                        name: 'closedConversationMessage',
                        allowPartial: true
                    },
                    {
                        type: 'class',
                        name: 'cuf-body',
                        allowPartial: false
                    },
                    {
                        type: 'class',
                        name: 'cuf-auxBody',
                        allowPartial: true
                    },
                    {
                        type: 'class',
                        name: 'expandLink',
                        allowPartial: false
                    }
                ];

                deleteUselessStuff(question, uselessStuffList);
            } else {
                // Another announcement we want to ignore.
                console.log(' ');
                console.log('Ignoring something?');
                console.log(question);
            }
        });
    }
}

function deleteUselessStuff(parentElement, listOfUselessStuff) {
    if (parentElement && Array.isArray(listOfUselessStuff)) {
        listOfUselessStuff.forEach(function (useLessStuff) {
            var elements;

            if (useLessStuff.type === 'class') {
                elements = parentElement.getElementsByClassName(useLessStuff.name);
            } else if (useLessStuff.type === 'tag') {
                elements = parentElement.getElementsByTagName(useLessStuff.name);
            }

            if (elements.length) {
                Array.prototype.forEach.call(elements, function (element) {
                    if (useLessStuff.type === 'tag' || useLessStuff.allowPartial || (!useLessStuff.allowPartial && element.classList.value === useLessStuff.name))
                        element.style.display = 'none';
                });
            }
        });
    }
}

function loadMorePages(numberOfPages, lastQuestionCount) {
    var viewMoreButton = document.getElementsByClassName('cuf-showMore'),
        urlParameters = new URLSearchParams(window.location.search),
        counter = urlParameters.get('viewMore') || '0',
        currentQuestionCount = document.getElementsByClassName('cuf-feedElementIterationItem slds-feed__item').length;

    startSpinner();

    if (parseInt(counter) < numberOfPages) {
        if (viewMoreButton.length) {
            viewMoreButton[0].click();
            setTimeout(loadMorePages.bind(null, numberOfPages, currentQuestionCount), 1000);
        } else {
            clearHeader();
            removeAnnouncements();
            moveGroupDescription();
            cleanUpNewPostsView();
            stopSpinner();
            // window.scrollTo(0, 0);
        }
    } else {
        if (lastQuestionCount === currentQuestionCount) {
            clearHeader();
            removeAnnouncements();
            moveGroupDescription();
            cleanUpNewPostsView();
            stopSpinner();
            // window.scrollTo(0, 0);
        } else {
            setTimeout(loadMorePages.bind(null, numberOfPages, currentQuestionCount), 1000);
        }
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
