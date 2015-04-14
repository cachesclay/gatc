/*
 * teachforamerica v1.54.0
 * Thursday, February 12th, 2015, 3:48:30 PM
 * Analytics Ninja implementation code
 */
/*
 * Google Analytics customizations for "Teach For America."
 * Depends on jQuery.
 *
 * Please don't touch this file without consulting Analytics Ninja (ninja@analtyics-ninja.com).
 *
 * Based on GAS https://github.com/CardinalPath/gas
 *
 * @author Eduardo Cereto <ecereto@cardinalpath.com>
 * @author Eliyahu Gusovsky (modifications) <eliyahu@analytics-ninja.com>
 *
 * v19 - E.Cereto Review on Nov 20 2012
 * v20 - A. Wei changed gas.js to use dc.js on Dec 12 2012
 * v21 - Analytics Ninja additions, February 2013
 * v22 - Included scroll tracking for blog posts, April 2013
 * v23 - your talent is needed page, May 2013
 * v24 - Marquee slider index, scroll callback condition to blog pathname
 * v25 - Additional tracker for blog & commented out custom var 4
 * v26 - disqus, author custom var 1, blog scroll tracking, cross domain for force.com
 * v27 - signup form tracking
 * v28 - analytics.js translation layer, application form tracking
 * v29 - Universal Analytics: updated non-interactive hits, set referrer from utm_referrer parameter.
 *       Track clicks to apply now button on why-teach page
 * v30 - Explicitly write campaign parameters and referrer as read from cookies
 * v31 - Track Katies story landing page
 * v32 - Track navigation links. universal dimensions fix.
 * v33 - Journey Campaign tracking
 * v34 - mailto tracking, employment type on we can help page
 * v35 - homepage youtube tracking, jpg download tracking, scroll tracking progress markers
 * v36 - Jourey campaign additional page
 * v37 - Partner campaign links
 * v38 - Fixed broken utm parameters
 * v39 - On the Record
 * v40 - Thank a teacher
 * v41 - Symantec Awards
 * v42 - Global opt-in
 * v43 - Hit callback test
 * v44 - Choices landing page
 * v45 - Annual letter scroll tracking
 * v46 - Track popup by Yossy Roitburd
 */

/*
 * Universal Analytics translation layer
 * This snippet hooks into GAS and translates _gas.push calls into
 * analytics.js ga() commands
 *
 * Run in the following way:
 * _gas.push(['_setAccount', 'UA-XXXXXXX-YY',{'type':'analytics.js'}]);
 */

