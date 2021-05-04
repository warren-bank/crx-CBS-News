// ==UserScript==
// @name         CBS News
// @description  Improve site usability. Watch videos in external player.
// @version      1.0.1
// @match        *://cbsnews.com/live/*
// @match        *://*.cbsnews.com/live/*
// @match        *://cbsnews.com/video/*
// @match        *://*.cbsnews.com/video/*
// @icon         https://www.cbsnews.com/favicon.ico
// @run-at       document-end
// @grant        unsafeWindow
// @homepage     https://github.com/warren-bank/crx-CBS-News/tree/webmonkey-userscript/es5
// @supportURL   https://github.com/warren-bank/crx-CBS-News/issues
// @downloadURL  https://github.com/warren-bank/crx-CBS-News/raw/webmonkey-userscript/es5/webmonkey-userscript/CBS-News.user.js
// @updateURL    https://github.com/warren-bank/crx-CBS-News/raw/webmonkey-userscript/es5/webmonkey-userscript/CBS-News.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// ----------------------------------------------------------------------------- constants

var user_options = {
  "redirect_to_webcast_reloaded":  true,
  "force_http":                    true,
  "force_https":                   false
}

var strings = {
  "all_live_channels": {
    "title":                       "CBS News: Live Channels",
    "buttons": {
      "watch_channel":             "Watch Channel"
    }
  }
}

var constants = {
  "dom_classes": {
    "div_channel":                 "channel-container",
    "div_webcast_icons":           "icons-container",
    "btn_watch_channel":           "watch_channel"
  },
  "img_urls": {
    "base_webcast_reloaded_icons": "https://github.com/warren-bank/crx-webcast-reloaded/raw/gh-pages/chrome_extension/2-release/popup/img/"
  },
  "xhr_urls": {
    "get_live_channels":           "https://www.cbsnews.com/video/xhr/collection/component/live-channels/"
  }
}

// ----------------------------------------------------------------------------- helpers

// make GET request, parse JSON response, pass data to callback
var download_json = function(url, headers, callback) {
  var xhr = new unsafeWindow.XMLHttpRequest()
  xhr.open("GET", url, true, null, null)

  if (headers && (typeof headers === 'object')) {
    var keys = Object.keys(headers)
    var key, val
    for (var i=0; i < keys.length; i++) {
      key = keys[i]
      val = headers[key]
      xhr.setRequestHeader(key, val)
    }
  }

  xhr.onload = function(e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          var json_data = JSON.parse(xhr.responseText)
          callback(json_data)
        }
        catch(error) {
        }
      }
    }
  }

  xhr.send()
}

// -----------------------------------------------------------------------------

var make_element = function(elementName, html) {
  var el = unsafeWindow.document.createElement(elementName)

  if (html)
    el.innerHTML = html

  return el
}

// ----------------------------------------------------------------------------- URL links to tools on Webcast Reloaded website

var get_webcast_reloaded_url = function(video_url, vtt_url, referer_url, force_http, force_https) {
  force_http  = (typeof force_http  === 'boolean') ? force_http  : user_options.force_http
  force_https = (typeof force_https === 'boolean') ? force_https : user_options.force_https

  var encoded_video_url, encoded_vtt_url, encoded_referer_url, webcast_reloaded_base, webcast_reloaded_url

  encoded_video_url     = encodeURIComponent(encodeURIComponent(btoa(video_url)))
  encoded_vtt_url       = vtt_url ? encodeURIComponent(encodeURIComponent(btoa(vtt_url))) : null
  referer_url           = referer_url ? referer_url : unsafeWindow.location.href
  encoded_referer_url   = encodeURIComponent(encodeURIComponent(btoa(referer_url)))

  webcast_reloaded_base = {
    "https": "https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html",
    "http":  "http://webcast-reloaded.surge.sh/index.html"
  }

  webcast_reloaded_base = (force_http)
                            ? webcast_reloaded_base.http
                            : (force_https)
                               ? webcast_reloaded_base.https
                               : (video_url.toLowerCase().indexOf('http:') === 0)
                                  ? webcast_reloaded_base.http
                                  : webcast_reloaded_base.https

  webcast_reloaded_url  = webcast_reloaded_base + '#/watch/' + encoded_video_url + (encoded_vtt_url ? ('/subtitle/' + encoded_vtt_url) : '') + '/referer/' + encoded_referer_url
  return webcast_reloaded_url
}

