var _nDimensions = 60;
var _coords;
var _savedCoords = [];
var _params;
var _maxs, _mins;
init();
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function init() {
    var ukey = getParameterByName("ukey");
    var style = getParameterByName("style"); // normal, anti, reconstructed
    if (ukey == "") {
        var c1 = getParameterByName("c1");
        if (c1 == "")
            ukey = -1;
        else {
            var coords = [];
            var mins = []; var maxs = [];
            for (var i = 0; i < _nDimensions; i++) {
                var prefix = "c" + i;
                coords[i] = parseInt(getParameterByName(prefix));
                if (isNaN(coords[i])) coords[i] = 0;
                mins[i] = -4000; maxs[i] = 4000;  // best we can do for now.
            }
            setupGUI(coords, mins, maxs); // this sets mins & maxs & inits _coords
            updateFace(-1, 0);  // this makes call to server that will draw the face.
            return;
        }
    }
    // if we get here, we're looking up face by ukey.
    if (style = "") style = "reconstructed";
    makeJSONRequest(ukey, style);
}
function makeJSONRequest(ukey, style) {   // need to do something with Style!!
    console.log("Ukey = " + ukey);
    var jsonfile = new XMLHttpRequest();
    if (ukey === undefined || ukey == -1 || ukey == 0) {
        console.log("setting ukey = -1");
        jsonfile.open("GET", "SynthFaceJSON.aspx?timeStamp=" + new Date().getTime(), true);    // timestamp prevents IE caching request
        ukey = -1;
    }
    else
        jsonfile.open("GET", "SynthFaceJSON.aspx?ukey=" + ukey, true);

    jsonfile.onreadystatechange = function () {
        console.log("Here " + jsonfile.readyState);
        if (jsonfile.readyState == 4) {
            console.log("Status " + jsonfile.status);
            if (jsonfile.status == 200) {
                var face = JSON.parse(jsonfile.responseText);
                var img = document.getElementById('faceImg');
                img.src = face.path;
                var img = document.getElementById('FaceBookThumb');
                img.src = face.path;

                setupGUI(face.coords, face.mins, face.maxs);
            }
        }
    };
    jsonfile.send(null);
}
function getHeightInPixels(el) {
    if (_browserNormal)
        return el.offsetHeight;
    else
        return parseInt(window.getComputedStyle(el).height);
}
function setupGUI(coords, mins, maxs) {   // this is only called once, when page loads.
    _maxs = maxs; _mins = mins;
    var el = document.getElementById('centerPanel');
    ///var h = parseInt(window.getComputedStyle(el).height);
    var h = getHeightInPixels(el);
    var img = document.getElementById('faceImg');
    img.height = h;

    _coords = coords;
    for (var i = 0; i < _nDimensions; i++) _savedCoords[i] = _coords[i];
    var el, h;
    el = document.getElementById('leftPanel');
    //h = parseInt(window.getComputedStyle(el).height);
    h = getHeightInPixels(el);

    var gui1 = new DAT.GUI({ width: 200, height: h });
    el.appendChild(gui1.domElement);
    for (var i = 0; i < _nDimensions / 2; i++) {
        var guiobj = gui1.add(coords, i, mins[i], maxs[i]).listen();
        var tempi = i;
        //guiobj.onChange(function (value) { updateFace(tempi, value); });
        (function (e) {
            guiobj.onChange(function (value) { updateFace(e, value); })
        }
        )(i);
    }
    gui1.domElement.style.cssFloat = 'left';
    gui1.domElement.style.backgroundColor = 'black';

    el = document.getElementById('rightPanel');
    var gui2 = new DAT.GUI({ width: 200, height: h });
    el.appendChild(gui2.domElement);
    for (var i = _nDimensions / 2; i < _nDimensions; i++) {
        var guiobj = gui2.add(coords, i, mins[i], maxs[i]).listen();
        var tempi = i;
        (function (e) {
            guiobj.onChange(function (value) { updateFace(e, value); })
        }
        )(i);
    }
    gui2.domElement.style.cssFloat = 'right';
    gui2.domElement.style.textAlign = 'right';
    gui2.domElement.style.marginRight = '2px';
    gui2.domElement.style.backgroundColor = 'black';
}
var _updatingFace = false;
function updateFace(i, newvalue) {
    doneSharing();
    if (_updatingFace) return;
    if (i != -1) {  // i == -1 means just do the damn update and don't be so clever.
        console.log("For coord [" + i + "] old = " + _savedCoords[i] + ", new = " + newvalue);
        if (_savedCoords[i] == newvalue) {
            console.log("Not changed: Value for coord [" + i + "] has not changed. returning.");
            return;
        }
        _savedCoords[i] = newvalue;
    }
    _updatingFace = true;
    var json = JSON.stringify(_coords, null, " ");
    uploadJSON(json);
}
function calcAntiFace() {
    doneSharing();
    if (_updatingFace) return;
    for (var i = 0; i < _nDimensions; i++)
        _savedCoords[i] *= -1;
    for (var i = 0; i < _nDimensions; i++)
        _coords[i] *= -1;
    _updatingFace = true;
    var json = JSON.stringify(_coords, null, " ");
    uploadJSON(json);
}
function calcRandomFace() {
    doneSharing();
    if (_updatingFace) return;
    for (var i = 0; i < _nDimensions; i++) {
        _savedCoords[i] = _coords[i] = Math.random() * (_maxs[i] - _mins[i]) + _mins[i];
    }
    _updatingFace = true;
    var json = JSON.stringify(_coords, null, " ");
    uploadJSON(json);
}
function calcMeanFace() {
    doneSharing();
    if (_updatingFace) return;
    for (var i = 0; i < _nDimensions; i++) {
        _savedCoords[i] = _coords[i] = 0;
    }
    _updatingFace = true;
    var json = JSON.stringify(_coords, null, " ");
    uploadJSON(json);
}
function uploadJSON(jsonString) {
    var xhr2 = new XMLHttpRequest();
    xhr2.open("POST", "SynthFaceJSON.aspx");
    xhr2.setRequestHeader('Content-Type', 'application/json');
    xhr2.onreadystatechange = function () {
        if (xhr2.readyState == 4 && xhr2.status == 200) {
            console.log("Your JSON was uploaded successfully.");
            var face = JSON.parse(xhr2.responseText);
            var img = document.getElementById('faceImg');
            img.src = face.path;
            var img = document.getElementById('FaceBookThumb');
            img.src = face.path;
        }
        _updatingFace = false;
    }
    //console.log(jsonString);
    xhr2.send(jsonString);
    console.log("Sent JSON to Server");
}
// ---------------------------------------------
var _amSharing = false;
function doneSharing() {
    document.getElementById('ShareDiv').style.display = 'none';
    document.getElementById('modalBackground').style.display = 'none';
    _amSharing = false;
}
function buildURLFromCoords() {
    var suffix = "";
    for (var i = 0; i < _nDimensions; i++) {
        suffix += "c" + i + "=" + Math.floor(_coords[i]) + "&";
    }
    return suffix;
}
function share() {
    if (_amSharing) {
        doneSharing(); return;
    }
    _amSharing = true;
    var img = document.getElementById('faceImg');

    var tempName = parseInt((new Date()).getTime() / 1000);
    //var root = location.protocol + '//' + location.host + location.pathname;
    //var url = root + _params.toURL(pngukey) + "&" + tempName;
    var url = "http://FaceField.org/SynthFace.aspx?" + buildURLFromCoords();
    var fburl = url + "pngPath=" + img.src;
    var cleanFormula = "Synth Face";
    var pinterestDescription = encodeURIComponent("Synth Face\n");
    document.getElementById("shareTW").href = 'http://twitter.com/share?text=' + cleanFormula + '&url=' + encodeURIComponent(url);
    document.getElementById("shareFB").href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(fburl);
    document.getElementById("sharePI").href = "https://www.pinterest.com/pin/create/button/?url=" + encodeURIComponent(url)
        + "&media=" + encodeURIComponent(img.src)
        + "&description=" + pinterestDescription
    ;
    document.getElementById('modalBackground').style.display = 'block';
    var el = document.getElementById('ShareDiv');

    el.style.display = 'block';
    el.style.position = 'absolute';
    var top = img.offsetTop + img.parentElement.offsetTop;
    el.style.top = top + "px";
    var left = img.offsetLeft + img.parentElement.offsetLeft;
    el.style.left = left + "px";
    var width = img.width
    el.style.width = width + "px";
}

