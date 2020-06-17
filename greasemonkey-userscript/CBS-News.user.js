// ==UserScript==
// @name         CBS News
// @description  Removes clutter to improve site usability. Can transfer video stream to alternate video players: WebCast-Reloaded, ExoAirPlayer.
// @version      0.1.1
// @match        *://cbsnews.com/live/
// @match        *://cbsnews.com/live/cbsn-local-*
// @match        *://*.cbsnews.com/live/
// @match        *://*.cbsnews.com/live/cbsn-local-*
// @icon         https://www.cbsnews.com/favicon.ico
// @run-at       document-idle
// @homepage     https://github.com/warren-bank/crx-CBS-News/tree/greasemonkey-userscript
// @supportURL   https://github.com/warren-bank/crx-CBS-News/issues
// @downloadURL  https://github.com/warren-bank/crx-CBS-News/raw/greasemonkey-userscript/greasemonkey-userscript/CBS-News.user.js
// @updateURL    https://github.com/warren-bank/crx-CBS-News/raw/greasemonkey-userscript/greasemonkey-userscript/CBS-News.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// https://www.chromium.org/developers/design-documents/user-scripts

var user_options = {
  "script_injection_delay_ms":    0,
  "redirect_to_webcast_reloaded": true,
  "force_http":                   true,
  "force_https":                  false
}

var payload = function(){
  // ===========================================================================

  const get_referer_url = function() {
    let referer_url
    try {
      referer_url = top.location.href
    }
    catch(e) {
      referer_url = window.location.href
    }
    return referer_url
  }

  const get_webcast_reloaded_url = (hls_url, vtt_url, referer_url) => {
    let encoded_hls_url, encoded_vtt_url, encoded_referer_url, webcast_reloaded_base, webcast_reloaded_url

    encoded_hls_url       = encodeURIComponent(encodeURIComponent(btoa(hls_url)))
    encoded_vtt_url       = vtt_url ? encodeURIComponent(encodeURIComponent(btoa(vtt_url))) : null
    referer_url           = referer_url ? referer_url : get_referer_url()
    encoded_referer_url   = encodeURIComponent(encodeURIComponent(btoa(referer_url)))

    webcast_reloaded_base = {
      "https": "https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html",
      "http":  "http://webcast-reloaded.surge.sh/index.html"
    }

    webcast_reloaded_base = (window.force_http)
                              ? webcast_reloaded_base.http
                              : (window.force_https)
                                 ? webcast_reloaded_base.https
                                 : (hls_url.toLowerCase().indexOf('http:') === 0)
                                    ? webcast_reloaded_base.http
                                    : webcast_reloaded_base.https

    webcast_reloaded_url  = webcast_reloaded_base + '#/watch/' + encoded_hls_url + (encoded_vtt_url ? ('/subtitle/' + encoded_vtt_url) : '') + '/referer/' + encoded_referer_url
    return webcast_reloaded_url
  }

  const redirect_to_url = function(url) {
    if (!url) return

    try {
      top.location = url
    }
    catch(e) {
      window.location = url
    }
  }

  // ===========================================================================

  const process_index = () => {

    const download_json = async (url) => {
      const headers = new Headers({
        'Accept': 'application/json'
      })

      const request = new Request(url, {
        method: 'GET',
        headers: headers
      })

      try {
        const response = await fetch(request)
        const data     = await response.json()

        if (!(data instanceof Object))
          throw new Error('bad type')

        return data
      }
      catch(error) {
        return {}
      }
    }

    const get_live_streams = async () => {
      const url          = 'https://www.cbsnews.com/video/xhr/collection/schedule/b7387c37-5f7f-478a-9949-c5af12fd2e54/?is_logged_in=0'
      const data         = await download_json(url)
      const live_streams = []

      if (Array.isArray(data.items) && data.items.length) {
        data.items.forEach(item => {
          if (Array.isArray(item.items) && item.items.length) {
            item.items.forEach(item => {
              const stream = {
                name: item.canonicalTitle,
                url:  item.video || item.video2
              }

              const vtt_url     = null
              const referer_url = item.url || null

              if (stream.name && stream.url) {
                stream.url = get_webcast_reloaded_url(stream.url, vtt_url, referer_url)
                live_streams.push(stream)
              }
            })
          }
        })
      }

      return live_streams
    }

    const get_html_content = (live_streams) => {
      const html = `
<div style="padding:1em">
  <h2>Live Streams:</h2>
  <hr />
  <ul>
    ${live_streams.map(stream => `<li><a target="_blank" href="${stream.url}">${stream.name}</a></li>`).join("\n  ")}
  </ul>
</div>
`
      return html
    }

    const process_live_streams = async () => {
      const live_streams = await get_live_streams()

      if (Array.isArray(live_streams) && live_streams.length) {
        const html = get_html_content(live_streams)
        document.body.innerHTML = html
      }
    }

    process_live_streams()
  }

  // ===========================================================================

  const process_video = () => {
    const hls_url = CBSNEWS.defaultPayload.items[0].video || CBSNEWS.defaultPayload.items[0].video2

    if (hls_url && window.redirect_to_webcast_reloaded) {
      // transfer video stream

      redirect_to_url(get_webcast_reloaded_url(hls_url))
    }
    else {
      process_index()
    }
  }

  // ===========================================================================

  const process_site_url = (pathname) => {
    if (pathname.indexOf('/live/cbsn-local-') === 0)
      process_video()
    else
      process_index()
  }

  const init = () => {
    process_site_url(window.location.pathname.toLowerCase())
  }

  init()

  // ===========================================================================
}

var get_hash_code = function(str){
  var hash, i, char
  hash = 0
  if (str.length == 0) {
    return hash
  }
  for (i = 0; i < str.length; i++) {
    char = str.charCodeAt(i)
    hash = ((hash<<5)-hash)+char
    hash = hash & hash  // Convert to 32bit integer
  }
  return Math.abs(hash)
}

var inject_function = function(_function){
  var inline, script, head

  inline = _function.toString()
  inline = '(' + inline + ')()' + '; //# sourceURL=crx_extension.' + get_hash_code(inline)
  inline = document.createTextNode(inline)

  script = document.createElement('script')
  script.appendChild(inline)

  head = document.head
  head.appendChild(script)
}

var inject_options = function(){
  var _function = `function(){
    window.redirect_to_webcast_reloaded = ${user_options['redirect_to_webcast_reloaded']}
    window.force_http                   = ${user_options['force_http']}
    window.force_https                  = ${user_options['force_https']}
  }`
  inject_function(_function)
}

var bootstrap = function(){
  inject_options()
  inject_function(payload)
}

if (user_options['redirect_to_webcast_reloaded']){
  setTimeout(
    bootstrap,
    user_options['script_injection_delay_ms']
  )
}
