// youTubeSearch object - this handles the API call to YouTube
const youTubeSearch = {
    apiKey: 'AIzaSyCzUbhyLVgRs-NZ3-BjH_SX1qMjnxQopOc',
    query: '',
    pageNavigationToken: '',
    maxSearchResultsPerPage: 10,
    fetchYouTubeResults: function (callback) {
        // Set the query data
        let queryData = {
            q: this.query,
            key: this.apiKey,
            part: 'snippet',
            maxResults: this.maxSearchResultsPerPage
        };
        // If there is a pageToken, set it here
        // This will tell the API to give us the next page of results
        if (this.pageNavigationToken) {
            queryData.pageToken = this.pageNavigationToken;
        }

        // Ajax request to YouTube API
        $.ajax({
            url: 'https://www.googleapis.com/youtube/v3/search',
            data: queryData,
            dataType: 'json',
            type: 'GET'
        })
        .done(function(searchResultData) {
            // Call the callback function with the results of teh API query
            callback(searchResultData);
        })
        .fail(function() {
            // Let the user know something went wrong.
            alert('Sorry, we had troubles connecting to Youtube.com. Please try again soon.')
        });
    }
};

// pageView object - this handles display of search results on the page
const pageView = {
    displayResults: function (searchResults) {
        // Check if we have any results
        // Empty the container holding the search results
        // Create a new entry for each search result and add that to the container
        // Update the pagination links with a pageToken (if there is one)
        if (searchResults.items.length) {
            let resultsContainer = $('.js-results');
            let resultsHTML = '';
            resultsContainer.slideUp('fast').empty().slideDown();
            searchResults.items.forEach(function (item) {
                // Make sure it's a video
                if (item.id.kind === 'youtube#video') {
                    resultsHTML += `<li class="list-group-item">
                                        <a href="https://www.youtube.com/watch?v=${item.id.videoId}" data-lity><img src="${item.snippet.thumbnails.medium.url}" alt="YouTube Video Image for ${item.snippet.title}" class="img-fluid"></a>
                                        <a href="https://www.youtube.com/watch?v=${item.id.videoId}" data-lity><h4 class="text-info">${item.snippet.title}</h4></a>
                                        <p class="card-text">${item.snippet.description}</p>
                                        <a href="https://www.youtube.com/watch?v=${item.id.videoId}" class="btn btn-info" data-lity>View Video <i class="fa fa-television"></i></a>
                                        <small><a class="channel-link text-info mt-1" href="https://youtube.com/channel/${item.snippet.channelId}" target="_blank">Go to ${item.snippet.channelTitle} YouTube Channel <i class="fa fa-external-link"></i></a></small>
                                    </li>`;
                }
            });
            resultsContainer.html(resultsHTML);
            pageView.updatePaginationLink($('.js-btn-next'), searchResults.nextPageToken);
            pageView.updatePaginationLink($('.js-btn-prev'), searchResults.prevPageToken);
            $('.pagination-nav').removeClass('d-none');
        } else {
            alert('Sorry, didn\'t get any results. Try another search!');
        }
    },
    updatePaginationLink: function (linkElement, pageToken) {
        // if pageToken s truthy, then add the 'page-token' data attribute to the
        // link and remove the disabled class. Do the opposite if it's falsy.
        if (pageToken) {
            linkElement
                .data('page-token', pageToken)
                .removeClass('disabled');
        } else {
            linkElement
                .removeAttr('page-token')
                .addClass('disabled');
        }
    }
};

function handleFormEvents() {
    // Handle the search form events
    $('#js-search-form').on('submit', function (event) {
        event.preventDefault();
        youTubeSearch.query = $(this).find('input[type=text]').val();
        youTubeSearch.pageNavigationToken = '';
        youTubeSearch.fetchYouTubeResults(pageView.displayResults);
    });

    // Handle the pagination events
    $('.pagination').on('click', 'button', function (event) {
        event.preventDefault();
        if (!($(this).hasClass('disabled')) && $(this).data('page-token')) {
            youTubeSearch.pageNavigationToken = $(this).data('page-token');
            youTubeSearch.fetchYouTubeResults(pageView.displayResults);
        }
    })
}

// jQuery document ready function to run handleFormEvents
$(handleFormEvents);