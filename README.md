### [CBS News](https://github.com/warren-bank/crx-CBS-News/tree/webmonkey-userscript/es5)

[Userscript](https://github.com/warren-bank/crx-CBS-News/raw/webmonkey-userscript/es5/webmonkey-userscript/CBS-News.user.js) for [cbsnews.com](https://cbsnews.com/) to run in both:
* the [WebMonkey](https://github.com/warren-bank/Android-WebMonkey) application for Android
* the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) web browser extension for Chrome/Chromium

Its purpose is to:
* on pages that contain a live stream
  - on the [top-level page](https://cbsnews.com/live/)
    * display a list of all available live channels
      - each list item includes:
        * the name of the channel
        * the url to link directly to the distinct live channel
        * a button to redirect the video stream to an external player
        * a grouping of icons to transfer the video stream to various tools on the [Webcast-Reloaded](https://github.com/warren-bank/crx-webcast-reloaded) external [website](https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html)
          - mainly for use with:
            * _Google Chromecast_
            * [_ExoAirPlayer_](https://github.com/warren-bank/Android-ExoPlayer-AirPlay-Receiver)
            * [_HLS-Proxy_](https://github.com/warren-bank/HLS-Proxy)
  - on pages that contain a distinct live channel
    * redirect the video stream to an external player
* on pages that contain an on-demand video stream
  - redirect the video stream to an external player

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