/*global ga:true,_gas:true*/
(function () {

    window._gas = window._gas || [];

    /*jshint -W030*/
    (function (i, s, o, g, r, a, m) {
        i.GoogleAnalyticsObject = r;
        i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments);
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
    /*jshint +W030*/

    var ajs_accounts = {};
    var domains = [];

    function setAccountHook(account_id, additional_params) {
        if(arguments.length && typeof(arguments[arguments.length - 1]) == 'object' && arguments[arguments.length - 1].type == 'analytics.js') {
            delete additional_params.type;
            ajs_accounts[account_id] = new AnalyticsJSTracker(account_id, additional_params);
            //dont pass the setaccount through to GAS
            return false;
        } else {
            //its not a analytics.js setaccount, pass it through
            return true;
        }
    }

    function setDomainNameHook(domain) {
        domains.push(domain);
        return [domain];
    }

    function dispatch(command) {

        var as = Array.prototype.slice.call(arguments, 1);
        var realargs = as[0];
        var lastarg = realargs[realargs.length - 1];

        if(typeof(lastarg) == 'object' && lastarg.nouniversal) {

            if(lastarg.nouniversal) {
                return;
            }
        }

        for (var i in ajs_accounts) {
            var tracker = ajs_accounts[i];
            if(tracker[command]) {
                tracker[command].apply(tracker, realargs);
            }
        }
    }

    function AnalyticsJSTracker(account_id, additional_params) {

        this.account_id = account_id;

        if(additional_params.name) {
            this.name = additional_params.name;
        }

        if(!additional_params.cookieDomain) {
            for (var i = 0; i < domains.length; i++) {
                if(document.location.hostname.match(domains[i])) {
                    additional_params.cookieDomain = domains[i];
                }
            }
        }

        ga('create', this.account_id, additional_params);
    }

    AnalyticsJSTracker.prototype = {
        prefixCommand:    function (command) {
            if(this.name) {
                return this.name + '.' + command
            } else {
                return command;
            }
        },
        execute:          function () {
            arguments[0] = this.prefixCommand(arguments[0]);
            ga.apply(ga, arguments);
        },
        account_id:       null,
        '_trackPageview': function (vp) {
            if(vp) {
                this.execute('send', 'pageview', vp);
            } else {
                this.execute('send', 'pageview');
            }
        },
        '_trackEvent':    function (category, action, label, value, non_interaction) {
            this.execute('send', 'event', category, action, label, value, {nonInteraction: non_interaction ? true : false});
        },
        '_trackTiming':   function (category, variable, value, label) {
            this.execute('send', 'timing', category, variable, value, label);
        },
        '_trackSocial':   function (network, socialAction, opt_target) {
            this.execute('send', 'social', {
                'socialNetwork': network,
                'socialAction':  socialAction,
                'socialTarget':  opt_target
            });
        },
        '_setCustomVar':  function (slot, name, value) {
            this.execute('set', 'dimension' + slot, value);
        },
        '_set':           function (v, value) {

            if(v == 'campaignParams') {

                var params = value;

                var utm_campaign = params.match(/utm_campaign=([^;&$]*)/);
                if(utm_campaign) {
                    this.execute('set', 'campaignName', utm_campaign[1]);
                }

                var utm_source = params.match(/utm_source=([^;&$]*)/);
                if(utm_source) {
                    this.execute('set', 'campaignSource', utm_source[1]);
                }

                var utm_medium = params.match(/utm_medium=([^;&$]*)/);
                if(utm_medium) {
                    this.execute('set', 'campaignMedium', utm_medium[1]);
                }

                var utm_term = params.match(/utm_term=([^;&$]*)/);
                if(utm_term) {
                    this.execute('set', 'campaignKeyword', utm_term[1]);
                }

                var utm_content = params.match(/utm_content=([^;&$]*)/);
                if(utm_content) {
                    this.execute('set', 'campaignContent', utm_content[1]);
                }

                var gclid = params.match(/gclid=([^;&$]*)/);
                if(gclid) {
                    this.execute('set', 'campaignId', gclid[1]);
                }

                var utm_referrer = params.match(/utm_referrer=([^;&$]*)/);
                if(utm_referrer) {
                    this.execute('set', 'referrer', utm_referrer[1]);
                }


            } else {
                this.execute('set', v, value);
            }
        }

    };

    _gas.push(['_addHook', '_setAccount', setAccountHook]);
    _gas.push(['_addHook', '_setDomainName', setDomainNameHook]);
    _gas.push(['_addHook', '_trackPageview', function () {
        dispatch('_trackPageview', arguments);
    }]);
    _gas.push(['_addHook', '_trackEvent', function () {
        dispatch('_trackEvent', arguments);
    }]);
    _gas.push(['_addHook', '_trackTiming', function () {
        dispatch('_trackTiming', arguments);
    }]);
    _gas.push(['_addHook', '_trackSocial', function () {
        dispatch('_trackSocial', arguments);
    }]);
    _gas.push(['_addHook', '_setCustomVar', function () {
        dispatch('_setCustomVar', arguments);
    }]);
    _gas.push(['_addHook', '_set', function () {
        dispatch('_set', arguments);
    }]);


})();
/* End analytics.js translation layer */

/*global _gas,YT,ga,DISQUS,optimizely */
/*jshint unused:false,latedef:false,strict:false  */
/* Begin Main GAS Script */

(function () {

    window._gas = window._gas || [];
    var app_cat;

    //_gas.push(['_setDebug', true]);
    //_gas.push(['_setAccount', 'UA-XXXXXX-X']);

    if(document.location.hostname && document.location.hostname.indexOf('stageweb.tfanet.org') > -1) {
        _gas.push(['_setAccount', 'UA-2422638-13']);

    } else {
        _gas.push(['_setAccount', 'UA-2422638-1']);
    }

    if(window.location.pathname.indexOf('/blog') === 0) {
        _gas.push(['_setAccount', 'UA-2422638-21']);
    }

    _gas.push(['_setDomainName', 'teachforamerica.org']);
    _gas.push(['_setDomainName', 'entango.com']);
    _gas.push(['_setDomainName', 'force.com']);
    _gas.push(['_setAllowHash', false]);
    _gas.push(['_setAllowLinker', true]);

    //entango is not using P3P header so cross domain tracking doesn't work in IE.
    _gas.push(['_addIgnoredRef', 'teachforamerica.org']);

    //adds the universal analytics tracker via gas setaccount hook
    _gas.push(['_setAccount', 'UA-2422638-22', {
        'type':        'analytics.js',
        'allowLinker': true
    }]);


    _gas.push(function () {
        ga(function () {
            // Load the plugin.
            ga('require', 'linker');
            // Define which domains to autoLink.
            ga('linker:autoLink', [
                'devweb1.teachforamerica.org',
                'www.dreamrisedo.org',
                'www.teachforamerica.org'
            ]);

        });
    });

    //read in cookies to set campaign parameters
    setCampaignParams();


    /**
     * Returns a function usable as a hitcallback. Cancels the original event
     * and triggers the events once the hit has gone through
     * @param {DOMEvent} event The event which triggers the callback
     */
    function makeHitCallback(event) {
        return function hitCallback() {
            var $target = jQuery(event.target);
            if(!$target.data('callback_fired')) {
                $target.data('callback_fired', true);
                setTimeout(function () {
                    if(event.type == 'click' && event.target.nodeName == 'A') {
                        window.location = event.target.href;
                    } else {
                        $target.trigger(event.type);
                    }

                }, 100);
            }
        };
    }

    /**
     * If the callback hasn't been set up yet for this element, cancels the event and marks the element
     * as waiting for the callback to fire.
     * @param {DOMEvent} event The event which will trigger the callback
     * @returns {boolean} Whether we have just cancelled the event and marked the element
     */
    function needsHitCallback(event) {
        var $target = jQuery(event.target);
        if(!$target.data('callback_waiting')) {
            $target.data('callback_waiting', true);
            event.preventDefault();
            return true;
        } else {
            return false;
        }
    }

    _gas.push(['_initData']);

    //there are a few cases where we want to modify the pageName
    //variable spit server-side
    correctPageName();

    setDispositionVar();

    //trackpageview callback, there are several cases where
    //we want to modify the trackpageview call, see cases below:
    _gas.push(['_addHook', '_trackPageview', function (url) {

        // if we got a specific url for virtual pageview, use that
        if(typeof url != 'undefined') return [url];

        var newUrl;

        //use the server-defined pageName variable for trackpageview
        if(typeof window.pageName === 'string' && window.pageName !== '') {
            newUrl = window.pageName;

            // This block of code is meant to send search parameters to GA
            // to integrate with Site Search tracking.
        } else if(document.location.pathname.indexOf('/search/node/') > -1) {

            var search_param = document.location.pathname.replace('/search/node/', '');
            var results;

            if(jQuery('.search-result').length) {
                results = 'Search Results Found';
            } else {
                results = 'No Search Results';
            }

            _gas.push(['_trackPageview', '/search?q=' + search_param + '&category=' + results]);


        } else {
            newUrl = document.location.pathname;
            newUrl += document.location.search;
        }
        return [newUrl];
    }
    ]);

    /*
     *
     * ScrollTracker by Justin Cutroni, see http://cutroni.com/blog/2012/02/21/advanced-content-tracking-with-google-analytics-part-1/
     * Included Version by Eivind Savio, see http://www.savio.no/blogg/a/114/tracking-content-scrollers-scanners-og-readers-in-google-analytics
     * Adapted for use in teachforamerica.org by Analytics Ninja
     */
    jQuery(document).ready(function () {

        //set page parameter (utmp) to match custom pageName on all hits
        if(typeof window.pageName === 'string' && window.pageName !== '') {
            _gas.push(['_set', 'page', window.pageName]);
        }


        // The next gas calls are prefered to run after domReady
        try {
            _gas.push(trackFirstTouch);
            // _gas.push(setLoggedIn);
            _gas.push(CRM_FT_push);
            _gas.push(customEvents);
            _gas.push(customVars);
            _gas.push(socialInteractions);
            _gas.push(trackApplicationForm);

        } catch (e) {
        }


        _gas.push(['_trackPageview']);
        _gas.push(['_gasMultiDomain']);
        _gas.push(['_gasTrackVimeo', {
            'force': true
        }]);
        _gas.push(['_gasTrackYoutube', {
            'force': true
        }]);
        _gas.push(['_gasTrackForms']);
        _gas.push(['_gasTrackOutboundLinks']);
        _gas.push(['_gasTrackDownloads', {
            'extensions': ['jpg']
        }]);
        _gas.push(['_gasTrackMailto']);

        if(jQuery('body').hasClass('node-type-blog-post') && document.location.pathname.match(/^(\/m)?\/blog/)) {
            _gas.push(['_gasCustomScroll', {
                target: '#blog-post-body'
            }]);
        } else if(document.location.pathname.match(/\/annual-letter/)) {
            _gas.push(['_gasCustomScroll', {
                target:           '#region-content',
                progress_markers: [50]
            }]);
        }

    });


    _gas.push(['_addHook', '_gasCustomScroll',
               function (passed_opts) {

                   if(!this._scrollTracked) {
                       this._scrollTracked = true;
                   } else {
                       //Oops double tracking detected.
                       return;
                   }

                   var opts = jQuery.extend({}, {
                       name:        'scroll',
                       target:      '#container',
                       //this is a jquery selector to find the tracking target, or callback function to return one
                       allowed:     true,
                       //send the Allowed event
                       started:     true,
                       // send the started event
                       bottom:      true,
                       //send the bottom event
                       custom_var:  3,
                       //which slot for custom vars, or set to false to disable
                       reader_type: true,
                       //Whether to send events for reader type scanner/reader

                       progress_markers: []
                       //percentages at which to send progress events. e.g. [25,50,75,100]

                   }, passed_opts);

                   var readerTime = 30; // Seconds after scroll to bottom of content before visitor is classified as "Reader"
                   var readerLocation = 150; // # px before tracking a reader
                   var callBackTime = 100; // Default time delay before checking location
                   // Set some flags for tracking & execution
                   var timer = 0;
                   var contentLength = 0; // Content Length -> Length of content area
                   var scroller = false;
                   var endContent = false;
                   var didComplete = false;

                   var $content;

                   // Set some time variables to calculate reading time etc.
                   var pageTimeLoad = 0,
                       scrollTimeStart = 0,
                       timeToScroll = 0,
                       contentTime = 0,
                       endTime = 0;

                   var _trackScroll = function () {
                       var realtarget;

                       if(typeof opts.target == 'function') {
                           realtarget = opts.target(this);
                       } else {
                           realtarget = opts.target;
                       }

                       $content = jQuery(realtarget); //define content element to track
                       //if the content element isn't found, dont do any scroll tracking
                       if(!$content.length) {
                           return;
                       }

                       // Check if content has to be scrolled
                       if(jQuery(window).height() < $content.height()) {
                           pageTimeLoad = new Date().getTime();
                           contentLength = $content.height();

                           if(opts.allowed) {
                               _gas.push(['_trackEvent', 'Page Scroll', 'Page Scroll: Allowed',
                                          window.location.pathname, contentLength, true]);
                           }
                       }

                       // Track the scrolling and track location
                       jQuery(window).scroll(function () {
                           if(timer) {
                               clearTimeout(timer);
                           }
                           // Use a buffer so we don't call _trackLocation too often.
                           timer = setTimeout(_trackLocation, callBackTime);
                       });

                   };

                   // Check the location and track user
                   var _trackLocation = function () {

                       var bottom = jQuery(window).height() + jQuery(window).scrollTop();
                       var height = jQuery(document).height();

                       var offset = $content.offset();

                       // If user has scrolled beyond threshold send an event
                       if(bottom > readerLocation && !scroller) {
                           scroller = true;
                           scrollTimeStart = new Date().getTime();
                           if(pageTimeLoad > 0) {
                               timeToScroll = Math.round((scrollTimeStart - pageTimeLoad) / 1000);
                           } else {
                               timeToScroll = "";
                           }

                           // Article scroll started
                           if(opts.started) {
                               _gas.push(['_trackEvent', 'Page Scroll', 'Page Scroll: Started',
                                          window.location.pathname, timeToScroll, true]);
                               _gas.push(['_trackTiming', 'Page Scroll', 'Page Scroll: Time to Scroll',
                                          timeToScroll * 1000, window.location.pathname, 100]);
                           }

                       }

                       //Code for sending events at progress markers
                       var pixels_into_content = Math.max(bottom - offset.top, 0);
                       var percent_in = Math.ceil(pixels_into_content / $content.innerHeight() * 100);
                       for (var i = 0; i < opts.progress_markers.length; i++) {
                           if(percent_in > opts.progress_markers[i]) {
                               _gas.push(['_trackEvent', 'Page Scroll', 'Page Scroll: %' + opts.progress_markers[i],
                                          document.location.pathname]);
                               opts.progress_markers.splice(i, 1);
                           }
                       }

                       // If user has hit the bottom of the content send an event
                       if(bottom >= $content.scrollTop() + $content.innerHeight() && !endContent) {
                           timeToScroll = new Date().getTime();
                           contentTime = Math.round((timeToScroll - scrollTimeStart) / 1000);

                           if(opts.reader_type) {
                               if(contentTime < readerTime) {
                                   _gas.push(['_trackEvent', 'Page Scroll', 'Page Scroll: Content Scanner',
                                              window.location.pathname, contentTime, true]);
                                   _gas.push(['_trackTiming', 'Page Scroll', 'Content Scanner', contentTime * 1000,
                                              window.location.pathname, 100]);
                               } else {
                                   _gas.push(['_trackEvent', 'Page Scroll', 'Page Scroll: Content Reader',
                                              window.location.pathname, contentTime]);
                                   _gas.push(['_trackTiming', 'Page Scroll', 'Content Reader', contentTime * 1000,
                                              window.location.pathname, 100]);
                               }

                           }
                           endContent = true;
                       }

                       // If user has hit the bottom send an event
                       if(bottom == height && !didComplete) {
                           endTime = new Date().getTime();
                           var totalTime = Math.round((endTime - scrollTimeStart) / 1000);
                           if(opts.bottom) {
                               _gas.push(['_trackEvent', 'Page Scroll', 'Page Scroll: Page Bottom',
                                          window.location.pathname, totalTime, true]);
                               _gas.push(['_trackTiming', 'Page Scroll', 'Page Bottom', totalTime * 1000,
                                          window.location.pathname, 100]);
                           }
                           didComplete = true;
                       }
                   };

                   _trackScroll();


                   return false;

               }
    ]);


    /*
     * Fire custom events for TFA
     */
    function customEvents() {

        if(document.location.pathname.match(/why-teach-for-america/)) {

            //check if the popup is displayed
            jQuery(window).load(function () {
                setTimeout(function () {
                    if(jQuery('#cboxLoadedContent').length) {
                        _gas.push(['_trackEvent', 'Popups', 'Popup Displayed', 'Why Teach For America', null, true]);
                    }
                }, 500);
            });

            //track clicks on the popup
            jQuery(document).on('mousedown', '#cboxLoadedContent a', function () {
                _gas.push(['_trackEvent', 'Popups', 'Popup Clicked', 'Why Teach For America', null, false]);
            });

        }

        //navigation menus tracker
        //top navigation menu
        jQuery('#block-menu-menu-sitemast-menu a').mousedown(function () {
            _gas.push(['_trackEvent', 'Top Bar', jQuery(this).text()]);
        });

        //main navigation menu
        //top-level links
        jQuery('#block-superfish-1 a.sf-depth-1').mousedown(function () {
            _gas.push(['_trackEvent', 'Main Navigation', jQuery(this).text(), 'Menu Header']);
        });

        //sub menu links
        jQuery('#block-superfish-1 a.sf-depth-2,#block-superfish-1 a.sf-depth-3').mousedown(function () {
            var top = jQuery(this).parents('ul.sf-megamenu').prev().text();
            var sub = jQuery(this).text();
            _gas.push(['_trackEvent', 'Main Navigation', top, sub]);
        });


        // Generic Link Tracker
        // Tracks anything with class 'gaTrack' and use title or alt attribute
        // as action.
        jQuery('.gaTrack').mousedown(function () {
            var el = jQuery(this),
                action = el.attr('title') || el.attr('alt') || el.attr('href');
            if(action) {
                _gas.push(['_trackEvent', 'gaTrack', action]);
            }
        });

        // Taleo job links
        // eg: http://www.teachforamerica.org/join-our-staff/full-time-staff-opportunities/marketing
        // FIXME: New site still in progress, probaly broken
        jQuery('.staff-opportunity a').mousedown(function () {
            var t = jQuery(this).text(),
                h = jQuery('h1.page-title').text() || 'Unknown Category';
            if(t) _gas.push(['_trackEvent', 'Featured Opportunities', h, t]);
        });

        //Dynamic Event Tracking for Footer Elements
        jQuery('.sitemap-menu a').mousedown(function () {
            var theUrl = jQuery(this).attr('href'),
                theText = jQuery(this).text();
            _gas.push(['_trackEvent', 'footer', theText, theUrl]);
        });

        //Profile carousel clicks
        // FIXME: Needs to check if works on new site
        jQuery('.jcarousel-view--person-slider--block li').each(function () {
            var profile = jQuery(this),
                profile_name = profile.find('.name').text();
            if(profile_name) {
                profile.find('a').mousedown(function () {
                    _gas.push(['_trackEvent', 'Profile View', profile_name]);
                });
            }
        });

        // Webinar Signups
        // FIXME: Needs to check if works on new site
        if(document.location.href.indexOf('/why-teach-for-america/online-events') > -1) {
            jQuery('a[href*="webex.com"]').mousedown(function () {
                var ac = jQuery(this).closest('div').find('h2').text();
                _gas.push(['_trackEvent', 'WebinarSignups', ac]);
            });
        }

        //Events on the why teach for america page
        if(document.location.href.indexOf('/why-teach-for-america') > 1) {

            //Clicks to the big blue signup button
            jQuery('a.btn-blue[href*="/online/info/signUp.wbfl"]').mousedown(function () {
                _gas.push(['_trackEvent', 'Apply to the Corps', 'Why Teach For America', 'Apply Now Button Clicked']);
            });

        }

        // Newsletter Signups
        if(document.location.href.indexOf('/node/7572/done?sid=69') > -1) {
            _gas.push(['_trackEvent', 'Newsletter', 'signup']);
        }

        // Marquee Slides
        jQuery('div.slide-content a').mousedown(function () {
            var index = jQuery('div.slide-content a').index(this);
            _gas.push(['_trackEvent', 'homepage', 'marquee', 'Slide ' + index + ':' + this.href]);
        });

        // Blog Specific Events
        if(window.location.pathname.indexOf('/blog') === 0) {
            jQuery('a[href="/blog/feed"]').mousedown(function () {
                _gas.push(['_trackEvent', 'blog', 'rss']);
            });

            // Archive box
            jQuery('#quicktabs-container-archive a').mousedown(function () {
                var act = jQuery.trim(jQuery('#quicktabs-archive li.active').text()),
                    lab = jQuery(this).text();
                if(act) {
                    _gas.push(['_trackEvent', 'blog', act, lab]);
                }
            });

            // Featured Stories
            jQuery('.blog-featured a').mousedown(function () {
                _gas.push(['_trackEvent', 'blog', 'featured', jQuery.trim(jQuery(this).text())]);
            });

            // Related Stories
            jQuery('.blog-related-posts a').mousedown(function () {
                _gas.push(['_trackEvent', 'blog', 'related', jQuery.trim(jQuery(this).text())]);
            });

        }

        // Where we Work Map
        if(window.location.pathname.indexOf('/where-we-work') === 0) {
            // /where-we-work html map (non Google maps)
            jQuery('.region-map-marker').click(function () {
                var el = jQuery(this),
                    region = el.closest('.region-map-wrapper').
                        find('.region-map-header').text();
                if(region) {
                    _gas.push(['_trackEvent', 'www-engagement', 'point click']);
                }
            });

            // interact with map /where-we-work/dallas-fort-worth/living-here
            jQuery('svg[id^="OpenLayers"]').click(function openlayerInteract() {
                if(openlayerInteract.done !== true) {
                    openlayerInteract.done = true;
                    _gas.push(['_trackEvent', 'www-engagement', 'map']);
                }
            });

            // interact with timeline on community Spotlight
            jQuery('#timeline a').mousedown(function () {
                _gas.push(['_trackEvent', 'www-engagement', 'timeline', 'year']);
            });

        }

        // Home Specific Events
        if(window.location.pathname === '/') {
            // Blog links on the Home
            jQuery('.hp-blog-links a').mousedown(function () {
                _gas.push(['_trackEvent', 'homepage', 'blog', this.href]);
            });

            // News links on the Home
            jQuery('.hp-news-links a').mousedown(function () {
                _gas.push(['_trackEvent', 'homepage', 'in-the-news', this.href]);
            });

            // Promo boxes on Home
            jQuery('.tfa-panel-postscript-wrapper a').mousedown(function () {
                // The promo box always have an image inside
                _gas.push(['_trackEvent', 'homepage', 'promo-box', this.href]);
            });
        }

        // http://www.teachforamerica.org/now
        if(window.location.pathname.indexOf('/now') === 0) {
            jQuery('.applyButton').click(function () {
                _gas.push(['_trackEvent', 'NMTE', 'Apply Now Button']);
            });

            // Must use mousedown to fire before the content changes.
            // We use the text on the collapsed element
            jQuery('#container').delegate('.isotope-item', 'mousedown', function () {
                var el = jQuery(this),
                    action = 'expand',
                    label;

                if(el.hasClass('large')) {
                    action = 'collapse';
                }

                label = el.data('gaLabel');

                // Only set the label if the element is collapsed now
                if(!label && action === 'expand') {
                    if(el.hasClass('story')) {
                        label = el.text();

                    } else if(el.hasClass('image')) {
                        label = el.find('img').attr('src');
                    } else if(el.hasClass('tweet')) {
                        // Twitter Nodes
                        label = 'tweet';
                    }

                    if(label) {
                        el.data('gaLabel', label);
                    }

                }

                if(label) {
                    _gas.push(['_trackEvent', 'NMTE', action, label]);
                }
            });
        }

        //Donate Page buttons
        if(window.location.pathname.indexOf('/support-us') === 0) {
            jQuery('h5>a').mousedown(function () {
                var label = jQuery.trim(jQuery(this).text());
                if(label) {
                    _gas.push(['_trackEvent', 'Donate Page', 'button click', label]);
                }
            });
        }


        //Your Talent is Needed page
        if(window.location.pathname.indexOf("/your-talent-needed-and-we-can-help") === 0 ||
            window.location.pathname.indexOf("/extras/resource-guide") === 0
        ) {

            //blue button category clicks
            jQuery('.rg-categories a').click(function () {
                _gas.push(['_trackEvent', 'Online Resource Guide', 'Category Blue Button Clicks',
                           jQuery.trim(jQuery(this).find('span:first').text())]);
            });

            jQuery('.employment-filter').click(function () {
                _gas.push(['_trackEvent', 'Online Resource Guide', 'Employment Type',
                           jQuery.trim(jQuery(this).text())]);
            });
        }


        // Apply to the corps button
        // FIXME: Needs to check if works on new site
        jQuery('#apply a').mousedown(function () {
            _gas.push(['_trackPageview', '/vpv/button/apply-to-the-corps']);
            _gas.push(['_trackEvent', 'Apply to The Corps', jQuery(this).text()]);
        });


        /**
         * Custom form events for certain high-priority forms
         **/
            //custom form events - Contact Us form
        jQuery('#webform-client-form-35087').submit(function () {
            _gas.push(['_trackEvent', 'ContactUs Form', 'Reason for Contacting Us',
                       jQuery('#edit-submitted-email-to option:selected').text()]);
        });

        //custom form events - Where We Work expenses calculator
        //e.g. http://www.teachforamerica.org/where-we-work/dallas-fort-worth/expenses-and-certification
        jQuery('form#tfa-region-calc-calc-form').each(function () {

            jQuery(this).find('input').change(function () {
                _gas.push(['_trackEvent', 'Expense Calculator', jQuery(this).attr('name'), jQuery(this).val() || 0,
                           jQuery(this).val() || 0]);
            });

        });

        //custom form events - Support Us Subscription Form
        //jQuery('form[action*="/donate/TFAiFramePublic"]').each(function(){
        //
        //    var form_category = 'Support Us Subscription Form';
        //
        //    jQuery('input[name="clientField.programSelect"]').change(function(){
        //
        //    });
        //});


        /* Track top 2 levels of breadcrumbs in specific locations as a page-level custom variable */
        var path = document.location.pathname.split('/');

        if(path[1] == 'our-mission' || path[1] == 'where-we-work' || path[1] == 'why-teach-for-america' || path[1] == 'support-us') {
            path[2] = path[2] || 'root';
            _gas.push(['_setCustomVar', 1, path[1], path[2], 3, {
                "nouniversal": true
            }]);
            _gas.push(['_setCustomVar', 19, 'Breadcrumb', path[1] + ':' + path[2], 3]);
            ga('set', 'dimension19', path[1] + ':' + path[2]);

        }

        // Otherwise, on a blog post, set the author as the slot 1 custom var
        if(jQuery('#blog-post').length) {
            var author = jQuery('.date-display-single').parent().prev().text();
            _gas.push(['_setCustomVar', 1, 'Author', jQuery.trim(author), 3]);
            ga('set', 'dimension1', jQuery.trim(author));
        }

        // We only want to set the onNewComment callback if window.DISQUS is set
        jQuery(window).load(function () {
            if(window.DISQUS) {
                // As the callback needs to be set before disqus has been loaded
                // we are going to reset DISQUS onDocumentReady
                DISQUS.reset({
                    reload: true,
                    config: function () {
                        this.callbacks.onNewComment = [

                            function () {
                                _gas.push(['_trackEvent', 'Blog', 'New Comment', window.location.href]);
                            }
                        ];
                    }
                });
            }
        });

        //Journey Campaign
        if(window.location.pathname.indexOf('/katies-story') === 0 ||
            window.location.pathname.indexOf('/joshs-story') === 0 ||
            window.location.pathname.indexOf('/what-its-like-to-teach-tfa') === 0 ||
            window.location.pathname.indexOf('/deadline') === 0 ||
            window.location.pathname.indexOf('/next-deadline') === 0 ||
            window.location.pathname.indexOf("/time-change-things-now") === 0 ||
            window.location.pathname.indexOf("/marios-story") === 0 ||
            window.location.pathname.indexOf("/teach-for-change") === 0

        ) {

            //blue button clicks
            jQuery('a.btn-blue').mousedown(function () {
                _gas.push(['_trackEvent', 'Journey Campaign', document.location.pathname, jQuery(this).text()]);
            });

            //sublink clicks
            jQuery('a').mousedown(function () {
                if(this.href.indexOf(document.location.host) > -1 && !jQuery(this).hasClass('btn-blue')) {
                    _gas.push(['_trackEvent', 'Journey Campaign', document.location.pathname,
                               'Sub-link: ' + jQuery(this).text()]);
                }
            });

        }

        if(jQuery('meta[name=partner-page][content=partner-page-track]').length) {
            //sublink clicks
            jQuery('#main a').mousedown(function () {
                if(this.href.indexOf(document.location.host) > -1) {
                    _gas.push(['_trackEvent', 'Partnership Page', document.location.pathname,
                               'Sub-link: ' + jQuery(this).text()]);
                }
            });
        }


        //Events for On the Record
        if(document.location.pathname.match('tfa-on-the-record')) {

            var otr_category = 'On The Record';

            jQuery('ul.sf-menu').not('.sf-main-menu').find('a').mousedown(function () {
                _gas.push(['_trackEvent', otr_category, 'Subcategory Navigation', jQuery(this).text()]);
            });

            jQuery('.view-on-the-record-statistics .views-row').each(function () {
                var view_title = jQuery(this).find('.views-field-field-image-1 img').attr('alt');
                jQuery(this).find('.twitter-share,.facebook-share').mousedown(function () {
                    var social_type = jQuery(this).attr('class').replace('-share', '');
                    var social_action = (social_type == 'twitter') ? 'tweet' : 'send';
                    _gas.push(['_trackEvent', otr_category, 'Social Share: ' + social_type, view_title]);
                    _gas.push(['_trackSocial', social_type, social_action, view_title]);
                });
            });

            jQuery('.view-on-the-record-responses').each(function () {

                jQuery(this).find('.views-slideshow-pager-field-item').mousedown(function () {
                    var publication_name = jQuery.trim(jQuery(this).find('.views-content-field-publication').text());
                    _gas.push(['_trackEvent', otr_category, 'Responses - Tab Clicked', publication_name]);
                });

                jQuery('.views-field-view-node').mousedown(function () {
                    var publication_name = jQuery.trim(jQuery('.views_slideshow_active_pager_field_item .views-content-field-publication').text());
                    _gas.push(['_trackEvent', otr_category, 'Responses - Read More', publication_name]);
                });

                jQuery(this).find('.more-link a').mousedown(function () {
                    _gas.push(['_trackEvent', otr_category, 'Responses - View More']);
                });

            });


        }


        /*
         * The following scriptblock deals with tracking the YouTube video embedded in the
         * homepage marquee. When clicked, the youtube iframe is moved into a lightbox and displayed;
         * this breaks the GAS youtube tracking already attached to it. The best solution was to
         * recreate some of the GAS tracking here in this code block. The function waits for a click
         * on the specific marquee slide, and binds the tracking functionality after a short timeout.
         */
        jQuery('#tfa-marquee ul.slides > li').mousedown(function () {

            if(!jQuery.find('.colorbox-inline').length) {
                return;
            }

            setTimeout(function () {
                jQuery('#colorbox iframe[src*=youtube]').each(function () {
                    var p = new YT.Player(this);
                    p.addEventListener('onStateChange', function (event) {
                        var action;
                        switch (event.data) {
                            case 0:
                                action = 'finish';
                                break;
                            case 1:
                                action = 'play';
                                break;
                            case 2:
                                action = 'pause';
                                break;
                        }
                        _gas.push(['_trackEvent', 'YouTube Video', action,
                                   event.target.getVideoEmbedCode().replace(/.*src="(.*?)".*/, '$1')]);
                    });
                });
            }, 1000);
        });


        //Events for Thank a Teacher
        if(document.location.pathname.match(/^\/thank-a-teacher/)) {

            jQuery('form#thank-you-node-form').submit(function () {
                _gas.push(['_trackEvent', 'Thank A Teacher', 'Create Thank You Note']);
            });

            jQuery('a[href^="/honor"]').mousedown(function () {
                _gas.push(['_trackEvent', 'Thank A Teacher', 'Click Donate Link']);
            });

            jQuery('a.thank-you-post').mousedown(function () {
                _gas.push(['_trackEvent', 'Thank A Teacher', 'Post a New Thank You']);
            });

            jQuery(document).on('keydown', 'input[name=field_thank_you_note_value]', function (e) {
                if(e.keyCode == 13) {
                    _gas.push(['_trackEvent', 'Thank A Teacher', 'Search Thank Yous', jQuery(this).val()]);
                }
            });

            jQuery(document).on('mousedown', '#edit-submit-teacher-thank-yous', function () {
                _gas.push(['_trackEvent', 'Thank A Teacher', 'Search Thank Yous',
                           jQuery('#edit-field-thank-you-note-value').val()]);
            });

            //Social share buttons
            jQuery('.thank-you-share > a,.thank-you-forward > a').mousedown(function () {

                var network = jQuery(this).attr('class');

                if(network == 'forward-button') {
                    network = 'email';
                }

                var action = (network == 'twitter') ? 'tweet' : 'share';

                if(network == 'download') {
                    _gas.push(['_trackEvent', 'Thank A Teacher', 'Download Note', document.location.pathname]);
                } else {
                    _gas.push(['_trackEvent', 'Thank A Teacher', 'Social Share', network]);
                    _gas.push(['_trackSocial', network, action, document.location.href]);
                }

            });

        }

        //Symantec Awards
        if(document.location.pathname.match(/^\/vote-for-educators/)) {

            //Form submission
            jQuery('#form-innovation').submit(function () {
                _gas.push(['_trackEvent', 'Symantec Awards', 'Vote Submitted']);
            });

            //Twitter tweet callback, this covers both pages
            var bindTwitter = function () {
                _gas.push(['_trackEvent', 'Symantec Awards', 'Social Share', 'twitter']);
            };

            if(window.twttr && window.twttr.events && window.twttr.events.bind) {
                window.twttr.events.bind('tweet', bindTwitter);
            } else {
                jQuery(window).load(function () {
                    if(window.twttr && window.twttr.events && window.twttr.events.bind) {
                        window.twttr.events.bind('tweet', bindTwitter);
                    }
                });
            }
        }

        //Symantec Awards - Thank you page
        if(document.location.pathname.match(/^\/vote-for-educators\/thank-you/)) {

            //Facebook share button. This is doesn't use the real callback, to
            //get accurate statistics the FB.ui call is needed instead
            jQuery('a[href*="sharer.php"]').mousedown(function () {
                _gas.push(['_trackEvent', 'Symantec Awards', 'Social Share', 'Facebook']);
                _gas.push(['_trackSocial', 'facebook', 'send', 'Symatec Awards : Thank You']);
            });

            //Downloads on the thank you page
            jQuery('div.field-content  a > img').mousedown(function () {
                var download_name = jQuery(this).parent().attr('title');
                _gas.push(['_trackEvent', 'Symantec Awards', 'Download', download_name]);
            });
        }

        //Opt-in form tracking
        jQuery('form[action="/content/subscribe"]').submit(function (event) {

            //          if(needsHitCallback(event)) {
            //              _gas.push(['_set', 'hitCallback', makeHitCallback(event)]);

            var which_form;
            if(jQuery(this).parents('#super-top-wrapper').length) {
                which_form = 'Header';
            } else if(jQuery(this).parents('#postscript-wrapper').length) {
                which_form = 'Footer';
            } else {
                which_form = 'Sidebar';
            }

            var user_type = jQuery(this).find('input[type=checkbox]').eq(0).is(':checked') ?
                'Prospect' : 'General Supporter';

            _gas.push(['_trackEvent', 'Global Opt In', 'Opt In - ' + which_form, user_type]);
            //          }

        });

        if(document.location.pathname.match(/\/learn-more-to/)) {

            jQuery('#main form[action*="learn-more-to"]').submit(function () {

                //              if(needsHitCallback(event)) {
                //                  _gas.push(['_set', 'hitCallback', makeHitCallback(event)]);

                var which_form;
                if(document.location.pathname.match(/-support/)) {
                    which_form = 'General Supporter Form';
                } else {
                    which_form = 'Prospect Form';
                }

                _gas.push(['_trackEvent', 'Global Opt In', 'Submitted ' + which_form]);
                //              }

            });
        }

        if(document.location.pathname.match(/\/choose-more/)) {

            jQuery(document).on('mousedown', 'a[href$="/teach"]', function () {
                _gas.push(['_trackEvent', 'Campaign: Choose More', 'Click link to Dream Rise Do Site']);
            });

            //Clicks on links in the top navbar
            jQuery('.choices-menu ul.menu a:not(.fa)').mousedown(function () {
                if(this.href.match(/signUp.wbfl/)) {
                    _gas.push(['_trackEvent', 'Campaign: RT Choices', 'Apply Now', 'Header CTA']);
                } else {
                    var link_text = jQuery.trim(jQuery(this).text());
                    _gas.push(['_trackEvent', 'Campaign: RT Choices', 'Top Navigation', link_text]);
                }
            });

            //Clicks on links in the section navbar
            jQuery('.quick-links a').mousedown(function () {
                var link_text = jQuery.trim(jQuery(this).text()).replace(/[^a-zA-Z0-9] /g, '');
                _gas.push(['_trackEvent', 'Campaign: RT Choices', 'Sub Navigation', link_text]);
            });

            //Clicks to view one of the stories
            jQuery('#influencer .view-content .views-row a').mousedown(function () {
                var story_name = this.href.split('/').reverse()[0];
                _gas.push(['_trackEvent', 'Campaign: RT Choices', 'View Story', story_name]);
            });

            //Click on the Apply Today CTA in the footer
            jQuery('.cta a').mousedown(function () {
                _gas.push(['_trackEvent', 'Campaign: RT Choices', 'Apply Now', 'Footer CTA']);
            });

            //Youtube marquee videos
            jQuery('.field-content a').mousedown(function () {

                if(!jQuery.find('.colorbox-inline').length) {
                    return;
                }

                setTimeout(function () {
                    jQuery('#colorbox iframe[src*=youtube]').each(function () {
                        var p = new YT.Player(this);
                        p.addEventListener('onStateChange', function (event) {
                            var action;
                            switch (event.data) {
                                case 0:
                                    action = 'finish';
                                    break;
                                case 1:
                                    action = 'play';
                                    break;
                                case 2:
                                    action = 'pause';
                                    break;
                            }
                            _gas.push(['_trackEvent', 'YouTube Video', action,
                                       event.target.getVideoEmbedCode().replace(/.*src="(.*?)".*/, '$1')]);
                        });
                    });
                }, 1000);
            });

            //Click on links in the nav footer
            jQuery('.apply-links a').mousedown(function () {
                var link_text = jQuery.trim(jQuery(this).text());
                _gas.push(['_trackEvent', 'Campaign: RT Choices', 'Footer Navigation', link_text]);
            });

        }

        if(document.location.pathname.match(/thank-you-referring-friend/)) {
            jQuery('.facebook-button').mousedown(function () {
                var social_type = 'facebook';
                var social_action = 'send';
                var view_title = jQuery('h1').text();
                _gas.push(['_trackSocial', social_type, social_action, view_title]);
                _gas.push(['_trackEvent', 'Campaign: Refer a Friend', 'Social Share', social_type]);
            });

            jQuery('.twitter-button').mousedown(function () {
                var social_type = 'twitter';
                //var view_title = jQuery('h1').text();
                _gas.push(['_trackEvent', 'Campaign: Refer a Friend', 'Social Share', social_type]);
            });

            jQuery('#tfa-postscript a[href*="refer-a-friend"]').not('[href*=facebook]').mousedown(function () {
                _gas.push(['_trackEvent', 'Campaign: Refer a Friend', 'Click to Refer a Friend',
                           '/why-teach-for-america/building-a-movement/refer-a-friend-to-the-corps']);
            });

            jQuery('#tfa-postscript a[href*="choose-more"]').mousedown(function () {
                _gas.push(['_trackEvent', 'Campaign: Refer a Friend', 'Click to Learn More About Our Work',
                           '/choose-more']);
            });

        }


    }


    /*
     * Set Custom Variables
     */
    function customVars() {

        //var tracker = this.tracker; // get _gas tracker
        //If the Optimizely customvar 4 is set, push it through to universal as well
        //var optimizely = tracker._getVisitorCustomVar(4);
        //if (optimizely) {
        //    ga('set','dimension4',optimizely);
        //}

        // Set a universal-only custom dimension which combines
        //the optimizely experiment name and variation name
        try {
            if(optimizely) {
                var optimizely_custom_var = optimizely.allExperiments[optimizely.activeExperiments[0]].name + ':' + optimizely.variationNamesMap[optimizely.activeExperiments[0]];
                ga('set', 'dimension4', optimizely_custom_var);
            }

        } catch (e) {
        }


    }

    //Used to obtain a value from a string of key/value pairs
    function _uGC(l, n, s) {
        if(!l || !n || !s) {
            return '-';
        }
        var i, i2, i3, c = '-';
        i = l.indexOf(n);
        i3 = n.indexOf('=') + 1;
        if(i > -1) {
            i2 = l.indexOf(s, i);
            if(i2 < 0) {
                i2 = l.length;
            }
            c = l.substring((i + i3), i2);
        }
        return c;
    }

    /**
     * Entango pages are rendered inside an iframe. That Iframe should have
     * crossdomain cookie parameters.
     */
    window.ga_load_iframe = function (id, url) {
        _gas.push(function () {
            var el = document.getElementById(id);
            el.src = this.tracker._getLinkerUrl(url);
        });

        // Dynamically add the iFrame to the page with proper linker parameters.
        //jQuery('iframe[src*="secure.entango.com"]').each(function(){
        //    var iframe = this;
        //    ga(function(tracker){
        //        window.linker = window.linker || new window.gaplugins.Linker(tracker);
        //        iframe.src = window.linker.decorate(iframe.src);
        //    });
        //});

    };

    /**
     * Function to push to the CRM the values of first and last touch origins
     * this function should be pushed into GAS
     *
     * fields used: ga_first_origin, ga_last_origin
     */
    //function CRM_FT_push() {
    //  var tracker = this.tracker; // get _gas tracker
    //  jQuery('input[name=ga_first_origin]').val(function() {
    //    var ft = tracker._getVisitorCustomVar(5);
    //    if (ft) {
    //      ft = ft.split('!');
    //      if (ft.length >= 5) {
    //        // Use only source, medium, term, content
    //        return ft[0] + '!' + ft[1] + '!' + ft[3] + '!' + ft[4];
    //      }else {
    //        // Not enough fields
    //        return 'Not Identified';
    //      }
    //    }
    //  });
    //  jQuery('input[name=ga_last_origin]').val(function() {
    //    var gclid, v = [],
    //    z = _uGC(document.cookie, '__utmz=', ';');
    //  z = unescape(z);
    //
    //  gclid = _uGC(z, 'utmgclid=', '|');
    //  if (gclid !== '-') {
    //    v.push('google!cpc');
    //  }else {
    //    v.push(_uGC(z, 'utmcsr=', '|'));
    //    v.push(_uGC(z, 'utmcmd=', '|'));
    //  }
    //  v.push(_uGC(z, 'utmctr=', '|'));
    //  v.push(_uGC(z, 'utmcct=', '|'));
    //
    //  return v.join('!');
    //  });
    //}

    /*
     * new vesion of CRM_FT_push which splits up the
     * first/last touch parameters into separate fields.
     */

    function CRM_FT_push() {

        //Get firstTouch values from custom variable 5, and
        //push them into the CRM fields
        var tracker = this.tracker; // get _gas tracker
        var ft = tracker._getVisitorCustomVar(5);

        if(ft) {
            ft = ft.split('!');
            if(ft.length >= 5) {
                $('input[name=ga_first_origin]').val(ft[0]);
                $('input[name=firstTouchMedium]').val(ft[1]);
                $('input[name=firstTouchCampaign]').val(ft[2]);
                $('input[name=firstTouchKeyword]').val(ft[3]);
                $('input[name=firstTouchContent]').val(ft[4]);
            }
        }

        //Get lastTouch values from utmz cookie, and
        //push them into the CRM fields
        var gclid, z = _uGC(document.cookie, '__utmz=', ';');
        z = decodeURIComponent(z);
        gclid = _uGC(z, 'utmgclid=', '|');
        if(gclid !== '-') {
            $('input[name=ga_last_origin]').val('google');
            $('input[name=lastTouchMedium]').val('cpc');
        } else {
            $('input[name=ga_last_origin]').val(_uGC(z, 'utmcsr=', '|'));
            $('input[name=lastTouchMedium]').val(_uGC(z, 'utmcmd=', '|'));
        }
        $('input[name=lastTouchCampaign]').val(_uGC(z, 'utmccn=', '|'));
        $('input[name=lastTouchKeyword]').val(_uGC(z, 'utmctr=', '|'));
        $('input[name=lastTouchContent]').val(_uGC(z, 'utmcct=', '|'));

    }

    /* end new CRM_FT_push
     */

    /**
     * First Touch Source tracking via custom Variable
     */

    function trackFirstTouch() {
        var z, source, medium, term, content, campaign, gclid, utmString, fT;
        //Set first touch information if not already there, using slot 5

        fT = this.tracker._getVisitorCustomVar(5);

        if(!fT) {
            // Needs _initData first to set the cookies
            //Retrieve campaign and referrer info from the _utmz cookie
            z = _uGC(document.cookie, '__utmz=', ';');
            z = decodeURIComponent(z);
            source = _uGC(z, 'utmcsr=', '|');
            medium = _uGC(z, 'utmcmd=', '|');
            term = _uGC(z, 'utmctr=', '|');
            content = _uGC(z, 'utmcct=', '|');
            campaign = _uGC(z, 'utmccn=', '|');
            gclid = _uGC(z, 'utmgclid=', '|');

            //Replace empty values (marked by a dash) with an empty string
            if(source === '-') {
                source = '';
            }
            if(medium === '-') {
                medium = '';
            }
            if(term === '-') {
                term = '';
            }
            if(content === '-') {
                content = '';
            }
            if(campaign === '-') {
                campaign = '';
            }

            //If gclid is present, explicitly set source/medium to google/cpc
            if(gclid && gclid !== '-') {
                source = 'google';
                medium = 'cpc';
            }

            //Build utmString
            utmString = [source, medium, campaign, term, content].join('!');

            //Replace URL-encoded 'spaces' with real spaces
            utmString = utmString.replace('%20', ' ');


            //Set string to specific length
            utmString = utmString.substr(0, 128 - 3);

            _gas.push(['_setCustomVar', 5, 'FT', utmString, 1, {
                'nouniversal': true
            }]);
        }

        var fts = fT.split('!');
        ga('set', 'dimension5', [fts[0], fts[1]].join('!'));
        ga('set', 'dimension6', [fts[2], fts[3]].join('!'));

    }

    /**
     * Disposition Custom Var Tracking
     *
     * Tries to find out user disposition based on pageName
     */

    function setDispositionVar() {

        var page;
        var disposition = '';

        //use the server-defined pageName variable for trackpageview
        if(typeof window.pageName === 'string' && window.pageName !== '') {
            page = window.pageName;
        } else {
            return;
        }

        if(page.indexOf('Online Application:') >= 0) {

            if(page.indexOf('Registration Thank You') >= 0) {
                //XXX UNTESTED Pre-App
                disposition = 'Registrant';

            } else if(page.indexOf('Sign Up Thank You') >= 0) {
                //XXX UNTESTED Pre-App
                disposition = 'Sign Up';

            } else if(page.indexOf('Prerequisite Page') >= 0) {
                //App Stage I
                disposition = 'Registrant';

            } else if(page.indexOf('Application Submitted Page') >= 0) {
                //XXX UNTESTED App Stage I
                disposition = 'Applicant';

            } else if(page.indexOf('Submitted Status') >= 0) {
                //XXX UNTESTED Between App Stage 1 and PS Notification
                disposition = 'Applicant';

            } else if(page.indexOf('Research Survey Page') >= 0) {
                //XXX UNTESTED Between App Stage 1 and PS Notification
                disposition = 'Applicant';

            } else if(page.indexOf('Rejected') >= 0) {
                //FR Rejected
                disposition = 'Applicant - R';

            } else if(page.indexOf('Phone Sign-up') >= 0) {
                //Phone Screen
                disposition = 'Applicant - PS';

            } else if(page.indexOf('Phone Screen Skip') >= 0) {
                //XXX UNTESTED
                disposition = 'Applicant - PSS';

            } else if(page.indexOf('Interview Status') >= 0) {
                //Final Eval
                disposition = 'Applicant - FE';

            } else if(page.indexOf('Assign Overview - Form') >= 0) {
                //XXX UNTESTED Final Eval - XXX NEEDS CHECKING
                disposition = 'Applicant - FE';

            } else if(page.indexOf('Your Assignment') >= 0) {
                //XXX UNTESTED Final Eval
                disposition = 'Applicant - Accept';

            } else if(page.indexOf('Congratulations') >= 0) {
                //Assignment
                disposition = 'Applicant - Confirm';

            } else if(page.indexOf('Status Page') >= 0) {
                // This one needs to come last, because it's very generic.
                //XXX UNTESTED App Stage I
                disposition = 'Registrant';

            }
        }

        if(disposition) {
            _gas.push(['_setCustomVar', 3, 'Disposition', disposition, 1]);
            ga('set', 'dimension3', disposition);
        }
    }

    //modify the global pageName variable based on certain conditions
    function correctPageName() {

        if(typeof window.pageName === 'string' && window.pageName == "Online Application: Application Not Yet Complete Warning" && jQuery('.error-block').length === 0) {
            window.pageName = "Online Application: Review and Submit";
        } else if(document.location.href.indexOf('AddPostgradActivity.do') > -1) {
            window.pageName = "Online Application: Add Postgrad Activity";
        } else if(document.location.href.indexOf('AddUndergradActivity.do') > -1) {
            window.pageName = "Online Application: Add Undergrad Activity";
        } else if(document.location.href.indexOf('EditUndergradActivity.do') > -1) {
            window.pageName = "Online Application: Edit Undergrad Activity";
        } else if(document.location.pathname == "/online/apply/AddUndergradInstitution.do") {
            window.pageName = "Additional Undergraduate Institution";
        } else if(document.location.pathname == "/online/apply/AddGradInstitution.do") {
            window.pageName = "Additional Graduate Institution";
        } else if(document.location.pathname == "/online/apply/AddVolOrganization.do") {
            window.pageName = "Add Volunteer Organization";
        } else if(document.location.pathname == "/online/apply/AddUndergradActivity.do") {
            window.pageName = "Add Undergrad/Graduate Activity";
        } else if(document.location.pathname == "/online/apply/EditUndergradActivity.do") {
            window.pageName = "Edit Undergrad Activity";
        } else if(document.location.pathname == "/online/apply/EditPostgradActivity.do") {
            window.pageName = "Edit Postgrad Activity";
        }

    }

    function setCampaignParams() {

        var keys, campaignParams = [],
            i, match;

        if(document.location.href.indexOf('online/info/signUp.wbfl') > -1) {

            keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_keyword', 'utm_content', 'gclid', 'utm_referrer'];

            //first look to match the referrer
            var referrer_match = document.cookie.match(/utm_referrer=([^;&$]+)/);

            //loop over all the available parameters save them to our array
            for (i = 0; i < keys.length; i++) {
                match = document.cookie.match(new RegExp(keys[i] + "=([^;&$]+)"));
                if(match) {
                    campaignParams.push(match[0]);
                    //delete the cookies
                    document.cookie = keys[i] + '=; expires=' + (new Date(0)).toGMTString() + '; path=/';
                }
            }

            if(campaignParams.length) {

                if(referrer_match) {
                    _gas.push(['_setReferrerOverride', referrer_match[1]]);
                }
                _gas.push(['_set', 'campaignParams', campaignParams.join('&')]);

            }

        } else if(document.location.search.match(/&amp;/)) {

            var search = document.location.search.replace(/&amp;/g, '&');

            keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_keyword', 'utm_content', 'gclid'];

            //loop over all the available parameters save them to our array
            for (i = 0; i < keys.length; i++) {
                match = search.match(new RegExp(keys[i] + "=([^;&$]+)"));
                if(match) {
                    campaignParams.push(match[0]);
                }
            }

            if(campaignParams.length) {

                _gas.push(['_set', 'campaignParams', campaignParams.join('&')]);
                _gas.push(['_set', 'page', document.location.pathname + search]);

            }
        }
    }

    /**
     * Try to identify If user is logged by finding the "Logout" button
     */

    // Temporarily removing loggedin tracking in favor of Optimizely AB test
    /*
     function setLoggedIn() {
     try {
     jQuery(document).ready(function(jQuery) {
     var logoutText = jQuery('#utilnav').text();
     if (typeof logoutText === 'string' && logoutText.toLowerCase().indexOf('logout') >= 0) {
     _gas.push(['_setCustomVar', 4, 'LoggedIn', 'true', 2]);
     }
     });
     } catch (e) {}
     }
     */

    /**
     * Track Youtube and Twitter interactions.
     *
     * Must be after window.load otherwise it won't work.
     */

    function socialInteractions() {
        jQuery(window).load(function () {
            if(window.twttr && window.twttr.events && window.twttr.events.bind) {
                window.twttr.events.bind('tweet', function (ev) {
                    if(ev) {
                        var targetUrl; // Default value is undefined.
                        if(ev.target && ev.target.nodeName === 'IFRAME') {
                            targetUrl = extractParamFromUri_(ev.target.src, 'url');
                        }
                        _gas.push(['_trackSocial', 'twitter', 'tweet', targetUrl]);
                    }
                });
                window.twttr.events.bind('follow', function (ev) {
                    var label = ev.data.user_id + ' (' + ev.data.screen_name + ')';
                    _gas.push(['_trackSocial', 'twitter', 'follow', label]);
                });
            }
            if(window.FB && window.FB.Event && window.FB.Event.subscribe) {
                window.FB.Event.subscribe('edge.create', function (targetUrl) {
                    _gas.push(['_trackSocial', 'facebook', 'like', targetUrl]);
                });
                window.FB.Event.subscribe('edge.remove', function (targetUrl) {
                    _gas.push(['_trackSocial', 'facebook', 'unlike', targetUrl]);
                });
                window.FB.Event.subscribe('message.send', function (targetUrl) {
                    _gas.push(['_trackSocial', 'facebook', 'send', targetUrl]);
                });
            }
        });
    }

    /**
     * Extracts a query parameter value from a URI.
     * @param {string} uri The URI from which to extract the parameter.
     * @param {string} paramName The name of the query paramater to extract.
     * @return {string} The un-encoded value of the query paramater. underfined
     *     if there is no URI parameter.
     * @private
     */

    function extractParamFromUri_(uri, paramName) {
        var parts, query, params, param, i;
        if(!uri) {
            return;
        }
        uri = uri.split('#')[0]; // Remove anchor.
        parts = uri.split('?'); // Check for query params.
        if(parts.length === 1) {
            return;
        }
        query = decodeURI(parts[1]);

        // Find url param.
        paramName += '=';
        params = query.split('&');
        for (i = 0; i < params.length; ++i) {
            param = params[i];
            if(param.indexOf(paramName) === 0) {
                return decodeURIComponent(param.split('=')[1]);
            }
        }
        return;
    }

    /*** ACTION CENTER-ONLY CALLS ***/

    if(document.location.href.indexOf('action-center') > -1) {
        // Track clicks on 'Get the Code' buttons for video embed code.
        jQuery('a.vimeo-embed-code-handle').mousedown(function () {
            var textfound = jQuery(this).parent('div.vimeo-embed-code-wrapper').siblings('div.vimeo-embed-info-wrapper').children('div.vimeo-embed-title-wrapper').children('div.vimeo-embed-title').text();
            // Compensates for spaces mysteriously tacked-on to end of text in element.
            textfound = textfound.substring(0, textfound.length - 4);
            var actiondid = jQuery(this).text();
            if(!textfound) {
                textfound = 'Title Not Found';
            }
            _gas.push(['_trackEvent', 'action-center', textfound, actiondid + " - Clicked"]);
        });
        // Track downloads on posters.
        jQuery('div.ac-poster-download>a').mousedown(function () {
            var filefound = jQuery(this).attr('href');
            _gas.push(['_trackEvent', 'action-center', 'download', filefound]);
        });
        // Intercepts event tracking, forces it to fit desired format.
        _gas.push(['_addHook', '_trackEvent', function (cat, act, lab) {
            cat = cat.toLowerCase();
            act = act.toLowerCase();
            lab = lab.toLowerCase();
            // Intercepts regular vimeo call, forces it to fit desired format.
            if(cat.indexOf('vimeo video') > -1) {
                // Add code to grab proper name of video here later.
                var newLabel = "video-" + lab;
                return ['action-center', act, newLabel];
            }
            // Intercepts downloads, subjects it to tests, forces into desired format.
            else if(cat.indexOf('download') > -1) {
                if(lab.indexOf('tfa_basics') > -1) {
                    return ['action-center', 'refer', 'digital-brochure'];
                } else if(lab.indexOf('recommended.resources') > -1) {
                    return ['action-center', cat, 'recommended-resources'];
                } else if(lab.indexOf('school.visit') > -1) {
                    return ['action-center', 'organize', 'school-visit'];
                } else if(lab.indexOf('facebook_') > -1 && (lab.indexOf('_photos') > -1 || lab.indexOf('_backgrounds' > -1))) {
                    return ['action-center', 'facebook', lab];
                    // Later - replace lab var with code to grab actual text on button.
                } else if(lab.indexOf('twitter_') > -1 && (lab.indexOf('_photos') > -1 || lab.indexOf('_backgrounds' > -1))) {
                    return ['action-center', 'twitter', lab];
                    // Later - replace lab var with code to grab actual text on button.
                }
                return ['action-center', cat, lab];
            }
            // Intercepts outbounds, subjects them to tests, forces into desired format.
            else if(cat.indexOf('outbound') > -1) {
                //restore original case for Outbound category to match other outbound click tracking events 2/14/2013
                cat = 'Outbound';

                if(lab.indexOf('discussion_guide') > -1) {
                    return ['action-center', 'download', 'discussion-party'];
                } else if(lab.indexOf('teachforamerica.fundly.com') > -1) {
                    return ['action-center', 'fundraise', 'help-raise-funds'];
                } else if(lab.indexOf('teachforus.org') > -1) {
                    return ['action-center', 'learn', 'teach-for-us'];
                }
            }
            return [cat, act, lab];
        }
        ]);

        // Intercepts social tracking if video, adds _trackEvent for it.
        _gas.push(['_addHook', '_trackSocial',
                   function (ntwk, actn, trgt) {
                       _gas.push(['_trackEvent', 'action-center', ntwk, trgt]);
                       return [ntwk, actn, trgt];
                   }
        ]);
    }
    /*** END ACTION CENTER CALLS ***/


    /* Application form tracking */
    function trackApplicationForm() {

        var form_load_time = new Date();

        //Track time until form submit
        $('input[type=submit]').click(function () {
            var time_to_submit = new Date() - form_load_time;
            if(window.pageName) {
                _gas.push(['_trackTiming', 'Time to Form Submit', window.pageName, time_to_submit,
                           $(this).attr('value'), 100]);
                _gas.push(['_trackEvent', app_cat, 'Submitted', $(this).attr('value')]);
            }
        });

        //Track errors
        $('span.error,div.error-block a').not(':empty').each(function () {
            var label = $.trim($(this).text());

            //replace personally-identifiable emails with generic phrase before sending
            label = label.replace(/^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*/, '<email-address>');

            _gas.push(['_trackEvent', 'Form Errors', window.pageName, label]);
        });

        //Application Signup Form
        if($('#signUpForm').length) {

            app_cat = 'SignUpForm';

            //track links on form page which distract from sign up process
            $('#main a').mousedown(function () {
                _gas.push(['_trackEvent', app_cat, 'links', $(this).text()]);
            });

            //Track all select-box value changes (except for special cases)
            var signup_generic_change = function () {
                if(jQuery(this).val()) {
                    _gas.push(['_trackEvent', app_cat, jQuery(this).attr('name'),
                               jQuery(this).find(':selected').text()]);
                }
            };

            jQuery('#signUpForm select').bind('change', signup_generic_change);

            //set a custom variable on graduation year
            jQuery('#signUpForm').find('#undergradDegreeYear').change(function () {
                if(jQuery(this).val() !== '') {
                    _gas.push(['_setCustomVar', 2, 'GradYear', jQuery(this).val(), 1]);
                    ga('set', 'dimension2', jQuery(this).val());
                }
            });

            $('#appType').unbind('change', signup_generic_change).bind('change', function () {
                if($(this).val()) {
                    var app_type_val = $('#appType').find('option:selected').text().replace(/ \(.*$/, '');
                    _gas.push(['_setCustomVar', 7, 'Applicant Type', app_type_val, 1]);
                    ga('set', 'dimension7', app_type_val);
                    _gas.push(['_trackEvent', app_cat, 'Applicant Type', app_type_val]);
                }
            });


            $('#undergrad1univSelector').unbind('change', signup_generic_change).bind('change', function () {
                if($(this).val()) {
                    var label = $(this).find('option:selected').text();
                    _gas.push(['_trackEvent', app_cat, 'Undergrad Degree Institution', label]);
                    _gas.push(['_setCustomVar', 9, 'University Name : Undergraduate', label, 1]);
                    ga('set', 'dimension9', label);
                }
            });

            $('#grad1univSelector').unbind('change', signup_generic_change).bind('change', function () {
                if($(this).val()) {
                    _gas.push(['_trackEvent', app_cat, 'Graduate Degree Institution',
                               $(this).find('option:selected').text()]);
                }
            });


            $('#undergrad1univStateSelector').change(function () {
                var d = new Date();
                var timer;
                var num_options = $('#undergrad1univSelector').children().length;
                var _detectUnivLoad = function () {
                    if($('#undergrad1univSelector').children().length != num_options) {
                        window.clearInterval(timer);
                        _gas.push(['_trackTiming', app_cat, 'Retreive Universities', new Date() - d, null, 100]);
                    }
                };
                timer = window.setInterval(_detectUnivLoad, 20);

                _gas.push(['_setCustomVar', 8, 'University State : Undergraduate',
                           $(this).find('option:selected').text(), 1]);
                ga('set', 'dimension8', $(this).find('option:selected').text());

            });

            $('#grad1univStateSelector').change(function () {
                var d = new Date();
                var timer;
                var num_options = $('#grad1univSelector').children().length;
                var _detectUnivLoad = function () {
                    if($('#grad1univSelector').children().length != num_options) {
                        window.clearInterval(timer);
                        _gas.push(['_trackTiming', app_cat, 'Retreive Universities', new Date() - d, null, 100]);
                    }
                };
                timer = window.setInterval(_detectUnivLoad, 20);
            });


            $('#undergradGpaRange').bind('change', function () {
                if($(this).val()) {
                    var label = $(this).find('option:selected').text();
                    _gas.push(['_setCustomVar', 10, 'GPA : Undergraduate', label, 1]);
                    ga('set', 'dimension10', label);
                }
            });

            $('#undergradMajor1').bind('change', function () {
                if($(this).val()) {
                    var label = $(this).find('option:selected').text();
                    _gas.push(['_setCustomVar', 11, 'Major : Undergraduate', label, 1]);
                    ga('set', 'dimension11', label);
                }
            });


            $('#ethnicity').unbind('change', signup_generic_change).bind('change', function () {
                if($(this).val()) {
                    var label = $(this).find('option:selected').text();
                    _gas.push(['_trackEvent', app_cat, 'Ethnicity', label]);
                    _gas.push(['_setCustomVar', 17, 'Ethnicity', label, 1]);
                    ga('set', 'dimension17', label);
                }
            });

            //load google maps api for geocoding applicant state from zipcode
            var geocoder;
            $.getScript('//www.google.com/jsapi', function () {
                /*global google: true */
                google.load('maps', '3.1', {
                    callback:     function () {
                        geocoder = new google.maps.Geocoder();
                    },
                    other_params: 'sensor=false'
                });
            });

            $('#zip').change(function () {

                geocoder.geocode({
                    'address': $(this).val()
                }, function (results, status) {
                    if(status == 'OK' && results.length) {
                        var applicant_state = results[0].address_components[results[0].address_components.length - 2].long_name;
                        _gas.push(['_setCustomVar', 16, 'Current State', applicant_state, 1]);
                        ga('set', 'dimension16', applicant_state);
                        _gas.push(['_trackEvent', app_cat, 'Current State', applicant_state]);
                    }
                });

            });

            //Track time until submit button show
            var tracktiming_buttonshow_fired;
            $('*[onchange*=updateAccess]').change(function () {
                setTimeout(function () {

                    if(!$('#hitSignUp').is(':visible') || tracktiming_buttonshow_fired) {
                        return;
                    }

                    //only fire once
                    if(!tracktiming_buttonshow_fired) {
                        tracktiming_buttonshow_fired = true;
                    }

                    var time_to_show = new Date() - form_load_time;
                    _gas.push(['_trackTiming', app_cat, 'Show Button', time_to_show,
                               $('#hitSignUp input:visible').val(), 100]);

                }, 200);
            });


            $('#receivedPellGrants').change(function () {
                if($(this).is(':checked')) {
                    _gas.push(['_trackEvent', app_cat, 'receivedPellGrants']);
                }
            });

            $('select#gradDegree').change(function () {
                _gas.push(['_setCustomVar', 14, 'Graduate Degree Type', $(this).find('option:selected').text(), 1]);
                ga('set', 'dimension14', $(this).find('option:selected').text());
            });

            $('select#grad1DegreeYear').change(function () {
                _gas.push(['_setCustomVar', 12, 'GradYear : Graduate', $(this).find('option:selected').text(), 1]);
                ga('set', 'dimension12', $(this).find('option:selected').text());
            });

            //Personal Info form
        } else if($('form[name=appForm]').attr('action') == "/online/apply/ProcessPersonal.do") {

            app_cat = 'Application Personal Info Form';

            $('input[name="lookup(person).person.app.usCitizen"]').change(function () {
                var lab = $(this).next('.radio-item').text();
                _gas.push(['_trackEvent', app_cat, 'Citizen', lab]);
            });

            $('input[name="lookup(person).person.gender"]').change(function () {
                var label = $.trim($(this).next().text());
                _gas.push(['_setCustomVar', 18, 'Gender', label, 1]);
                ga('set', 'dimension18', label);
                _gas.push(['_trackEvent', app_cat, 'Gender', label]);
            });

            $('select[name="lookup(person).ethnicityVO.ethnicity"]').change(function () {
                var label = $.trim($(this).find('option:selected').text());
                _gas.push(['_setCustomVar', 17, 'Ethnicity', label, 1]);
                ga('set', 'dimension17', label);
                _gas.push(['_trackEvent', app_cat, 'Ethnicity', label]);
            });

            $('select[name="lookup(person).birthdate.year"]').change(function () {
                if($(this).val()) {
                    _gas.push(['_setCustomVar', 15, 'Year of Birth', $(this).val(), 1]);
                    ga('set', 'dimension15', $(this).val());
                    _gas.push(['_trackEvent', app_cat, 'Year of Birth', $(this).val()]);
                }
            });

            $('input[name="lookup(APPCURR).address.city"]').change(function () {
                _gas.push(['_trackEvent', app_cat, 'Current City', $.trim($(this).val())]);
            });

            $('select[name="currState"]').change(function () {
                var label = $(this).find('option:selected').text();
                _gas.push(['_setCustomVar', 16, 'Current State', label, 1]);
                ga('set', 'dimension16', label);
                _gas.push(['_trackEvent', app_cat, 'Current State', label]);
            });

            $('input[name="lookup(APPCURR).address.zip"]').change(function () {
                _gas.push(['_trackEvent', app_cat, 'Current Zip', $.trim($(this).val())]);
            });

            $('select[name="lookup(APPCURR).address.country"]').change(function () {
                _gas.push(['_trackEvent', app_cat, 'Current Country', $(this).find('option:selected').text()]);
            });

            $('input[name="lookup(APPCURR).address.textMessagePref"]').change(function () {
                if($(this).is(':checked')) {
                    _gas.push(['_trackEvent', app_cat, 'Allows Text Messages', 'checked']);
                }
            });


            $('input[name="lookup(APPHOME).address.city"]').change(function () {
                _gas.push(['_trackEvent', app_cat, 'Home City', $.trim($(this).val())]);
            });

            $('select[name="homeState"]').change(function () {
                _gas.push(['_trackEvent', app_cat, 'Home State', $(this).find('option:selected').text()]);
            });

            $('input[name="lookup(APPHOME).address.zip"]').change(function () {
                _gas.push(['_trackEvent', app_cat, 'Home Zip', $.trim($(this).val())]);
            });

            $('select[name="lookup(APPHOME).address.country"]').change(function () {
                _gas.push(['_trackEvent', app_cat, 'Home Country', $(this).find('option:selected').text()]);
            });

            $('input[name="lookup(LICPersonal).appDemo.lowIncGrewUp"]').change(function () {
                if($(this).is(':checked')) {
                    _gas.push(['_trackEvent', app_cat, 'Hometown Info', 'Low Income']);
                }
            });

            $('input[name="lookup(LICPersonal).app.receivedHsDiploma"]').change(function () {
                _gas.push(['_trackEvent', app_cat, 'High School Diploma', $(this).next().text()]);
            });

            $('input[name="lookup(LICPersonal).appDemo.lowIncAttendedSchool"]').change(function () {
                if($(this).is(':checked')) {
                    _gas.push(['_trackEvent', app_cat, "High School Diploma Low Income", $(this).next().text()]);
                }
            });

            $('input[name="lookup(app).app.firstInFamilyAttendingCollege"]').change(function () {
                var lab = $(this).next().text();
                _gas.push(['_trackEvent', app_cat, 'Are you in the first generation of your family to attend college?',
                           lab]);
            });

            $('select[name="lookup(app).app.parentsEducation"]').change(function () {
                var lab = $(this).find('option:selected').text();
                _gas.push(['_trackEvent', app_cat,
                           'What is the highest level of education either of your parents attained?', lab]);
            });

            $('select[name="lookup(app).app.parentalIncome"]').change(function () {
                var lab = $(this).find('option:selected').text();
                _gas.push(['_trackEvent', app_cat, "What is your parents' combined annual income?", lab]);
            });

            $('input[name="lookup(app).app.deadline"]').change(function () {
                var label = $.trim($(this).next().text());
                _gas.push(['_trackEvent', app_cat, "Application Deadline", label]);
                _gas.push(['_setCustomVar', 20, 'Application Deadline', label, 1]);
                ga('set', 'dimension20', label);
            });

            //Academic History form
        } else if($('form[name=appForm]').attr('action') == "/online/apply/ProcessAcademic.do") {

            app_cat = 'Application Academic History Form';

            $('select[name="lookup(UNDERGRAD1).univState"]').change(function () {
                var label = $(this).find('option:selected').text();
                _gas.push(['_setCustomVar', 8, 'University State : Undergraduate', label, 1]);
                ga('set', 'dimension8', label);
                _gas.push(['_trackEvent', app_cat, "undergrad1univState", label]);
            });

            $('select#UNDERGRAD1univSelector').change(function () {
                var label = $(this).find('option:selected').text();
                _gas.push(['_setCustomVar', 9, 'University Name : Undergraduate', label, 1]);
                ga('set', 'dimension9', label);
                _gas.push(['_trackEvent', app_cat, "Undergrad Degree Institution", label]);
            });

            $('select[name="lookup(UNDERGRAD1).education.degree"]').change(function () {
                _gas.push(['_trackEvent', app_cat, "Undergrad Degree Type", $(this).find('option:selected').text()]);
            });

            $('select[name="lookup(UNDERGRAD1).education.major1"]').change(function () {
                _gas.push(['_setCustomVar', 11, 'Major : Undergraduate', $(this).find('option:selected').text(), 1]);
                ga('set', 'dimension11', $(this).find('option:selected').text());
                _gas.push(['_trackEvent', app_cat, "undergradMajor1", $(this).find('option:selected').text()]);
            });

            $('select[name="lookup(UNDERGRAD1).education.major2"]').change(function () {
                _gas.push(['_trackEvent', app_cat, "undergradMajor2", $(this).find('option:selected').text()]);
            });

            $('input[name="lookup(UNDERGRAD1).gpaCumulative.gpaNumber"]').change(function () {

                var gpa = parseFloat($(this).val());
                var label;
                if(gpa >= 3.8) {
                    label = '3.8 and above';
                } else if(gpa >= 3.4) {
                    label = '3.4 - 3.7';
                } else if(gpa >= 3.0) {
                    label = '3.0 - 3.3';
                } else if(gpa >= 2.5) {
                    label = '2.5 - 2.9';
                } else if(gpa > 0) {
                    label = '2.49 and below';
                } else {
                    return;
                }

                _gas.push(['_setCustomVar', 10, 'Undergrad GPA', label, 1]);
                ga('set', 'dimension10', label);

            });


            $('select[name="lookup(GRAD1).degreeDate.year"]').change(function () {
                _gas.push(['_setCustomVar', 12, 'Graduate GradYear', $(this).find('option:selected').text(), 1]);
                ga('set', 'dimension12', $(this).find('option:selected').text());
            });

            $('select[name="GRAD1univStateSelector"]').change(function () {
                _gas.push(['_setCustomVar', 13, 'Graduate University State', $(this).find('option:selected').text(),
                           1]);
                ga('set', 'dimension13', $(this).find('option:selected').text());
            });

            $('select[name="lookup(GRAD1).education.degree"]').change(function () {
                _gas.push(['_setCustomVar', 14, 'Graduate Degree Type', $(this).find('option:selected').text(), 1]);
                ga('set', 'dimension14', $(this).find('option:selected').text());
                _gas.push(['_trackEvent', app_cat, "gradDegree", $(this).find('option:selected').text()]);
            });

            $('select[name="lookup(GRAD1).education.major1"]').change(function () {
                _gas.push(['_trackEvent', app_cat, "gradMajor1", $(this).find('option:selected').text()]);
            });

            $('form .section').slice(-3, -1).find('input[type=radio]').change(function () {
                _gas.push(['_trackEvent', app_cat, $.trim($(this).parents('.section').find('label.header').text()),
                           $(this).siblings(':first').text().replace(/\s{2,}/g, ' ') + ':' + $.trim($(this).next().text())]);
            });


            //Leadership Experience
        } else if($('form[name=appForm]').attr('action') == "/online/apply/ProcessLeadership.do") {

            app_cat = 'Application Leadership Experience Form';

            //radio buttons in Extracurricular & Professional Pursuits and
            //Additional Information
            //Professional Experience
            $('form .section:eq(1),form .section:eq(5), form #professionalExp.section').find('input[type=radio]').change(function () {
                _gas.push(['_trackEvent', app_cat, $.trim($(this).parents('.section').find('label.header').text()),
                           $(this).siblings(':first').text().replace(/\s{2,}/g, ' ') + ':' + $.trim($(this).next().text())]);
            });

            $('select[name="lookup(Leadership).app.person.appProspect.appCareerSector"]').change(function () {
                _gas.push(['_trackEvent', app_cat, 'Career Sector', $(this).find('option:selected').text()]);
            });

            //checkboxes in Experience in Low-Income Communities
            $('form .section:eq(4) input[type=checkbox]').change(function () {
                if($(this).is(':checked')) {
                    _gas.push(['_trackEvent', app_cat, $.trim($(this).parents('.section').find('label.header').text()),
                               $.trim($(this).next().text())]);
                }

            });


        }

    }


}());
/* End Main GAS Script */