// -----------------------------------------------------------------------------

var get_webcast_reloaded_url_chromecast_sender = function(video_url, vtt_url, referer_url) {
  return get_webcast_reloaded_url(video_url, vtt_url, referer_url, /* force_http= */ null, /* force_https= */ null).replace('/index.html', '/chromecast_sender.html')
}

var get_webcast_reloaded_url_airplay_sender = function(video_url, vtt_url, referer_url) {
  return get_webcast_reloaded_url(video_url, vtt_url, referer_url, /* force_http= */ true, /* force_https= */ false).replace('/index.html', '/airplay_sender.es5.html')
}

var get_webcast_reloaded_url_proxy = function(hls_url, vtt_url, referer_url) {
  return get_webcast_reloaded_url(hls_url, vtt_url, referer_url, /* force_http= */ true, /* force_https= */ false).replace('/index.html', '/proxy.html')
}

var make_webcast_reloaded_div = function(video_url, vtt_url, referer_url) {
  var webcast_reloaded_urls = {
//  "index":             get_webcast_reloaded_url(                  video_url, vtt_url, referer_url),
    "chromecast_sender": get_webcast_reloaded_url_chromecast_sender(video_url, vtt_url, referer_url),
    "airplay_sender":    get_webcast_reloaded_url_airplay_sender(   video_url, vtt_url, referer_url),
    "proxy":             get_webcast_reloaded_url_proxy(            video_url, vtt_url, referer_url)
  }

  var div = make_element('div')

  var html = [
    '<a target="_blank" class="chromecast" href="' + webcast_reloaded_urls.chromecast_sender + '" title="Chromecast Sender"><img src="'       + constants.img_urls.base_webcast_reloaded_icons + 'chromecast.png"></a>',
    '<a target="_blank" class="airplay" href="'    + webcast_reloaded_urls.airplay_sender    + '" title="ExoAirPlayer Sender"><img src="'     + constants.img_urls.base_webcast_reloaded_icons + 'airplay.png"></a>',
    '<a target="_blank" class="proxy" href="'      + webcast_reloaded_urls.proxy             + '" title="HLS-Proxy Configuration"><img src="' + constants.img_urls.base_webcast_reloaded_icons + 'proxy.png"></a>',
    '<a target="_blank" class="video-link" href="' + video_url                               + '" title="direct link to video"><img src="'    + constants.img_urls.base_webcast_reloaded_icons + 'video_link.png"></a>'
  ]

  div.setAttribute('class', constants.dom_classes.div_webcast_icons)
  div.innerHTML = html.join("\n")

  return div
}

var insert_webcast_reloaded_div = function(block_element, video_url, vtt_url, referer_url) {
  var webcast_reloaded_div = make_webcast_reloaded_div(video_url, vtt_url, referer_url)

  if (block_element.childNodes.length)
    block_element.insertBefore(webcast_reloaded_div, block_element.childNodes[0])
  else
    block_element.appendChild(webcast_reloaded_div)
}

// ----------------------------------------------------------------------------- URL redirect

var redirect_to_url = function(url) {
  if (!url) return

  try {
    unsafeWindow.top.location = url
  }
  catch(e) {
    unsafeWindow.window.location = url
  }
}

var process_video_url = function(video_url, video_type, vtt_url, referer_url) {
  if (!referer_url)
    referer_url = unsafeWindow.location.href

  if (typeof GM_startIntent === 'function') {
    // running in Android-WebMonkey: open Intent chooser

    var args = [
      /* action = */ 'android.intent.action.VIEW',
      /* data   = */ video_url,
      /* type   = */ video_type
    ]

    // extras:
    if (vtt_url) {
      args.push('textUrl')
      args.push(vtt_url)
    }
    if (referer_url) {
      args.push('referUrl')
      args.push(referer_url)
    }

    GM_startIntent.apply(this, args)
    return true
  }
  else if (user_options.redirect_to_webcast_reloaded) {
    // running in standard web browser: redirect URL to top-level tool on Webcast Reloaded website

    redirect_to_url(get_webcast_reloaded_url(video_url, vtt_url, referer_url))
    return true
  }
  else {
    return false
  }
}

var process_hls_url = function(hls_url, vtt_url, referer_url) {
  process_video_url(/* video_url= */ hls_url, /* video_type= */ 'application/x-mpegurl', vtt_url, referer_url)
}

