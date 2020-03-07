﻿var queryly = {};
(function (window) {
    queryly = {
        QuerylyKey: '31a35d40a9a64ab3',
        searchtimer: null,
        tickertimer: null,
        searchredirect: '',
        searchapi: '//api.queryly.com',
        redirecturl: '/search/',
        instantSearch: true,
        toptickers: [],
        additionalindexes: '4cd6f71fbf22424d,937d600b0d0d4e23,3bfbe40caee7443e,626fdfcd96444f28',
        desktopsearch: false,
        currentCursor: -1,


        closesearch: function () {
            document.body.style["overflow-y"] = "auto";
            queryly.search.resetsearch();
            if (document.getElementById('back-top-top') != null) {
                document.getElementById('back-top-top').style['display'] = 'none';
            }

        },

        closesearch_desktop : function(){
            document.getElementsByClassName("SearchDropDown-dropDownContainer")[0].style["height"] = "0px";
        },

        initalize: function () {
            queryly.initialize();
        },

        desktop_initialize: function () {
            console.log("desktop_initialize");
            //alert("this is a search overlay on desktop");
            queryly.desktopsearch = true;
            queryly.currentCursor = -1;
            var tickertemplate = '<script type="text/html" id="queryly_template_ticker"><a style="color:black;" href="<%=queryly.tickerdata.url%>"><div class="SearchGroup-item"><div class="SearchGroup-itemIdentifier"><span class="SearchGroup-itemTitle"><%=queryly.tickerdata.symbol%></span><span class="SearchGroup-itemSubTitle"><%=queryly.tickerdata.name%> | <%=queryly.tickerdata.countryCode%></span></div><span class="SearchGroup-marketChangeUp SearchGroup-marketChange"><span style="color:black;font-size:14px;" class="SearchGroup-change"><%=queryly.tickerdata.last%></span><span class="SearchGroup-change_pct" style="display: inline-block;font-size:14px;<%if (typeof queryly.tickerdata.color != \'undefined\') {%> color:<%=queryly.tickerdata.color%>; <%}%>"><%=queryly.tickerdata.change%></span><span class="SearchGroup-change_pct" style="display: inline-block;margin-left:10px;font-size:14px;;<%if (typeof queryly.tickerdata.color != \'undefined\') {%> color:<%=queryly.tickerdata.color%>; <%}%>">(<%=queryly.tickerdata.changepercentage%>)</span></span></div></a></script>';
            if (document.getElementById("queryly_template_ticker") == null) {
                var elem = document.createElement("div");
                elem.innerHTML = tickertemplate;
                document.body.appendChild(elem);
            }
            document.getElementsByClassName("SearchDropDown-dropDownContainer")[0].style["max-height"] = (window.innerHeight - 130) + "px";
            document.getElementsByClassName("SearchDropDown-contentWrapper")[0].style["padding"] = "0px";

            html = "<style>.SearchGroup-articleItem:hover {background:#e4e4e4!important;} .SearchGroup-articleItem {padding:10px;} .focusedrow {background:#e4e4e4!important;} .icon-arrow-right-long::before {content:'\\E90A' } #SearchDropDown-moreResults {display:none;font-size:14px;color:lightblue;text-transform:uppercase;margin-left:20px;margin-bottom:0px;margin-right:20px;} .containerHeader {text-transform: uppercase; border-top: 5px solid #002f6c; margin-left: 20px; margin-right: 20px; margin-bottom:20px; font-size: 18px; color: #002f6c;font-weight: 900;padding: 10px;line-height:17px;font-family:Proxima Nova;padding-left:0px;}</style>";
            html = html + "<div id='SearchDropDown-moreResults'>View All Search Results for </div>";
            html = html + "<div id='SearchDropDown-tickerContainerHeader' class='containerHeader' style='margin-bottom:0px;'>Popular Symbols</div>";
            html = html + "<div id='SearchDropDown-tickerContainer'><style> #tickercontainer a:nth-child(2n) .SearchGroup-item {background:#f2f2f2;} .SearchGroup-item:hover {background:#e4e4e4!important;} #tickercontainer {} .extratickers { display:none;transition:visibility 0s, opacity 1.5s linear;} .arrowexpand {transform: rotate(180deg);} .arrowcollapse {transform: rotate(0deg);} </style><div id ='tickercontainer' style='padding: 10px;font-size: 24px; margin-bottom: 10px;padding:20px;padding-top:0px;'></div></div>";
            html = html + "<div id='SearchDropDown-articleContainerHeader' class='containerHeader'>Popular Stories</div>";
            html = html + "<div id='SearchDropDown-articleContainer' style='margin-top:-20px;'></div>";
            var elem = document.createElement("div");
            elem.innerHTML = html;
            document.getElementsByClassName("SearchDropDown-contentContainer")[0].appendChild(elem);

            queryly.initialize();
        },

        initialize: function () {

            try {               
                queryly.currentCursor = -1;
                document.body.style["overflow-y"] = "hidden";

                document.getElementById('query_suggest').style["color"] = "black";
                document.getElementById('query_suggest').setAttribute("disabled", "disabled");

                document.getElementById('query').style["opacity"] = "0.7";
                document.getElementById('query').setAttribute("spellcheck", "false");
                document.getElementById('query').setAttribute("type", "search");
                document.getElementById('Search-form').setAttribute("action", "#");
                document.getElementById('query_suggest').setAttribute("type", "search");


                if (document.getElementById('searchboxbutton') != null) {
                    document.getElementById('searchboxbutton').addEventListener("click", function (event) {
                        if (document.getElementById('searchbox').value.trim() != '') {
                            //window.location = queryly.redirecturl + "?query=" + document.getElementById('searchbox').value
                        }
                    });
                }

                if (document.getElementById('searchbox') != null) {
                    document.getElementById('searchbox').addEventListener("keydown", function (event) {
                        var keyCode = event.keyCode || event.which;
                        if (keyCode == 13) {
                            if (document.getElementById('searchbox').value.trim() != '') {
                                //window.location = queryly.redirecturl + "?query=" + document.getElementById('searchbox').value
                            }
                        }
                    });
                }

                document.getElementById('query').addEventListener("keyup", function (event) {
                    switch (event.keyCode) {
                        case 37: return;
                        case 38: return;
                        case 39: return;
                        case 40: return;
                    }

                    clearTimeout(queryly.searchtimer);
                    clearTimeout(queryly.tickertimer);
                    queryly.search.waitForReturn = false;
                    //generate the full query string based on keyword predication.

                    var current_query = document.getElementById('query').value.trim();
                    if (current_query == '') {
                        queryly.search.resetsearch();
                        queryly.search.dopresearch();
                        event.preventDefault();
                        return;
                    }

                    var full_suggest = queryly.search.getFullSuggestion();
                    if ((full_suggest == '') || (full_suggest.indexOf(current_query.toLowerCase()) != 0)) {
                        queryly.search.facetedkey = []
                        queryly.search.facetedvalue = [];
                        queryly.util.showAnimation(true);
                        queryly.searchtimer = setTimeout("queryly.search.doAdvancedSearch(1);", 300);
                        document.getElementById('query_suggest').value = '';
                        if (document.getElementById('formatfilter') != null) {
                            document.getElementById('formatfilter').selectedIndex = 0;
                        }
                    }
                    
                    try {
                        if (queryly.util.containTickers(current_query)) {
                            var tarray = [];
                            var temps = document.getElementById('query').value.trim().split(',');
                            for (var i = 0; i < temps.length; i++) {
                                if (temps[i].trim() != '') {
                                    tarray.push(temps[i].trim());
                                }
                            }
                            renderTickers([], tarray);
                        }
                        else {
                            queryly.tickertimer = setTimeout(function(){
                                var tickerapi = 'https://symlookup.cnbc.com/symlookup.do?callback=renderTickers&output=jsonp&prefix=' + encodeURIComponent(current_query.trim());                                
                                queryly.util.loadScript(tickerapi, function () {
                                });
                            }, 250);
                            
                        }
                    }
                    catch (e) { }


                    if (document.querySelector("#tickeroutercontainer h3") != null) {
                        document.querySelector("#tickeroutercontainer h3").innerHTML = 'Suggested Symbols';
                    }

                });

                //handle tab key and space key on search box
                document.getElementById('query').addEventListener("keydown", function (event) {
                    var keyCode = event.keyCode || event.which;
                    if (keyCode == 9) {
                        event.preventDefault();
                        var result = queryly.search.getFullSuggestion();
                        if (result != '') {
                            document.getElementById('query').value = result;
                            document.getElementById('query').focus();
                        }
                    }
                    else if (keyCode == 32) {
                        queryly.search.current_suggestion = "";
                    }
                    else if (keyCode == 38) {
                        var rowNodeList = document.querySelectorAll('.SearchGroup-item, .SearchGroup-articleItem');
                        if (queryly.currentCursor == -1) {
                            queryly.currentCursor = rowNodeList.length - 1;
                        }
                        else {
                            queryly.currentCursor = queryly.currentCursor - 1;
                        }
                        
                        for (var i = 0; i < rowNodeList.length; i++) {
                            rowNodeList[i].classList.remove("focusedrow");
                        }
                        for (var i = 0; i < rowNodeList.length; i++) {
                            if (i == queryly.currentCursor) {
                                rowNodeList[i].classList.add("focusedrow");
                                break;
                            }
                        }
                    }
                    else if (keyCode == 40) {
                        var rowNodeList = document.querySelectorAll('.SearchGroup-item, .SearchGroup-articleItem');
                        queryly.currentCursor = queryly.currentCursor + 1;
                        if (queryly.currentCursor == rowNodeList.length) {
                            queryly.currentCursor = -1;
                        }

                        for (var i = 0; i < rowNodeList.length; i++) {
                            rowNodeList[i].classList.remove("focusedrow");
                        }
                        for (var i = 0; i < rowNodeList.length; i++) {
                            if (i == queryly.currentCursor) {
                                rowNodeList[i].classList.add("focusedrow");
                                break;
                            }
                        }
                    }
                    else if (keyCode == 13) {
                        queryly.search.enterkeypressed();
                        event.preventDefault();
                    }
                });

                document.getElementById('query').addEventListener("keypress", function (event) {
                    var keyCode = event.keyCode || event.which;
                    if (keyCode == 13) {
                        event.preventDefault();
                    }
                });
                
                //handle copy-and-paste words into search box
                document.getElementById('query').addEventListener("input propertychange paste", function () {
                    clearTimeout(queryly.searchtimer);
                    queryly.search.waitForReturn = false;

                    if (document.getElementById('query').value == '') {
                        queryly.search.resetsearch();
                        return;
                    }
                    else {
                        queryly.util.showAnimation(true);
                        queryly.searchtimer = setTimeout("queryly.search.doAdvancedSearch(1);", 300);
                    }
                });

                document.getElementById('query').addEventListener("click", function (event) {
                    var result = queryly.search.getFullSuggestion();
                    if (result != '') {
                        document.getElementById('query').value = result;
                    }
                });

                Array.prototype.forEach.call(document.getElementsByClassName('Search-submitBtn'), function (elem) {
                    elem.addEventListener("click", function (event) {
                        queryly.search.enterkeypressed();
                    });
                });

                document.getElementById("query").addEventListener("search", function (event) {
                    queryly.search.resetsearch();
                    queryly.search.dopresearch();
                });

                
                if (document.getElementById("back-top-top") == null && !queryly.desktopsearch) {
                    elem = document.createElement("div");
                    elem.innerHTML = "<style> #back-top-top { bottom:15px!important;} @media screen and (min-width: 0px) and (max-width:760px) { #back-top-top { bottom:65px!important; } }</style><span style='z-index:99999;margin-right:15px;display:none;' id='back-top-top' onclick='queryly.util.backToTop();return false;' class='icon icon-buffett-backtotop'></span>";
                    document.getElementsByTagName("body")[0].insertBefore(elem, document.getElementsByTagName("body")[0].firstChild)
                }


                document.onscroll = function () {
                    queryly.search.onscroll();
                };

                if (window.location.href.toLowerCase().indexOf('cnbc.com/search') >= 0) {
                    var sPageURL = window.location.search.substring(1);
                    var sURLVariables = sPageURL.split('&');
                    for (var i = 0; i < sURLVariables.length; i++) {
                        var sParameterName = sURLVariables[i].split('=');
                        if (sParameterName[0].toLowerCase() == 'query') {
                            document.getElementById('query').value = decodeURIComponent(sParameterName[1]);
                            queryly.util.showAnimation(true);                           
                            if (document.getElementById('query').value.trim() != '') {
                                queryly.search.doAdvancedSearch(1);
                                var tickerapi = 'https://symlookup.cnbc.com/symlookup.do?callback=renderTickers&output=jsonp&prefix=' + encodeURIComponent(document.getElementById('query').value);
                                
                                queryly.util.loadScript(tickerapi, function () {
                                });
                            }
                            else {
                                queryly.search.dopresearch();
                            }
                            return;
                        }
                    }
                    queryly.search.dopresearch();
                }
                else {
                    if (document.getElementById('query').value != '') {
                        var tickerapi = 'https://symlookup.cnbc.com/symlookup.do?callback=renderTickers&output=jsonp&prefix=' + encodeURIComponent(document.getElementById('query').value.trim());
                        
                        queryly.util.loadScript(tickerapi, function () {
                        });

                        queryly.searchtimer = setTimeout("queryly.search.doAdvancedSearch(1);", 100);
                    }
                    else {
                        queryly.search.dopresearch();
                    }
                    
                }

                document.getElementById("back-top-top").addEventListener("mouseup", function (event) {
                    queryly.util.backToTop();
                    event.preventDefault();
                    event.stopPropagation();
                });

                document.getElementById("back-top-top").addEventListener("touchend", function (event) {
                    queryly.util.backToTop();
                    event.preventDefault();
                    event.stopPropagation();
                });

                document.getElementById("back-top-top").addEventListener("click", function (event) {
                    queryly.util.backToTop();
                    event.preventDefault();
                    event.stopPropagation();
                });              
            }
            catch (e) { }
        }
    };

    queryly.search = {
        totalpage: 0,
        pagerequested: 0,
        current_suggestion: '',
        current_query: '',
        total: 0,
        batchSize: 10,
        waitForReturn: false,
        sortby: '',
        facetedkey: [],
        facetedvalue: [],
        current_tickers: [],

        resetsearch: function () {
            queryly.currentCursor = -1;
            document.getElementById('MainContent').style['display'] = 'block';
            if (!queryly.desktopsearch) {
                window.scrollTo(0, 0);
            }
           


            queryly.util.showAnimation(false);
            queryly.search.current_suggestion = '';
            queryly.search.current_query = '';
            queryly.search.total = 0;
            if (document.getElementById('query') != null) {
                document.getElementById('query').value = '';
                document.getElementById('query_suggest').value = '';
                var elem = document.getElementById('searchwaitmessage');
                if (elem != null) { elem.parentNode.removeChild(elem); }
            }

            if (document.getElementById('SearchDropDown-moreResults') != null) {
                document.getElementById('SearchDropDown-moreResults').innerHTML = "";
                document.getElementById('SearchDropDown-moreResults').style.display = "none";
            }
        },

        enterselectedrow: function () {
            if (queryly.currentCursor >= 0) {
                var rowNodeList = document.querySelector('.SearchDropDown-contentContainer').querySelectorAll('.SearchGroup-item, .SearchGroup-articleItem');
                if (queryly.currentCursor < rowNodeList.length) {
                    var target = rowNodeList[queryly.currentCursor].parentNode;
                    if (target != null && typeof target.href != 'undefined') {
                        window.location.href = target.href;
                        return true;
                    }
                }
            }
            return false;
        },

        enterkeypressed: function () {
            try {
                if (queryly.search.enterselectedrow()) {
                    return false;
                }

                var ticker = document.getElementById('query').value.trim().toLowerCase();
                if (ticker == "") {
                    return false;
                }

                var loaderhtml = '<style> @media screen and (min-width: 0px) and (max-width: 770px) { .redirectloading { top:0px!important;right:40px!important; } }</style><svg class="redirectloading" style="z-index:999999;background:white;width: 50px;height: 50px;display: inline-block;position: absolute;top: 10px;right: 100px;" viewBox="0 0 64 64" style="width: 50px;height: 50px;"><g><circle cx="16" cy="32" stroke-width="0" r="4.93752"><animate attributeName="fill-opacity" dur="750ms" values=".5;.6;.8;1;.8;.6;.5;.5" repeatCount="indefinite"></animate><animate attributeName="r" dur="750ms" values="3;3;4;5;6;5;4;3" repeatCount="indefinite"></animate></circle><circle cx="32" cy="32" stroke-width="0" r="3.93752"><animate attributeName="fill-opacity" dur="750ms" values=".5;.5;.6;.8;1;.8;.6;.5" repeatCount="indefinite"></animate><animate attributeName="r" dur="750ms" values="4;3;3;4;5;6;5;4" repeatCount="indefinite"></animate></circle><circle cx="48" cy="32" stroke-width="0" r="3"><animate attributeName="fill-opacity" dur="750ms" values=".6;.5;.5;.6;.8;1;.8;.6" repeatCount="indefinite"></animate><animate attributeName="r" dur="750ms" values="5;4;3;3;4;5;6;5" repeatCount="indefinite"></animate></circle></g></svg>';
                if (queryly.desktopsearch) {
                    loaderhtml = '<svg style="z-index:999999;background:white;width: 50px;height: 40px;display: inline-block;position: absolute;top: -6px;right: 40px;" viewBox="0 0 64 64" style="width: 50px;height: 50px;"><g><circle cx="16" cy="32" stroke-width="0" r="4.93752"><animate attributeName="fill-opacity" dur="750ms" values=".5;.6;.8;1;.8;.6;.5;.5" repeatCount="indefinite"></animate><animate attributeName="r" dur="750ms" values="3;3;4;5;6;5;4;3" repeatCount="indefinite"></animate></circle><circle cx="32" cy="32" stroke-width="0" r="3.93752"><animate attributeName="fill-opacity" dur="750ms" values=".5;.5;.6;.8;1;.8;.6;.5" repeatCount="indefinite"></animate><animate attributeName="r" dur="750ms" values="4;3;3;4;5;6;5;4" repeatCount="indefinite"></animate></circle><circle cx="48" cy="32" stroke-width="0" r="3"><animate attributeName="fill-opacity" dur="750ms" values=".6;.5;.5;.6;.8;1;.8;.6" repeatCount="indefinite"></animate><animate attributeName="r" dur="750ms" values="5;4;3;3;4;5;6;5" repeatCount="indefinite"></animate></circle></g></svg>';
                }

                if (queryly.toptickers.indexOf(ticker) >= 0 || queryly.util.containTickers(ticker)) {
                    window.location.href = "https://www.cnbc.com/quotes/?symbol=" + encodeURIComponent(ticker) + "&qsearchterm=" + ticker;
                    var elem = document.createElement("div");                    
                    elem.innerHTML = loaderhtml;
                    document.getElementById('Search-form').appendChild(elem);
                    return false;
                }

                document.getElementById('query').blur();
                var result = queryly.search.getFullSuggestion();
                if (result != '') {
                    document.getElementById('query').value = result;
                }
                else {
                    result = document.getElementById('query').value;
                }


                var elem = document.createElement("div");                
                elem.innerHTML = loaderhtml;
                document.getElementById('Search-form').appendChild(elem);

                var url = 'https://symlookup.cnbc.com/symlookup.do?output=json&prefix=' + encodeURIComponent(ticker);
                
                queryly.util.callAjax(url, function (response) {
                    if (typeof response != 'undefined' && response.length > 0) {
                        for (var i = 0; i < response.length; i++) {
                            if (typeof response[i].symbolName != 'undefined' && response[i].symbolName.toLowerCase() == ticker) {
                                window.location.href = "https://www.cnbc.com/quotes/?symbol=" + encodeURIComponent(ticker) + "&qsearchterm=" + ticker;
                                return false;
                            }
                        }
                    }
                    window.location.href = "/search/?query=" + encodeURIComponent(result) + "&qsearchterm=" + result;

                },true);
                
            }
            catch (e) { }
            return false;
        },

        onscroll: function () {
            if (queryly.desktopsearch) {
                return;
            }           

            if (document.getElementById('searchoutercontainer') != null && document.getElementById('searchoutercontainer').style['display'] != 'none') {
                if (window.pageYOffset !== undefined) {
                    if (document.getElementById('back-top-top') != null) {
                        if (document.getElementById('searchoutercontainer').getBoundingClientRect().top < -150) {
                            document.getElementById('back-top-top').style['display'] = 'block';
                        }
                        else {
                            document.getElementById('back-top-top').style['display'] = 'none';
                        }
                    }

                }

                if (!queryly.instantSearch || document.getElementById('query') == null || document.getElementById('query').value == '') {
                    return;
                }
                if (queryly.search.totalpage <= queryly.search.pagerequested) {
                    return;
                }


                var x = ((window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop) + window.innerHeight;
                var y = document.getElementById('searchcontainer').offsetHeight;


                var totalheight = document.getElementById('searchcontainer').offsetHeight;
                var off = document.getElementById('searchcontainer').getBoundingClientRect().top;
                //var innercontainerheight = document.getElementById('searchoutercontainer').offsetHeight;
                var innercontainerheight = window.innerHeight;
                var delta = totalheight + off - innercontainerheight;
                if (delta < 200) {
                    if (!queryly.search.waitForReturn) {
                        try {
                            queryly.search.waitForReturn = true;
                            queryly.search.doAdvancedSearch(queryly.search.pagerequested + 1);

                        }
                        catch (ex) { queryly.search.waitForReturn = false; }
                    }
                }
            }
        },

        switchsort: function (sortby) {
            queryly.search.sortby = sortby
            queryly.search.doAdvancedSearch(1);
            return false;
        },

        switchformat: function (option) {
            queryly.search.facetedkey = [];
            queryly.search.facetedvalue = [];
            if (option.value != '') {
                queryly.search.facetedkey.push("formats");
                queryly.search.facetedvalue.push(option.value);
            }
            queryly.search.doAdvancedSearch(1);
            return false;
        },

        resetkeyword: function () {
            document.getElementById('keyword').value = '';
        },

        dopresearch: function () {
            

            try {
                var tnames = [];
                var cookievalue = queryly.util.getCookie('savedViewedSymbols');
                if (cookievalue == null || cookievalue == '' || (JSON.parse(cookievalue) != null && JSON.parse(cookievalue).length == 0)) {
                    var topquotes = "https://webql.cnbcfm.com/graphql/?query={mostPopularQuotes(source:parsely%20count:10%20sortBy:%22views%22%20startPeriod:%225m%22%20tag:%22Quote%20Single%22){assets{issueId%20issuerId%20type%20subType%20name%20exchangeName%20symbol%20altSymbol%20tickerSymbol%20url}}}";
                    queryly.util.callAjax(topquotes, queryly.search.renderPopularQuotes);
                    if (document.querySelector("#tickeroutercontainer h3") != null) {
                        document.querySelector("#tickeroutercontainer h3").innerHTML = 'Popular Symbols';
                    }

                    if (document.querySelector("#SearchDropDown-tickerContainerHeader") != null) {
                        document.querySelector("#SearchDropDown-tickerContainerHeader").innerHTML = 'Popular Symbols';
                    }
                }
                else {
                    var tickerhtml = '';
                    var tickers = JSON.parse(cookievalue);
                    for (var i = 0; i < Math.min(10, tickers.length) ; i++) {
                        if (typeof tickers[i].symbolName != 'undefined') {
                            tnames.push(tickers[i].symbolName);
                            var companyName = " ";
                            if (typeof tickers[i].companyName != 'undefined') {
                                companyName = tickers[i].companyName;
                            }
                            tickerhtml = tickerhtml + '<a style="color:black;" href="//cnbc.com/quotes/?symbol=' + tickers[i].symbolName + '&amp;qsearchterm="><div class="SearchGroup-item"><div class="SearchGroup-itemIdentifier"><span class="SearchGroup-itemTitle">' + tickers[i].symbolName + '</span><span class="SearchGroup-itemSubTitle">' + companyName + '</span ></div > <span class="SearchGroup-marketChangeUp SearchGroup-marketChange"><span style="color:black;font-size:14px;" class="SearchGroup-change">loading...</span><span class="SearchGroup-change_pct" style="display: inline-block;font-size:14px; color:rgb(0, 132, 86); "></span><span class="SearchGroup-change_pct" style="display: inline-block;margin-left:10px;font-size:14px;; color:rgb(0, 132, 86); "></span></span></div ></a > ';
                        }
                    }
                    document.getElementById('tickercontainer').innerHTML = tickerhtml;
                    if (document.querySelector("#tickeroutercontainer h3") != null) {
                        document.querySelector("#tickeroutercontainer h3").innerHTML = 'Recently Viewed Symbols';
                    }

                    if (document.querySelector("#SearchDropDown-tickerContainerHeader") != null) {
                        document.querySelector("#SearchDropDown-tickerContainerHeader").innerHTML = 'Recently Viewed Symbols';
                    }

                    var quoteapi = 'https://quote.cnbc.com/quote-html-webservice/quote.htm?&symbols=' + encodeURIComponent(tnames.join('|')) + '&requestMethod=quick&noform=1&exthrs=1&callback=renderTickerQuotes&output=jsonp';
                    queryly.util.loadScript(quoteapi, function () {
                    });
                }

                var url = queryly.searchapi + "/cnbc/json.aspx?queryly_key=" + queryly.QuerylyKey + "&presearch=1";
                if (queryly.toptickers.length == 0) {
                    url = url + "&needtoptickers=1";
                }
                queryly.util.callAjax(url, queryly.search.renderPreSearch);                
            }
            catch (e) { }


        },

        doAdvancedSearch: function (pagerequested) {
            queryly.currentCursor = -1;
            var query = document.getElementById('query').value;
            var timeoffset = new Date().getTimezoneOffset();
            var url = queryly.searchapi + "/cnbc/json.aspx?queryly_key=" + queryly.QuerylyKey + "&query=" + encodeURIComponent(query) + "&endindex=" + Math.max(0, pagerequested - 1) * queryly.search.batchSize + "&batchsize=" + queryly.search.batchSize + "&callback=&showfaceted=true&timezoneoffset=" + timeoffset + "&facetedfields=formats";
            var keys = '';
            var values = ''
            if (queryly.search.facetedkey.length == 0) {
                queryly.search.facetedkey.push("formats");
                queryly.search.facetedvalue.push("!Press Release");
            }

            for (var i = 0; i < queryly.search.facetedkey.length; i++) {
                keys = keys + queryly.search.facetedkey[i] + "|";
                values = values + queryly.search.facetedvalue[i] + "|";
            }

            if (queryly.search.facetedkey.length > 0) {
                url = url + "&facetedkey=" + encodeURIComponent(keys) + "&facetedvalue=" + encodeURIComponent(values);
            }

            if (queryly.search.sortby != '') {
                url = url + '&sort=' + queryly.search.sortby;
            }
            //making the search call to Queryly server
            if (document.getElementById('searchcontainer') != null) {
                document.getElementById('searchcontainer').style['display'] = 'block';
            }

            if (queryly.toptickers.length == 0) {
                url = url + '&needtoptickers=1';
            }

            if (queryly.additionalindexes != '') {
                url = url + '&additionalindexes=' + queryly.additionalindexes;
            }

            queryly.util.callAjax(url, queryly.search.renderAdvancedResults);
        },

        //generate a auto-completed keyword based on the search suggestion
        getFullSuggestion: function () {
            var result = '';
            //if (queryly.search.current_suggestion == '') {
            //    return document.getElementById('query').value;
            //}
            if (document.getElementById('query') != null && queryly.search.current_suggestion != '') {
                var q = document.getElementById('query').value;
                if (q.length > 0) {
                    var lastchar = q.charAt(q.length - 1);
                    var lastword = queryly.util.getLastWord(q);
                    var partialword = queryly.search.current_suggestion.substring(lastword.length);
                    if (lastchar != ' ' && queryly.search.current_suggestion.substring(0, lastword.length) == lastword.toLowerCase()) {
                        result = q + partialword;
                    }
                }
            }
            return result;
        },

        renderFormat: function (results) {
            var selecteditem = "";
            if (queryly.search.facetedvalue.length > 0) {
                selecteditem = queryly.search.facetedvalue[0];
                if (selecteditem != "!Press Release") {
                    return;
                }
            }
            var html = '<select style="font-weight:500;color:#171717;outline:none;font-size:12px;width:100%;cursor:pointer;-moz-appearance:none;min-width:150px;background:white;" onchange="queryly.search.switchformat(this);" id="formatfilter" class="minimal SearchResults-searchResultsSelect"><option value="">All Results</option></label>';
            if (typeof results.filters != 'undefined' && typeof results.filters.formats != 'undefined') {
                var foundPressRelease = false;
                for (var i = 0; i < results.filters.formats.length; i++) {
                    var selected = "";
                    if (results.filters.formats[i].key == selecteditem) { selected = "selected"; }

                    if (results.filters.formats[i].key == "Press Release") {
                        foundPressRelease = true;
                        continue;
                    }
                    html = html + "<option " + selected + " onchange='queryly.search.switchformat(this);' value='" + results.filters.formats[i].key + "'>" + results.filters.formats[i].key + "</option>";
                }

                html = html + "<option " + selected + " onchange='queryly.search.switchformat(this);' value='Press Release'>Press Release</option>";


            }

            html = html + "</select>";
            if (document.getElementById('formatfilter') == null) {
                var elem = document.createElement("div");
                elem.innerHTML = "<label class='SearchResults-resultsFilterGroup'><span class='SearchResults-resultsFilterLabel'>FILTER RESULTS</span>" + html + "<span class='SearchResults-searchResultsSelectIcon icon-arrow-down-readmore'></span>";
                if (document.getElementsByClassName('SearchResults-searchResultsSelectWrapper') != null) {
                    document.getElementsByClassName('SearchResults-searchResultsSelectWrapper')[0].appendChild(elem);
                }
            }
            else {
                document.getElementById('formatfilter').innerHTML = html;
            }
        },       

        renderPreSearch: function (results) {
            try {

                if (typeof results.toptickers != 'undefined' && queryly.toptickers.length == 0) {
                    queryly.toptickers = results.toptickers;
                }

                if (document.getElementsByClassName('bars-loading').length > 0) {
                    document.getElementsByClassName('bars-loading')[0].style['display'] = 'none';
                }
                if (queryly.desktopsearch) {
                    document.getElementById("SearchDropDown-articleContainer").innerHTML = '';
                    document.getElementById("SearchDropDown-articleContainerHeader").innerText = "Popular Stories";
                    queryly.search.renderSearchContainerForDesktop(results);
                }
                else {
                    if (document.getElementsByClassName('SearchResults-searchResultsWrapper').length > 0) {
                        document.getElementsByClassName('SearchResults-searchResultsWrapper')[0].setAttribute("style", "display:none;");
                    }


                    if (typeof results.results == 'undefined' || results.results.length == 0) {
                        document.getElementById('searchcontainer').innerHTML = '';
                        return;
                    }

                    document.getElementById('searchcontainer').innerHTML = '';

                    if (document.getElementById('presearchheader') == null) {
                        var elem = document.createElement("center");
                        elem.innerHTML = '<div id="presearchheader" style="border-top: 1px solid #ccc;margin-bottom: 20px;width: 86%;margin-top:40px;"><div style="display: inline-block;padding-left: 10px;padding-right: 10px;background: white;position: relative;top: -28px;font-size:30px;font-weight:bold;font-weight: bold;color: #444;color:#03557f;">Popular Stories</div></div>';
                        queryly.search.renderSearchContainer(results);
                        if (typeof document.getElementById('searchcontainer').prepend != 'undefined') {
                            document.getElementById('searchcontainer').prepend(elem);
                        }
                        else {
                            document.getElementById('searchcontainer').insertBefore(elem, document.getElementById('searchcontainer').firstChild);
                        }
                    }
                }

            }
            catch (e) { }

            if (document.getElementById('searchoutercontainer') != null) {
                document.getElementById('searchoutercontainer').style['display'] = 'block';
            }
            queryly.search.waitForReturn = false;
        },


        renderPopular: function (results) {
            var profiles = [];
            var shows = [];
            var popularhtml = '';
            var fullsuggest = '';
            try {
                fullsuggest = queryly.search.getFullSuggestion().trim();
                if (fullsuggest == '') {
                    fullsuggest = document.getElementById('query').value.trim();
                }
            }
            catch (e) { }


            if (results.metadata.pagerequested == 1 && typeof results.relatedtags != 'undefined' && results.relatedtags.length > 0) {
                popularhtml = "<style> @media screen and (min-width: 0px) and (max-width: 500px) { #popularcontainer { display:none; } }</style><div id='search_topic_container' class='Topic-container'><h1 class='Topic-header'>More On This Topic</h1>";
                for (var i = 0; i < results.relatedtags.length; i++) {
                    var taghtml = '';
                    if (results.relatedtags[i].results.length == 0) {
                        continue;
                    }
                    var found = false;
                    if (results.relatedtags[i].type == 'topic') {

                        for (var j = 0; j < results.relatedtags[i].results.length; j++) {
                            if (results.relatedtags[i].results[j].name == "Wires" || results.relatedtags[i].results[j].name == "Press Releases") {
                                continue;
                            }
                            found = true;
                            taghtml = taghtml + "<li class='Topic-contentListItem'><a href='" + results.relatedtags[i].results[j].url + "?&qsearchterm=" + fullsuggest + "'>" + results.relatedtags[i].results[j].name + "</a></li>";
                        }

                        if (found) {
                            popularhtml = popularhtml + '<div class="Topic-contentType"><h4 class="Topic-contentTitle">topics</h4><ul class="Topic-contentList">' + taghtml + '</url></div>';
                        }
                    }
                    else if (results.relatedtags[i].type == 'show') {

                        for (var j = 0; j < results.relatedtags[i].results.length; j++) {
                            found = true;
                            taghtml = taghtml + "<li class='Topic-contentListItem'><a href='" + results.relatedtags[i].results[j].url + "?&qsearchterm=" + fullsuggest + "'>" + results.relatedtags[i].results[j].name + "</a></li>";

                            if (results.relatedtags[i].results[j].matchkeyword) {                                
                                shows.push(results.relatedtags[i].results[j]);
                            }
                        }
                        if (found) {
                            popularhtml = popularhtml + '<div class="Topic-contentType"><h4 class="Topic-contentTitle">shows</h4><ul class="Topic-contentList">' + taghtml + '</url></div>';
                        }

                    }
                    else if (results.relatedtags[i].type == 'special_report') {

                        for (var j = 0; j < results.relatedtags[i].results.length; j++) {
                            if (results.relatedtags[i].results[j].name == "Special Reports") {
                                continue;
                            }
                            found = true;
                            taghtml = taghtml + "<li class='Topic-contentListItem'><a href='" + results.relatedtags[i].results[j].url + "?&qsearchterm=" + fullsuggest + "'>" + results.relatedtags[i].results[j].name + "</a></li>";

                        }
                        if (found) {
                            popularhtml = popularhtml + '<div class="Topic-contentType"><h4 class="Topic-contentTitle">special reports</h4><ul class="Topic-contentList">' + taghtml + '</url></div>';
                        }

                    }
                    else if (results.relatedtags[i].type == 'person') {

                        for (var j = 0; j < results.relatedtags[i].results.length; j++) {
                            if (results.relatedtags[i].results[j].name.toLowerCase() == "donald trump") {
                                continue;
                            }
                            if (results.relatedtags[i].results[j].type == "creator") {
                                if (results.relatedtags[i].results[j].matchkeyword) {
                                    profiles.push(results.relatedtags[i].results[j]);
                                }
                            }
                            else {
                                found = true;
                                taghtml = taghtml + "<li class='Topic-contentListItem'><a href='" + results.relatedtags[i].results[j].url + "?&qsearchterm=" + fullsuggest + "'>" + results.relatedtags[i].results[j].name + "</a></li>";
                            }
                        }
                        if (found) {
                            popularhtml = popularhtml + '<div class="Topic-contentType"><h4 class="Topic-contentTitle">people</h4><ul class="Topic-contentList">' + taghtml + '</url></div>';
                        }

                    }
                }
            }

            if (profiles.length == 0 && shows.length > 0) {
                profiles = shows;
            }

            if (typeof results.topics != 'undefined' && results.topics.length > 0) {
                queryly.resultdata = {};
                queryly.resultdata['cn:title'] = results.topics[0].title;
                queryly.resultdata['cn:liveURL'] = results.topics[0].link + "?&qsearchterm=" + fullsuggest;
                queryly.resultdata['description'] = '';

                queryly.resultdata['cn:promoImage'] = '';
                if (typeof results.topics[0].image != 'undefined' && results.topics[0].image != '') {
                    queryly.resultdata['cn:promoImage'] = results.topics[0].image + '&w=300&h=150';
                }
                if (typeof results.topics[0].description != 'undefined') {
                    queryly.resultdata['description'] = results.topics[0].description;
                }
                queryly.resultdata['_pubDate'] = '';
                var html = queryly.util.tmpl('queryly_template_cnbc', queryly.resultdata);
                var elem = document.createElement("div");
                elem.innerHTML = html;
                document.getElementById('searchcontainer').appendChild(elem);
            }

            if (profiles.length == 1) {
                queryly.resultdata = {};
                queryly.resultdata['cn:title'] = profiles[0].name;
                queryly.resultdata['cn:liveURL'] = profiles[0].url + "?&qsearchterm=" + fullsuggest;
                queryly.resultdata['description'] = profiles[0].description;
                if (profiles[0].description == '') {
                    queryly.resultdata['description'] = profiles[0].name + "'s profile page";
                }
                queryly.resultdata['cn:promoImage'] = '';
                if (typeof profiles[0].image != 'undefined' && profiles[0].image != '') {
                    queryly.resultdata['cn:promoImage'] = profiles[0].image + '&w=300&h=150';
                }
                if (typeof profiles[0].description != 'undefined') {
                    queryly.resultdata['description'] = profiles[0].description;
                }
                queryly.resultdata['_pubDate'] = '';


                var html = queryly.util.tmpl('queryly_template_cnbc', queryly.resultdata);
                var elem = document.createElement("div");
                elem.innerHTML = html;
                document.getElementById('searchcontainer').appendChild(elem);

            }
            return popularhtml;
        },

        partnerMoveRight: function (unit) {
            try {
                var divs = document.getElementsByClassName("CrossPromotionBreaker-crossPromotionalBreakerSlide");   // order: first, second, third
                if (unit == -1) {
                    divs[0].parentNode.insertBefore(divs[divs.length - 1], divs[0]);
                }
                else {
                    divs[0].parentNode.appendChild(divs[0]);
                }
            }
            catch (e) { }

        },

        renderSearchContainerForDesktop: function (results) {
            if (document.getElementsByClassName('bars-loading').length > 0) {
                document.getElementsByClassName('bars-loading')[0].style['display'] = 'none';
            }

            var fullsuggest = '';
            try {
                fullsuggest = queryly.search.getFullSuggestion().trim();
                if (fullsuggest == '') {
                    fullsuggest = document.getElementById('query').value.trim();
                }
            }
            catch (e) { }

            for (var i = 0; i < results.results.length; i++) {
                if (i == 3) {
                    break;
                }
                queryly.resultdata = results.results[i];
                queryly.resultdata['cn:liveURL'] = queryly.resultdata['cn:liveURL'] + "?&qsearchterm=" + fullsuggest;

                queryly.resultdata.label = '';
                if (queryly.resultdata["cn:promoImage"] != '') {
                    queryly.resultdata["cn:promoImage"] = queryly.resultdata["cn:promoImage"] + '&w=300&h=150';
                }

                if (queryly.resultdata.brand == 'makeit') {
                    //queryly.resultdata.partnerSectionLabel = '<img src="//www.queryly.com/images/make-it-logo-dark.png"/>';
                    queryly.resultdata.partnerSectionLabel = '<a style="color:#005594;" href="https://www.cnbc.com/make-it/?qsearchterm=' + fullsuggest + '">Make It</a>';
                }
                else if (queryly.resultdata.brand == 'acorns') {
                    //queryly.resultdata.partnerSectionLabel = '<img src="//www.queryly.com/images/grow-logo-search.png"/>';
                    queryly.resultdata.partnerSectionLabel = '<a style="color:#005594;" href="https://grow.acorns.com/?qsearchterm=' + fullsuggest + '">Grow</a>';
                }
                else if (queryly.resultdata.brand == 'select') {
                    //queryly.resultdata.partnerSectionLabel = '<img src="//www.queryly.com/images/select-logo-search.png"/>';
                    queryly.resultdata.partnerSectionLabel = '<a style="color:#005594;" href="https://www.cnbc.com/select/?qsearchterm=' + fullsuggest + '">Select</a>';
                }
                else if (queryly.resultdata.brand == 'buffett') {
                    //queryly.resultdata.partnerSectionLabel = '<img src="//www.queryly.com/images/buffet_archive_logo.png"/>';
                    queryly.resultdata.partnerSectionLabel = '<a style="color:#005594;" href="https://buffett.cnbc.com/?qsearchterm=' + fullsuggest + '">Warren Buffett Archive</a>';
                    try {
                        if (typeof queryly.resultdata["cn:videoTranscript"] != 'undefined' && typeof queryly.resultdata["cn:videoTranscript"]["cn:chapter"] != 'undefined' && queryly.resultdata["cn:videoTranscript"]["cn:chapter"].length > 0) {
                            if (typeof queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0]["cn:transcript"] != 'undefined') {
                                queryly.resultdata.videofooter = "chapter " + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].chapter + " : " + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].title;
                                queryly.resultdata['cn:title'] = queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0]["cn:transcript"][0].title;
                                queryly.resultdata.description = '';
                                if (typeof queryly.resultdata["cn:videoTranscript"]["videoimage"] != "undefined") {
                                    queryly.resultdata["cn:promoImage"] = queryly.resultdata["cn:videoTranscript"]["videoimage"];
                                }
                                if (typeof queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0]["cn:transcript"][0].in != 'undefined') {
                                    queryly.resultdata.videopoints = "start=" + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0]["cn:transcript"][0].in;
                                }
                                queryly.resultdata.label = 'Excerpt';
                                if (typeof queryly.resultdata.section != 'undefined' && queryly.resultdata.section != '') {
                                    queryly.resultdata.label = 'Excerpt  |  ' + queryly.resultdata.section;
                                }
                                queryly.resultdata['cn:liveURL'] = queryly.resultdata["cn:videoTranscript"]["videourl"] + "?&" + queryly.resultdata.videopoints;
                                videoin = queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0]["cn:transcript"][0].in;
                            }
                            else {
                                queryly.resultdata.videofooter = queryly.resultdata["cn:videoTranscript"]["videotitle"];
                                if (typeof queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].chapter == 'undefined') {
                                    try {
                                        queryly.resultdata['cn:title'] = queryly.resultdata["cn:videoTranscript"]["videotitle"];

                                        queryly.resultdata.label = 'Full Length';
                                        queryly.resultdata['cn:liveURL'] = queryly.resultdata["cn:videoTranscript"]["videourl"];
                                        if (typeof queryly.resultdata["cn:videoTranscript"]["videoimage"] != "undefined") {
                                            queryly.resultdata["cn:promoImage"] = queryly.resultdata["cn:videoTranscript"]["videoimage"];
                                        }
                                        if (typeof queryly.resultdata.section != 'undefined' && queryly.resultdata.section != '') {
                                            queryly.resultdata.label = 'Full Length  |  ' + queryly.resultdata.section;
                                        }
                                        videoin = -1;
                                        delete queryly.resultdata.videofooter;
                                    }
                                    catch (e) { }
                                }
                                else {
                                    queryly.resultdata['cn:title'] = "Chapter " + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].chapter + ". " + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].title;
                                    if (typeof queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].in != 'undefined') {
                                        queryly.resultdata.videopoints = "start=" + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].in;
                                        videoin = queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].in;
                                        if (typeof queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].out != 'undefined') {
                                            queryly.resultdata.videopoints = queryly.resultdata.videopoints + "&end=" + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].out;                                            
                                        }
                                    }
                                    queryly.resultdata.label = 'Chapter';
                                    queryly.resultdata['cn:liveURL'] = queryly.resultdata["cn:videoTranscript"]["videourl"] + "?&" + queryly.resultdata.videopoints;
                                    if (typeof queryly.resultdata["cn:videoTranscript"]["videoimage"] != "undefined") {
                                        queryly.resultdata["cn:promoImage"] = queryly.resultdata["cn:videoTranscript"]["videoimage"];
                                    }
                                    if (typeof queryly.resultdata.section != 'undefined' && queryly.resultdata.section != '') {
                                        queryly.resultdata.label = 'Chapter  |  ' + queryly.resultdata.section;
                                    }
                                }
                            }

                            if (typeof queryly.resultdata.videopoints != 'undefined') {
                                queryly.resultdata['cn:liveURL'] = queryly.resultdata["cn:videoTranscript"]["videourl"] + "?&" + queryly.resultdata.videopoints;
                            }
                        }
                    }
                    catch (e) { }
                }

                queryly.resultdata['cn:title'] = queryly.resultdata['cn:title'].replace(/(([^\s]+\s\s*){15})(.*)/, "$1...");
                queryly.resultdata['cn:title'] = queryly.util.highlight(queryly.resultdata['cn:title'], results.metadata.stems);

                if (queryly.resultdata.brand == 'makeit' || queryly.resultdata.brand == 'buffett' || queryly.resultdata.brand == 'acorns' || queryly.resultdata.brand == 'select' ) {
                    queryly.resultdata['cn:title'] = queryly.resultdata['cn:title'] + "<img style='vertical-align: bottom;display:inline-block;width: 14px;height: 14px;margin-left: 2px;' src='//www.queryly.com/images/arrowout.png' />"
                }

                queryly.resultdata.description = queryly.resultdata.description.replace(/(([^\s]+\s\s*){25})(.*)/, "$1...")
                queryly.resultdata.description = queryly.util.highlight(queryly.resultdata.description, results.metadata.stems);

                if (typeof queryly.resultdata.duration != 'undefined') {
                    var minutes = Math.floor(queryly.resultdata.duration / 60);
                    var secs = queryly.resultdata.duration % 60;
                    if (minutes != 0 || secs != 0) {
                        if (secs < 10) {
                            secs = "0" + secs;
                        }

                        queryly.resultdata.videoduration = minutes + ":" + secs;
                    }
                }

                try {
                    if (typeof queryly.resultdata.author != 'undefined' && queryly.resultdata.author != '' && typeof results.resources != 'undefined') {
                        for (var j = 0; j < results.resources.length; j++) {
                            if (results.resources[j].group == 'creator') {
                                for (var k = 0; k < results.resources[j].results.length; k++) {
                                    if (queryly.resultdata.author.toLowerCase() == results.resources[j].results[k].name.toLowerCase()) {
                                        queryly.resultdata.authorurl = results.resources[j].results[k].url + "?&qsearchterm=" + fullsuggest;
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
                catch (e) { }

                try {
                    if (typeof queryly.resultdata.section != 'undefined' && queryly.resultdata.section != '' && typeof results.resources != 'undefined') {
                        for (var j = 0; j < results.resources.length; j++) {
                            if (results.resources[j].group == 'section' || results.resources[j].group == 'franchise') {
                                for (var k = 0; k < results.resources[j].results.length; k++) {
                                    if (queryly.resultdata.section.toLowerCase() == results.resources[j].results[k].name.toLowerCase()) {
                                        queryly.resultdata.sectionurl = results.resources[j].results[k].url + "?&qsearchterm=" + fullsuggest;
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
                catch (e) { }

                try {
                    var imagediv = '';
                    if (queryly.resultdata["cn:promoImage"] != '') {
                        queryly.resultdata["cn:promoImage"] = queryly.resultdata["cn:promoImage"].replace("&w=300&h=150", "&w=80&h=80");
                        imagediv = "<div style='margin-left:10px;width:80px;height:80px;float:right;background-position:center;background-image:url(\"" + queryly.resultdata["cn:promoImage"] + "\");' /></div>";
                    }

                    //var datepublished = new Date(queryly.resultdata["datePublished"].split('+')[0]);
                    var datepublished = new Date(queryly.resultdata["_pubDate"]);
                    var datestring = datepublished.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                    var html = "<a href='" + queryly.resultdata["cn:liveURL"] + "'><div class='SearchGroup-articleItem' style='border-bottom:1px solid #ccc;height:100px;margin: 20px;margin-bottom:0px;margin-top:0px;'>" + imagediv + "<div style='font-family:Proxima Nova;font-weight:bold;color: rgba(23, 23, 23, 1);line-height:16px;text-align:left;font-size:14px;padding-bottom:20px;'>" + queryly.resultdata["cn:title"] + "<div style='margin-top:10px;font-size:10px;color:rgba(116, 116, 116, 1);letter-spacing:0.1em;'>" + datestring + " • " + datepublished.toLocaleTimeString() + "</div></div></div></a>";

                    var elem = document.createElement("div");
                    elem.innerHTML = html;
                    document.getElementById("SearchDropDown-articleContainer").appendChild(elem);
                }
                catch (e) { }
            }
        },

        renderSearchContainer: function (results) {


            if (document.getElementsByClassName('bars-loading').length > 0) {
                document.getElementsByClassName('bars-loading')[0].style['display'] = 'none';
            }

            var fullsuggest = '';
            try {
                fullsuggest = queryly.search.getFullSuggestion().trim();
                if (fullsuggest == '') {
                    fullsuggest = document.getElementById('query').value.trim();
                }
            }
            catch (e) { }

            for (var i = 0; i < results.results.length; i++) {

                queryly.resultdata = results.results[i];                
                queryly.resultdata['cn:liveURL'] = queryly.resultdata['cn:liveURL'] + "?&qsearchterm=" + fullsuggest;

                queryly.resultdata.label = '';
                if (queryly.resultdata["cn:promoImage"] != '') {
                    queryly.resultdata["cn:promoImage"] = queryly.resultdata["cn:promoImage"] + '&w=300&h=150';
                }

                if (queryly.resultdata.brand == 'makeit') {
                    //queryly.resultdata.partnerSectionLabel = '<img src="//www.queryly.com/images/make-it-logo-dark.png"/>';
                    queryly.resultdata.partnerSectionLabel = '<a style="color:#005594;" href="https://www.cnbc.com/make-it/?qsearchterm=' + fullsuggest + '">Make It</a>';
                }
                else if (queryly.resultdata.brand == 'acorns') {
                    //queryly.resultdata.partnerSectionLabel = '<img src="//www.queryly.com/images/grow-logo-search.png"/>';
                    queryly.resultdata.partnerSectionLabel = '<a style="color:#005594;" href="https://grow.acorns.com/?qsearchterm=' + fullsuggest + '">Grow</a>';
                }
                else if (queryly.resultdata.brand == 'select') {
                    //queryly.resultdata.partnerSectionLabel = '<img src="//www.queryly.com/images/select-logo-search.png"/>';
                    queryly.resultdata.partnerSectionLabel = '<a style="color:#005594;" href="https://www.cnbc.com/select/?qsearchterm=' + fullsuggest + '">Select</a>';
                }
                else if (queryly.resultdata.brand == 'buffett') {
                    //queryly.resultdata.partnerSectionLabel = '<img src="//www.queryly.com/images/buffet_archive_logo.png"/>';
                    queryly.resultdata.partnerSectionLabel = '<a style="color:#005594;" href="https://buffett.cnbc.com/?qsearchterm=' + fullsuggest + '">Warren Buffett Archive</a>';
                    try {
                        if (typeof queryly.resultdata["cn:videoTranscript"] != 'undefined' && typeof queryly.resultdata["cn:videoTranscript"]["cn:chapter"] != 'undefined' && queryly.resultdata["cn:videoTranscript"]["cn:chapter"].length > 0) {
                            if (typeof queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0]["cn:transcript"] != 'undefined') {
                                queryly.resultdata.videofooter = "chapter " + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].chapter + " : " + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].title;
                                queryly.resultdata['cn:title'] = queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0]["cn:transcript"][0].title;
                                queryly.resultdata.description = '';
                                if (typeof queryly.resultdata["cn:videoTranscript"]["videoimage"] != "undefined") {
                                    queryly.resultdata["cn:promoImage"] = queryly.resultdata["cn:videoTranscript"]["videoimage"];
                                }
                                if (typeof queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0]["cn:transcript"][0].in != 'undefined') {
                                    queryly.resultdata.videopoints = "start=" + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0]["cn:transcript"][0].in;
                                }
                                queryly.resultdata.label = 'Excerpt';
                                if (typeof queryly.resultdata.section != 'undefined' && queryly.resultdata.section != '') {
                                    queryly.resultdata.label = 'Excerpt  |  ' + queryly.resultdata.section;
                                }
                                queryly.resultdata['cn:liveURL'] = queryly.resultdata["cn:videoTranscript"]["videourl"] + "?&" + queryly.resultdata.videopoints;
                                videoin = queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0]["cn:transcript"][0].in;
                            }
                            else {
                                queryly.resultdata.videofooter = queryly.resultdata["cn:videoTranscript"]["videotitle"];
                                if (typeof queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].chapter == 'undefined') {
                                    try {
                                        queryly.resultdata['cn:title'] = queryly.resultdata["cn:videoTranscript"]["videotitle"];

                                        queryly.resultdata.label = 'Full Length';
                                        queryly.resultdata['cn:liveURL'] = queryly.resultdata["cn:videoTranscript"]["videourl"];
                                        if (typeof queryly.resultdata["cn:videoTranscript"]["videoimage"] != "undefined") {
                                            queryly.resultdata["cn:promoImage"] = queryly.resultdata["cn:videoTranscript"]["videoimage"];
                                        }
                                        if (typeof queryly.resultdata.section != 'undefined' && queryly.resultdata.section != '') {
                                            queryly.resultdata.label = 'Full Length  |  ' + queryly.resultdata.section;
                                        }
                                        videoin = -1;
                                        delete queryly.resultdata.videofooter;
                                    }
                                    catch (e) { }
                                }
                                else {
                                    queryly.resultdata['cn:title'] = "Chapter " + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].chapter + ". " + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].title;
                                    if (typeof queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].in != 'undefined') {
                                        queryly.resultdata.videopoints = "start=" + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].in;
                                        videoin = queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].in;
                                        if (typeof queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].out != 'undefined') {
                                            queryly.resultdata.videopoints = queryly.resultdata.videopoints + "&end=" + queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].out;
                                            //queryly.resultdata.duration = queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].out - queryly.resultdata["cn:videoTranscript"]["cn:chapter"][0].in;
                                        }
                                    }
                                    queryly.resultdata.label = 'Chapter';
                                    queryly.resultdata['cn:liveURL'] = queryly.resultdata["cn:videoTranscript"]["videourl"] + "?&" + queryly.resultdata.videopoints;
                                    if (typeof queryly.resultdata["cn:videoTranscript"]["videoimage"] != "undefined") {
                                        queryly.resultdata["cn:promoImage"] = queryly.resultdata["cn:videoTranscript"]["videoimage"];
                                    }
                                    if (typeof queryly.resultdata.section != 'undefined' && queryly.resultdata.section != '') {
                                        queryly.resultdata.label = 'Chapter  |  ' + queryly.resultdata.section;
                                    }
                                }
                            }

                            if (typeof queryly.resultdata.videopoints != 'undefined') {
                                queryly.resultdata['cn:liveURL'] = queryly.resultdata["cn:videoTranscript"]["videourl"] + "?&" + queryly.resultdata.videopoints;
                            }
                        }
                    }
                    catch (e) { }
                }
                
                queryly.resultdata['cn:title'] = queryly.resultdata['cn:title'].replace(/(([^\s]+\s\s*){15})(.*)/, "$1...");
                queryly.resultdata['cn:title'] = queryly.util.highlight(queryly.resultdata['cn:title'], results.metadata.stems);

                if (queryly.resultdata.brand == 'makeit' || queryly.resultdata.brand == 'buffett' || queryly.resultdata.brand == 'acorns' || queryly.resultdata.brand == 'select' ) {
                    queryly.resultdata['cn:title'] = queryly.resultdata['cn:title'] + "<img style='vertical-align: bottom;display:inline-block;width: 24px;height: 24px;margin-left: 5px;' src='//www.queryly.com/images/arrowout.png' />"
                }

                queryly.resultdata.description = queryly.resultdata.description.replace(/(([^\s]+\s\s*){25})(.*)/, "$1...")
                queryly.resultdata.description = queryly.util.highlight(queryly.resultdata.description, results.metadata.stems);

                if (typeof queryly.resultdata.duration != 'undefined') {
                    var minutes = Math.floor(queryly.resultdata.duration / 60);
                    var secs = queryly.resultdata.duration % 60;
                    if (minutes != 0 || secs != 0) {
                        if (secs < 10) {
                            secs = "0" + secs;
                        }

                        queryly.resultdata.videoduration = minutes + ":" + secs;
                    }
                }

                try {
                    if (typeof queryly.resultdata.author != 'undefined' && queryly.resultdata.author != '' && typeof results.resources != 'undefined') {
                        for (var j = 0; j < results.resources.length; j++) {
                            if (results.resources[j].group == 'creator') {
                                for (var k = 0; k < results.resources[j].results.length; k++) {
                                    if (queryly.resultdata.author.toLowerCase() == results.resources[j].results[k].name.toLowerCase()) {
                                        queryly.resultdata.authorurl = results.resources[j].results[k].url + "?&qsearchterm=" + fullsuggest;
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
                catch (e) { }

                try {
                    if (typeof queryly.resultdata.section != 'undefined' && queryly.resultdata.section != '' && typeof results.resources != 'undefined') {
                        for (var j = 0; j < results.resources.length; j++) {
                            if (results.resources[j].group == 'section' || results.resources[j].group == 'franchise') {
                                for (var k = 0; k < results.resources[j].results.length; k++) {
                                    if (queryly.resultdata.section.toLowerCase() == results.resources[j].results[k].name.toLowerCase()) {
                                        queryly.resultdata.sectionurl = results.resources[j].results[k].url + "?&qsearchterm=" + fullsuggest;
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
                catch (e) { }

                try {
                    var html = queryly.util.tmpl('queryly_template_cnbc', queryly.resultdata)
                    var elem = document.createElement("div");
                    elem.innerHTML = html;
                    document.getElementById('searchcontainer').appendChild(elem);

                    if (!queryly.instantSearch && i == 3 && document.getElementById('dart_wrapper_boxsearchinline_') == null) {
                        elem = document.createElement("div");
                        elem.innerHTML = "<div id='dart_wrapper_boxsearchinline_' class='SearchOverlay-adContainer'/>";
                        document.getElementById('searchcontainer').appendChild(elem);
                    }
                }
                catch (e) { }
            }
        },

        renderPopularQuotes: function (quotes) {
            try {
                var tname = [];
                if (quotes.data.mostPopularQuotes.assets.length > 0) {
                    for (var i = 0; i < quotes.data.mostPopularQuotes.assets.length; i++) {
                        if (quotes.data.mostPopularQuotes.assets[i].name != null) {
                            tname.push(quotes.data.mostPopularQuotes.assets[i].symbol);
                        }
                    }
                }

                var quoteapi = 'https://quote.cnbc.com/quote-html-webservice/quote.htm?&symbols=' + encodeURIComponent(tname.join('|')) + '&requestMethod=quick&noform=1&exthrs=1&callback=renderTickerQuotes&output=jsonp';
                queryly.util.loadScript(quoteapi, function () {
                });
            }
            catch (e) { }
        },

        renderAdvancedResults: function (results) {

            queryly.search.current_query = results.metadata.q;
            queryly.search.current_suggestion = '';
            queryly.search.total = results.metadata.totalresults;
            queryly.search.totalpage = results.metadata.totalpage;
            queryly.search.pagerequested = results.metadata.pagerequested;

            if (typeof results.toptickers != 'undefined' && queryly.toptickers.length == 0) {
                queryly.toptickers = results.toptickers;
            }


            if (typeof results.metadata.suggestions != 'undefined' && results.metadata.suggestions.length > 0) {
                queryly.search.current_suggestion = results.metadata.suggestions[0];
            }
            if (queryly.search.getFullSuggestion() != '') {
                document.getElementById('query_suggest').value = queryly.search.getFullSuggestion();
            }
            else {
                document.getElementById('query_suggest').value = document.getElementById('query').value
            }
           

            if (queryly.desktopsearch) {
                document.getElementById('SearchDropDown-tickerContainerHeader').innerHTML = "Suggested Symbols";
                document.getElementById('SearchDropDown-articleContainerHeader').innerHTML = "Suggested Stories";
                if (typeof results.results == 'undefined' || results.results.length == 0) {
                    document.getElementById('SearchDropDown-articleContainer').innerHTML = "<div style='padding-top: 25px;padding-left: 40px;font-size: 16px;margin-bottom: 30px;'>No results found. Please search a different keyword</div>";
                    document.getElementById('SearchDropDown-moreResults').innerHTML = "<a id='search_moreresults_container' style='color:#005594' href='/search/?query=" + encodeURI(document.getElementById('query_suggest').value) + "&qsearchterm=" + encodeURI(document.getElementById('query_suggest').value) + "'><div class='SearchGroup-articleItem'><div class='icon-arrow-right-long' style='float: right;padding: 4px;'></div> VIEW ALL SEARCH RESULTS FOR <b>" + document.getElementById('query_suggest').value + "</b></div></a>";
                    document.getElementById('SearchDropDown-moreResults').style.display = "block";
                    return;
                }

                if (queryly.search.pagerequested == 1) {
                    
                    document.getElementById('SearchDropDown-articleContainer').innerHTML = '';
                    document.getElementById('SearchDropDown-moreResults').innerHTML = "<a id='search_moreresults_container' style='color:#005594' href='/search/?query=" + encodeURI(document.getElementById('query_suggest').value) + "&qsearchterm=" + encodeURI(document.getElementById('query_suggest').value) + "'><div class='SearchGroup-articleItem'><div class='icon-arrow-right-long' style='float: right;padding: 4px;'></div> VIEW ALL SEARCH RESULTS FOR <b>" + document.getElementById('query_suggest').value + "</b></div></a>";
                    document.getElementById('SearchDropDown-moreResults').style.display = "block";
                }

                //loop through the search results.
                queryly.search.renderSearchContainerForDesktop(results);


            }
            else {
                try {

                    if (typeof results.results == 'undefined' || results.results.length == 0) {


                        document.getElementById('searchcontainer').innerHTML = '<center><div id="presearchheader" style="border-top: 1px solid #ccc;margin-bottom: 20px;width: 86%;margin-top:40px;"><div style="display: inline-block;padding-left: 10px;padding-right: 10px;background: white;position: relative;top: -28px;font-size:30px;font-weight:bold;font-weight: bold;color: #444;color:#03557f;">Search Results</div></div></center><div style="margin: 50px;text-align: center;font-size: 26px;color: #444;">No results found. Please search a different keyword.</div>';
                        if (document.getElementsByClassName('SearchResults-searchResultsWrapper').length > 0) {
                            document.getElementsByClassName('SearchResults-searchResultsWrapper')[0].setAttribute("style", "display:none;");
                        }
                        if (document.getElementsByClassName('bars-loading').length > 0) {
                            document.getElementsByClassName('bars-loading')[0].style['display'] = 'none';
                        }
                        document.getElementById('searchoutercontainer').style['display'] = 'block';

                        return;
                    }

                    if (document.getElementsByClassName('SearchResults-searchResultsWrapper').length > 0) {
                        document.getElementsByClassName('SearchResults-searchResultsWrapper')[0].setAttribute("style", "display:block;");
                    }

                    if (document.getElementById('sortrelevancydate') != null) {
                        document.getElementById('sortrelevancydate').style['font-weight'] = '700';
                        document.getElementById('sortrelevancydate').style['border-bottom'] = '2px #005594 solid';
                        document.getElementById('sortrelevancydate').style['color'] = '#005594';
                        document.getElementById('sortdate').style['font-weight'] = 'normal';
                        document.getElementById('sortdate').style['color'] = 'black';
                        document.getElementById('sortdate').style['border-bottom'] = 'none';
                        if (queryly.search.sortby != '') {
                            if (queryly.search.sortby == 'date') {
                                document.getElementById('sortrelevancydate').style['font-weight'] = 'normal';
                                document.getElementById('sortrelevancydate').style['color'] = 'black';
                                document.getElementById('sortrelevancydate').style['border-bottom'] = 'none';
                                document.getElementById('sortdate').style['font-weight'] = '700';
                                document.getElementById('sortdate').style['color'] = '#005594';
                                document.getElementById('sortdate').style['border-bottom'] = '2px #005594 solid';
                            }
                        }
                    }

                    if (queryly.search.pagerequested == 1) {
                        document.getElementById('searchcontainer').innerHTML = "";
                        queryly.search.renderFormat(results);
                        window.scrollTo(0, 0);
                    }

                    if (queryly.search.pagerequested == 1) {
                        try {
                            var popularhtml = queryly.search.renderPopular(results);
                            document.getElementById('popularcontainer').innerHTML = popularhtml;

                            if (document.getElementById('searchresultsamount') != null) {
                                var fullsuggest = queryly.search.getFullSuggestion().trim();
                                if (fullsuggest == '') {
                                    fullsuggest = document.getElementById('query').value.trim();
                                }

                                if (results.metadata.corrections.length > 0) {
                                    document.getElementById('searchresultsamount').innerHTML = "<style> @media screen and (min-width: 0px) and (max-width: 500px) { .hide-on-mobile {} }</style>" + "0 SEARCH RESULT " + "<div style='display:inline-block;' class='hide-on-mobile'>FOR \"<span>" + fullsuggest + "</span>\"</div><br>" + results.metadata.totalresults + " SEARCH RESULTS " + "<div style='display:inline-block;' class='hide-on-mobile'>FOR \"<span>" + results.metadata.corrections[0] + "</span>\"</div>";
                                }
                                else {
                                    document.getElementById('searchresultsamount').innerHTML = "<style> @media screen and (min-width: 0px) and (max-width: 500px) { .hide-on-mobile { display: none!important; } }</style>" + results.metadata.totalresults + " SEARCH RESULTS " + "<div style='display:inline-block;' class='hide-on-mobile'>FOR \"<span>" + fullsuggest + "</span>\"</div>";
                                }
                            }
                        }
                        catch (e) { }
                    }


                    //loop through the search results.
                    queryly.search.renderSearchContainer(results);

                    if (document.getElementsByClassName('SearchResults-searchResultsAmount') != null && document.getElementsByClassName('SearchResults-searchResultsAmount').length > 0) {
                        for (var i = 0; i < document.getElementsByClassName('SearchResults-searchResultsAmount').length; i++) {
                            if (results.metadata.corrections.length > 0) {
                                document.getElementsByClassName('SearchResults-searchResultsAmount')[i].innerHTML = "<style> @media screen and (min-width: 0px) and (max-width: 500px) { .hide-on-mobile {} }</style>" + "0 SEARCH RESULTS " + "<div style='display:inline-block;' class='hide-on-mobile'>FOR \"<span>" + queryly.urlQuery.trim() + "</span>\"</div><br>" + results.metadata.totalresults + " SEARCH RESULTS " + "<div style='display:inline-block;' class='hide-on-mobile'>FOR \"<span>" + results.metadata.corrections[0] + "</span>\"</div>";
                            }
                            else {
                                document.getElementsByClassName('SearchResults-searchResultsAmount')[i].innerHTML = "<style> @media screen and (min-width: 0px) and (max-width: 500px) { .hide-on-mobile { display: none!important; } }</style>" + results.metadata.totalresults + " SEARCH RESULTS " + "<div style='display:inline-block;' class='hide-on-mobile'>FOR \"<span>" + queryly.urlQuery.trim() + "</span>\"</div>";
                            }
                        }
                    }

                }
                catch (e) { }
                queryly.search.waitForReturn = false;

                document.getElementById('searchoutercontainer').style['display'] = 'block';
                queryly.util.hookEvent(document.getElementsByClassName('resultlink'), queryly.search.current_query);
                queryly.search.waitForReturn = false;

                queryly.util.trackSearch(queryly.search.current_query, queryly.search.current_suggestion);
            }


        }
    };

    queryly.util = {
        cache: {},
        //used by JavaScript Micro-Templating 
        tmpl: function (str, data) {
            var fn = !/\W/.test(str) ?
          this.cache[str] = this.cache[str] ||
            this.tmpl(document.getElementById(str).innerHTML) :

            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
          new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +

            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +
            str.replace(/[\r\t\n]/g, " ")
               .replace(/'(?=[^%]*%>)/g, "\t")
               .split("'").join("\\'")
               .split("\t").join("'")
               .replace(/<%=(.+?)%>/g, "',$1,'")
               .split("<%").join("');")
               .split("%>").join("p.push('")
               + "');}return p.join('');");

            // Provide some basic currying to the user
            return data ? fn(data) : fn;
        },

        callAjax: function (url, callback, sync) {
            var xmlhttp;
            // compatible with IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    callback(JSON.parse(xmlhttp.responseText));
                }
            }
            if (sync == true) {
                xmlhttp.open("GET", url, false);
            }
            else {
                xmlhttp.open("GET", url, true);
            }

            
            xmlhttp.send();
        },

        loadScript: function (src, callback) {
            var script = document.createElement('script');
            var loaded = false;
            script.setAttribute('src', src);
            if (callback) {
                script.onreadystatechange = script.onload = function () {
                    if (!loaded) {
                        callback();
                    }
                    loaded = true;
                };
            }
            document.head.appendChild(script);
        },
        //center the image vertically for tall images.
        imageShift: function (img) {
            if (img.naturalHeight > img.naturalWidth * 1.2) {
                var shift = -(img.naturalHeight - img.naturalWidth) / 2;
                (img).style.marginTop = shift + 'px';
            }
        },

        imageLoad: function (img, w, h) {
            if (img.naturalWidth < 20) {
                queryly.util.removeNode(img.parentNode);
            }
        },

        removeNode: function (node) {
            if (node != null && node.parentNode != null) {
                try {
                    node.parentNode.removeChild(node);
                }
                catch (e) { }
            }
        },

        imageError: function (img) {
            img.src = '//www.queryly.com/images/blank.png';
        },

        getUrlParameter: function (name) {
            return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]);
        },

        getCookie: function (name) {
            try {
                name = name + "=";
                var carray = document.cookie.split(';');

                for (var i = 0; i < carray.length; i++) {
                    var c = carray[i];
                    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
                }
            }
            catch (ex) {
                return null;
            }
            return null;
        },

        setCookie: function (name, value, days) {
            if (days == undefined) {
                days = 90;
            }
            if (value == 0) {
                document.cookie = name + '=' + value + '; path=/';
            }
            else {
                document.cookie = name + '=' + value + ';expires=' + new Date((new Date().getTime() + 1000 * 24 * 3600 * days)) + '; path=/';
            }
        },

        getRandomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        //generate an anonymous random id
        getVisitorID: function () {
            var id = queryly.util.getCookie("querylyvid");
            if (id == null) {
                id = queryly.util.getRandomInt(1, 2147483647);
                queryly.util.setCookie("querylyvid", id);
            }
            return id;
        },

        //display autocompleted keyword
        showSuggestion: function (guess) {
            if (queryly.currentQuery.length > 0) {
                var lastchar = queryly.currentQuery.charAt(queryly.currentQuery.length - 1);
                var lastword = queryly.util.getLastWord(queryly.currentQuery);
                var partialword = guess.substring(lastword.length);
                if (lastchar != ' ' && queryly.guess.substring(0, lastword.length) == lastword.toLowerCase()) {
                    queryly.suggestbox.value = (queryly.currentQuery + partialword);
                }
                else {
                    queryly.suggestbox.value = (queryly.currentQuery);
                }
            }

        },

        showAnimation: function (show) {
        },

        fadeIn: function (el, i) {
            i = i + 0.05;
            queryly.util.seto(el, i);
            if (i < 1) { setTimeout(function () { queryly.util.fadeIn(el, i); }, 10); }
        },

        seto: function (el, i) {
            el.style.opacity = i;
        },

        getLocalDate: function (dt) {
            var lt = dt;
            var offset = new Date().getTimezoneOffset();
            lt.setMinutes(lt.getMinutes() + offset);
            return lt;
        },

        getLocalDateTimeLabel: function (dt) {
            if (dt == '') {
                return dt;
            }
            var jan = new Date(2018, 0, 1);
            var jul = new Date(2018, 6, 1);
            var offset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
            if (offset == 300) {
                return dt + " ET";
            }
            else if (offset == 480) {
                return dt + " PST";
            }
            else {
                return dt;
            }
        },


        getLastWord: function (o) {
            return ("" + o).replace(/[\s]+$/, '').split(/[\s]/).pop();
        },

        highlight: function (text, tokens) {
            var ht = text;
            var existing = [];
            try {

                for (var i = tokens.length - 1 ; i >= 0 ; i--) {
                    if (tokens[i].length < 3) {
                        continue;
                    }
                    var found = false;
                    for (var j = 0; j < existing.length; j++) {
                        if (existing[j].indexOf(tokens[i]) >= 0) {
                            found = true;
                            break;
                        }
                    }

                    if (found) {
                        continue;
                    }
                    existing.push(tokens[i]);
                    var regex = new RegExp("\\b" + tokens[i] +"\\b", 'gi');
                    ht = ht.replace(regex, function (str) {
                        return "<span style='background-color: #e7ecf1'>" + str + "</span>"
                    })
                }
            }
            catch (e) { }
            return ht;
        },

        autoFillSuggestion: function () {
            var result = queryly.search.getFullSuggestion();
            if (result != '') {
                document.getElementById('query').value = (result);
            }
        },

        trackClick: function (url, q, suggest) {
            new Image().src = "//data.queryly.com/track.aspx?queryly_key=" + queryly.QuerylyKey + "&visitorid=" + queryly.util.getVisitorID() + "&query=" + q + "&suggest=" + suggest + "&total=1&target=" + encodeURIComponent(url);
        },

        trackSearch: function (q, suggest) {
            new Image().src = "//data.queryly.com/track.aspx?queryly_key=" + queryly.QuerylyKey + "&visitorid=" + queryly.util.getVisitorID() + "&query=" + q + "&suggest=" + suggest + "&total=1&target=";
        },

        hookEvent: function (links) {
            for (var i = 0; i < links.length; i++) {
                links[i].addEventListener("mousedown", function () {
                    try {
                        queryly.util.trackClick(this.href.replace(/&amp;/g, "&"), queryly.search.current_query, queryly.search.current_suggestion);
                    }
                    catch (e) { }
                });
            }
        },

        updateClassDisplay: function (classname) {
            var cs = document.querySelectorAll(classname);
            if (cs.length > 0) {
                for (var i = 0; i < cs.length; i++) {
                    if (cs[i].style.display == 'flex') {
                        cs[i].style.display = 'none';
                    }
                    else {
                        cs[i].style.display = 'flex';
                    }
                }

            }
            if (document.getElementById('seemore').innerText == "SEE MORE") {
                document.getElementById('seemore').innerText = "SEE LESS";
                document.getElementById('seemorearrow').classList.remove("arrowexpand");
                document.getElementById('seemorearrow').classList.add("arrowcollapse");
            }
            else {
                document.getElementById('seemore').innerText = "SEE MORE";
                document.getElementById('seemorearrow').classList.remove("arrowcollapse");
                document.getElementById('seemorearrow').classList.add("arrowexpand");
            }
        },

        containTickers: function (keywords) {
            if (keywords.indexOf(',') < 0) {
                return false;
            }
            var temps = keywords.split(',');
            var tickers = [];
            var totallength = 0;
            for (var i = 0; i < temps.length; i++) {
                if (temps[i].trim() != '') {
                    tickers.push(temps[i].trim());
                    totallength = totallength + temps[i].trim().length;
                }
            }

            if ((totallength * 1.0) / tickers.length <= 8) {
                return true;
            }
            return false;

        },

        backToTop: function () {
            window.scroll(0, 0);
            document.getElementById("query").focus();
            queryly.util.autoFillSuggestion();

        }

    };

})(window);

function renderTickers(tickers, tname) {
    if (typeof tname == "undefined" || tname.length == 0) {
        var tkey = [];
        var tvalue = [];
        var tname = [];
        for (var i = 0; i < tickers.length; i++) {
            if (typeof tickers[i].symbolName == 'undefined') {
                continue;
            }
            try {
                if (tkey.indexOf(tickers[i].issuerId) < 0) {
                    if (tickers[i].countryCode == 'US') {
                        tname.push(tickers[i].symbolName);
                    }

                }
                if (tkey.indexOf(tickers[i].issuerId) < 0) {                    
                    if (tickers[i].countryCode != 'US') {
                        tname.push(tickers[i].symbolName);
                    }

                }                
            }
            catch (e) { }
        }
    }

    var quoteapi = 'https://quote.cnbc.com/quote-html-webservice/quote.htm?&symbols=' + encodeURIComponent(tname.join('|')) + '&requestMethod=quick&noform=1&exthrs=1&callback=renderTickerQuotes&output=jsonp';
    queryly.util.loadScript(quoteapi, function () {
    });
}

function renderTickerQuotes(quotes) {
    try {
        if (typeof quotes.QuickQuoteResult.QuickQuote == 'undefined') {
            if (queryly.desktopsearch) {
                document.getElementById('tickercontainer').innerHTML = "<div style='padding-top: 250x;padding-left: 20px;font-size: 16px;'>There are no suggested symbols.</div>";
            }
            else {
                document.getElementById('tickercontainer').innerHTML = "<div style='margin-bottom:20px;'>There are no suggested symbols.</div>";
            }
           
            return;
        }
        var array = [];
        if (typeof quotes.QuickQuoteResult.QuickQuote.length == 'undefined') {
            array.push(quotes.QuickQuoteResult.QuickQuote);
        }
        else {
            array = quotes.QuickQuoteResult.QuickQuote;
        }
        var elem = document.createElement("div");
        var tickerhtml = '';
        var threshold = 5;
        if (window.innerWidth < 400) {
            threshold = 5;
        }

        if (queryly.desktopsearch) {
            threshold = 10;
        }

        var fullsuggest = '';
        try {
            fullsuggest = queryly.search.getFullSuggestion().trim();
            if (fullsuggest == '') {
                fullsuggest = document.getElementById('query').value.trim();
            }
        }
        catch (e) { }

        for (var i = 0; i < Math.min(10, array.length) ; i++) {
            try {
                queryly.tickerdata = array[i];
                //queryly.tickerdata.url = "//qa-pa05pub.cnbc.com/quotes/?symbol=" + queryly.tickerdata.symbol + "&qsearchterm=" + queryly.search.current_query;
                queryly.tickerdata.url = "//cnbc.com/quotes/?symbol=" + queryly.tickerdata.symbol + "&qsearchterm=" + fullsuggest;
                queryly.tickerdata.symbol = decodeURIComponent(queryly.tickerdata.symbol);
                //queryly.tickerdata.change = queryly.tickerdata.change;

                if (queryly.tickerdata.assetType == 'BOND') {
                    queryly.tickerdata.changepercentage = queryly.tickerdata.change;
                    //queryly.tickerdata.change = queryly.tickerdata.last;

                    if ((queryly.tickerdata.curmktstatus == 'POST_MKT' || queryly.tickerdata.curmktstatus == 'PRE_MKT') && typeof queryly.tickerdata.ExtendedMktQuote != 'undefined') {
                        queryly.tickerdata.changepercentage = queryly.tickerdata.ExtendedMktQuote.change;
                        queryly.tickerdata.last = queryly.tickerdata.ExtendedMktQuote.last;
                        queryly.tickerdata.change = queryly.tickerdata.ExtendedMktQuote.change_pct;
                    }
                }
                else {
                    //queryly.tickerdata.change = parseFloat(queryly.tickerdata.last).toFixed(2);
                    queryly.tickerdata.changepercentage = parseFloat(queryly.tickerdata.change_pct).toFixed(2);
                   
                    if ((queryly.tickerdata.curmktstatus == 'POST_MKT' || queryly.tickerdata.curmktstatus == 'PRE_MKT') && typeof queryly.tickerdata.ExtendedMktQuote != 'undefined') {
                        queryly.tickerdata.last = queryly.tickerdata.ExtendedMktQuote.last;
                        queryly.tickerdata.changepercentage = parseFloat(queryly.tickerdata.ExtendedMktQuote.change_pct).toFixed(2);
                        queryly.tickerdata.change = queryly.tickerdata.ExtendedMktQuote.change;
                    }
                    queryly.tickerdata.change = parseFloat(queryly.tickerdata.change).toFixed(2);
                }

                queryly.tickerdata.color = '#ccc';
                if (queryly.tickerdata.assetType == 'BOND') {
                    if (queryly.tickerdata.changepercentage > 0) {
                        queryly.tickerdata.color = 'rgb(0, 132, 86)';
                    }
                    else if (queryly.tickerdata.changepercentage < 0) {
                        queryly.tickerdata.color = 'rgb(206, 43, 43)';
                    }
                }
                else {
                    if (queryly.tickerdata.changepercentage > 0) {
                        queryly.tickerdata.color = 'rgb(0, 132, 86)';
                    }
                    else if (queryly.tickerdata.changepercentage < 0) {
                        queryly.tickerdata.color = 'rgb(206, 43, 43)';
                    }
                }

                if (queryly.tickerdata.assetType == 'BOND') {
                    queryly.tickerdata.change = queryly.tickerdata.change + "%";
                }
                else {
                    queryly.tickerdata.changepercentage = queryly.tickerdata.changepercentage + "%";
                }


                if (i < threshold) {
                    tickerhtml = tickerhtml + queryly.util.tmpl('queryly_template_ticker', queryly.tickerdata);
                }
                else {
                    tickerhtml = tickerhtml + queryly.util.tmpl('queryly_template_ticker', queryly.tickerdata).replace("\"SearchGroup-item\"", "\"SearchGroup-item extratickers\"");
                }

            }
            catch (e) {}

        }
        if (array.length > threshold) {
            tickerhtml = tickerhtml + "<div style='margin-left:10px;margin-top:10px;margin-bottom:10px;'><a id='search_tickers_seemore' style='color:#005594;font-weight:bold;font-size:14px;' onclick='queryly.util.updateClassDisplay(\".extratickers\");return false;'><span style='margin-right:6px;' id='seemore'>SEE MORE</span><span id='seemorearrow' style='font-weight: 400;font-size: 10px; padding: 4px;display: inline-block; vertical-align: sub;' class='icon icon-buffett-backtotop arrowexpand'></span></div>"
        }

        if (queryly.desktopsearch) {
           document.getElementById('tickercontainer').innerHTML = tickerhtml;
            document.getElementById('tickercontainer').style['display'] = 'block';
        }
        else {

            if (document.getElementById('tickercontainer') == null) {
                var elem = document.createElement("div");
                elem.innerHTML = '<div id ="tickercontainer" style="padding: 10px;font-size: 24px;border-bottom: 1px solid #ccc; margin-bottom: 10px;width:30%;position:fixed;" />';
                document.getElementById('searchcontainer').appendChild(elem);
            }
            document.getElementById('tickercontainer').innerHTML = "<style> @media screen and (min-width: 0px) and (max-width: 500px) { .SearchGroup-itemSubTitle { } } #tickercontainer a:nth-child(2n) .SearchGroup-item {background:#f2f2f2;} #tickercontainer {} .extratickers { display:none;transition:visibility 0s, opacity 1.5s linear;} .arrowexpand {transform: rotate(180deg);} .arrowcollapse {transform: rotate(0deg);} </style>" + tickerhtml;
            document.getElementById('tickercontainer').style['display'] = 'block';
            if (document.getElementById('tickeroutercontainer') != null) {
                document.getElementById('tickeroutercontainer').style['display'] = 'block';
            }
        }
    }
    catch (e) { }
}