hexoskin-rtls-dashboard
=======================

Dashboard combining Hexoskin sensor data and reelyActive real-time location. We believe in an open Internet of Things.


Instructions
------------

1. Clone the repository
2. npm install
3. Edit the user-defined parameters in server.js
4. Edit the user-defined parameters in web/js/dashboard.js
5. node server
6. Browse to [localhost:3000](http://localhost:3000)

The dashboard will display any Hexoskin users detected at points of interest pushing events via the DEFAULT_SOCKET_URL (web/js/dashboard.js).  The following section describes how to associate Hexoskin users with wireless devices.


Associate a wireless device with a Hexoskin user
------------------------------------------------

Hexoskin users will be recognised by a __HX#__ tag associated with the advertiser address of a BLE or Active RFID device they carry.  For instance, the tag __HX8872__ would refer to Hexoskin user 8872.

For example, to associate BLE device with advertiser address __fee150bada55__ with Hexoskin user __HX8872__, PUT the following JSON:

    { "tags": [ "HX8872" ] }

to www.hyperlocalcontext.com/associations/fee150bada55.


License
-------

MIT License

Copyright (c) 2016 reelyActive

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