var process_dash_url = function(dash_url, vtt_url, referer_url) {
  process_video_url(/* video_url= */ dash_url, /* video_type= */ 'application/dash+xml', vtt_url, referer_url)
}

// ----------------------------------------------------------------------------- process video on current page

var process_video = function() {
  try {
    var video_item = CBSNEWS.defaultPayload.items[0]
    var video_url  = video_item.video || video_item.video2
    var video_type = video_item.format

    if (!video_url) throw ''

    if (video_type)
      process_video_url(video_url, video_type)
    else
      process_hls_url(video_url)

    return true
  }
  catch(error) {
    return false
  }
}

// ----------------------------------------------------------------------------- display all available live channels

var format_channel_to_listitem = function(channel) {
  var inner_html = [
    '<div class="' + constants.dom_classes.div_channel + '">',
      '<h4><a target="_blank" href="' + channel.url + '">' + channel.name + '</a></h4>',
      '<button class="' + constants.dom_classes.btn_watch_channel  + '">' + strings.all_live_channels.buttons.watch_channel  + '</button>',
    '</div>'
  ]

  return make_element('li', inner_html.join("\n"))
}

var attach_event_handlers_to_listitem = function(li, channel) {
  var button_watch_channel = li.querySelector('button.' + constants.dom_classes.btn_watch_channel)

  button_watch_channel.addEventListener('click', function(event) {
    event.stopPropagation();event.stopImmediatePropagation();

    var video_url   = channel.video_url
    var video_type  = channel.video_type
    var vtt_url     = null
    var referer_url = channel.url || unsafeWindow.location.href

    process_video_url(video_url, video_type, vtt_url, referer_url)
  })
}

var insert_webcast_reloaded_div_to_listitem = function(li, channel) {
  var block_element = li.querySelector('div.' + constants.dom_classes.div_channel)
  var video_url     = channel.video_url
  var vtt_url       = null
  var referer_url   = channel.url || unsafeWindow.location.href

  insert_webcast_reloaded_div(block_element, video_url, vtt_url, referer_url)
}

var apply_workaround_for_native_scripts = function() {
  var ms_interval_between_attempts = 250
  var max_attempts                 = 120  // quit after 30 secs
  var current_attempts             = 0

  var attempt_workaround = function() {
    current_attempts++
    if (current_attempts > max_attempts) return

    var body = unsafeWindow.document.body
    if (body.classList.contains('no-embedded')) {
      body.className = 'embedded'
      unsafeWindow.window.isembed = true
    }
    else {
      setTimeout(attempt_workaround, ms_interval_between_attempts)
    }
  }

  attempt_workaround()
}

var build_dom_for_all_live_channels = function(channels) {
  if (!channels || !Array.isArray(channels) || !channels.length) return

  var head  = unsafeWindow.document.getElementsByTagName('head')[0]
  var body  = unsafeWindow.document.body
  var title = strings.all_live_channels.title || unsafeWindow.document.title

  var html = {
    "head": [
      '<style>',

      'body {',
      '  background-color: #fff;',
      '  text-align: left;',
      '}',

      'body > div > h2 {',
      '  text-align: center;',
      '  margin: 0.5em 0;',
      '}',

      'body > div > ul > li > div.channel-container {',
      '  min-height: 70px;',
      '}',
      'body > div > ul > li > div.channel-container > div.icons-container {',
      '}',
      'body > div > ul > li > div.channel-container > h4 {',
      '  margin: 0.5em 0;',
      '}',
      'body > div > ul > li > div.channel-container > h4 > a {',
      '  text-decoration: none;',
      '}',
      'body > div > ul > li > div.channel-container > button.watch_channel {',
      '}',

      // --------------------------------------------------- CSS: reset

      'h2 {',
      '  font-size: 24px;',
      '}',

      'body, h4, a {',
      '  font-size: 18px;',
      '}',

      'button {',
      '  font-size: 16px;',
      '}',

      // --------------------------------------------------- CSS: separation between live channels

      'body > div > ul {',
      '  list-style: none;',
      '  margin: 0;',
      '  padding: 0;',
      '}',

      'body > div > ul > li {',
      '  list-style: none;',
      '  margin-top: 0.5em;',
      '  border-top: 1px solid #999;',
      '  padding-top: 0.5em;',
      '}',

      'body > div > ul > li > div {',
      '  margin-top: 0.5em;',
      '}',

      // --------------------------------------------------- CSS: links to tools on Webcast Reloaded website

      'body > div > ul > li > div.channel-container > div.icons-container {',
      '  display: block;',
      '  position: relative;',
      '  z-index: 1;',
      '  float: right;',
      '  margin: 0.5em;',
      '  width: 60px;',
      '  height: 60px;',
      '  max-height: 60px;',
      '  vertical-align: top;',
      '  background-color: #d7ecf5;',
      '  border: 1px solid #000;',
      '  border-radius: 14px;',
      '}',

      'body > div > ul > li > div.channel-container > div.icons-container > a.chromecast,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.chromecast > img,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.airplay,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.airplay > img,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.proxy,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.proxy > img,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.video-link,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.video-link > img {',
      '  display: block;',
      '  width: 25px;',
      '  height: 25px;',
      '}',

      'body > div > ul > li > div.channel-container > div.icons-container > a.chromecast,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.airplay,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.proxy,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.video-link {',
      '  position: absolute;',
      '  z-index: 1;',
      '  text-decoration: none;',
      '}',

      'body > div > ul > li > div.channel-container > div.icons-container > a.chromecast,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.airplay {',
      '  top: 0;',
      '}',
      'body > div > ul > li > div.channel-container > div.icons-container > a.proxy,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.video-link {',
      '  bottom: 0;',
      '}',

      'body > div > ul > li > div.channel-container > div.icons-container > a.chromecast,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.proxy {',
      '  left: 0;',
      '}',
      'body > div > ul > li > div.channel-container > div.icons-container > a.airplay,',
      'body > div > ul > li > div.channel-container > div.icons-container > a.video-link {',
      '  right: 0;',
      '}',
      'body > div > ul > li > div.channel-container > div.icons-container > a.airplay + a.video-link {',
      '  right: 17px; /* (60 - 25)/2 to center when there is no proxy icon */',
      '}',

      // ---------------------------------------------------

      '</style>'
    ],
    "body": [
      '<div>',
        '<ul>',
        '</ul>',
      '</div>'
    ]
  }

  if (title) {
    html.head.unshift('<title>'   + title + '</title>')
    html.body.unshift('<div><h2>' + title + '</h2></div>')
  }

  head.innerHTML = '' + html.head.join("\n")
  body.innerHTML = '' + html.body.join("\n")

  var ul = body.querySelector('ul')
  if (!ul) return

  var channel, li
  for (var i=0; i < channels.length; i++) {
    channel = channels[i]
    li      = format_channel_to_listitem(channel)

    ul.appendChild(li)
    attach_event_handlers_to_listitem(li, channel)
    insert_webcast_reloaded_div_to_listitem(li, channel)
  }

  apply_workaround_for_native_scripts()
}

var download_all_live_channels = function(callback) {
  if (typeof callback !== 'function') return

  download_json(constants.xhr_urls.get_live_channels, {"Accept": "application/json"}, function(data) {
    var channels = []
    var item1, item2, channel

    if (data && (typeof data === 'object') && data.items && Array.isArray(data.items) && data.items.length) {
      for (var i=0; i < data.items.length; i++) {
        item1 = data.items[i]

        if (item1 && (typeof item1 === 'object') && item1.items && Array.isArray(item1.items) && item1.items.length) {
          for (var j=0; j < item1.items.length; j++) {
            item2 = item1.items[j]

            if (item2 && (typeof item2 === 'object')) {
              channel = {
                name:       item2.canonicalTitle || item2.fulltitle || item2.title,
                url:        item2.url,
                video_url:  item2.video || item2.video2,
                video_type: item2.format
              }

              if (channel.name && channel.video_url)
                channels.push(channel)
            }
          }
        }
      }
    }

    callback(channels)
  })
}

var display_all_live_channels = function() {
  download_all_live_channels(build_dom_for_all_live_channels)
}

// ----------------------------------------------------------------------------- bootstrap

var init = function() {
  var pathname      = unsafeWindow.location.pathname
  var is_video      = (pathname.indexOf('/video') === 0)
  var is_live       = (pathname.indexOf('/live')  === 0)
  var is_live_video = (is_live && (pathname.length > 6))  // '^/live/.+$'

  if (is_video)
    process_video()
  else if (is_live_video)
    process_video() || display_all_live_channels()
  else if (is_live)
    display_all_live_channels()
}

init()

// -----------------------------------------------------------------------------
