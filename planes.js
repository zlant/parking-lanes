var map = L.map('map', { fadeAnimation: false });
var hash = new L.Hash(map);

if (document.location.href.indexOf('#') == -1)
    map.setView([51.591, 24.609], 5);

L.tileLayer.grayscale('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map);

//------------- Legend control --------------------

L.Control.Legend = L.Control.extend({
    onAdd: map => {
        var div = L.DomUtil.create('div', 'leaflet-control-layers control-padding');
        div.innerHTML = "Legend";
        div.setAttribute("onmouseenter", "showDisclaimer()");
        div.setAttribute("onmouseleave", "hideDisclaimer()");
        div.id = 'legend';
        return div;
    }
});

new L.Control.Legend({ position: 'bottomright' }).addTo(map);

function hideDisclaimer() {
    document.getElementById("legend").innerHTML = "Legend";
}

function showDisclaimer() {
    document.getElementById("legend").innerHTML = legend
        .map(x => "<div class='legend-element' style='background-color:" + x.color + ";'></div> " + x.text)
        .join("<br />");
}

//------------- GitHub control ------------------

L.Control.Link = L.Control.extend({
    onAdd: map => {
        var div = L.DomUtil.create('div', 'leaflet-control-layers control-padding');
        div.innerHTML = '<a target="_blank" href="https://github.com/zetx16/parking-lanes">GitHub</a>';
        return div;
    }
});

new L.Control.Link({ position: 'topright' }).addTo(map);

//------------- Info control --------------------

L.Control.Info = L.Control.extend({
    onAdd: map => {
        var div = L.DomUtil.create('div', 'leaflet-control-layers control-padding');
        div.innerHTML = 'Zoom in on the map.';
        div.id = 'info';
        return div;
    }
});

new L.Control.Info({ position: 'topright' }).addTo(map);

// --------------------

var legend = [
    { condition: 'no_parking',  color: 'darkorange',    text: 'No parking'    },
    { condition: 'no_stopping', color: 'salmon',        text: 'No stopping'   },
    { condition: 'free',        color: 'limegreen',     text: 'Free parking'  },
    { condition: 'ticket',      color: 'dodgerblue',    text: 'Paid parking'  },
    { condition: 'customers',   color: 'greenyellow',   text: 'For customers' },
    { condition: 'residents',   color: 'hotpink',       text: 'For residents' }
];

var lanes = {};
var offset = 6;

function drawLanes() {
    if (map.getZoom() < 15) {
        document.getElementById("info").style.visibility = 'visible';
        return;
    }

    document.getElementById("info").style.visibility = 'hidden';
    
    getContent('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(getQuery()), function (x) {
        var nodes = {};

        for (var obj of x.elements) {
            if (obj.type == 'node')
                nodes[obj.id] = [obj.lat, obj.lon];

            if (obj.type == 'way') {
                if (lanes[obj.id])
                    continue;

                var polyline = obj.nodes.map(x => nodes[x]);

                for (var side of ['right', 'left']) {
                    var condition = getCondition(side, obj.tags);
                    if (condition != null)
                        addLane(polyline, condition, side, obj, offset);
                }
            }
        }
    });
}

function getContent(url, callback)
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = () => callback(JSON.parse(xhr.responseText));
    xhr.send();
}

function getCondition(side, tags) {
    var conditionRegex = new RegExp('^parking:condition:(' + side + '|both)$');
    var laneRegex = new RegExp('^parking:lane:(' + side + '|both)$');

    for (var tag in tags)
        if (conditionRegex.test(tag) || laneRegex.test(tag))
            return tags[tag];

    return null;
}

function getConditions(side, tags) {
    var conditions = { intervals: [] };
   
    var laneRegex = new RegExp('^parking:lane:(' + side + '|both)$');
    var defaultRegex = new RegExp('^parking:condition:(' + side + '|both):default$');
    
    for (var tag in tags) {
        if (laneRegex.test(tag))
            conditions.default = tags[tag];
        else if (defaultRegex.test(tag)) {
            conditions.default = tags[tag];
            break;
        }
    }

    for (var i = 1; i < 10; i++) {
        var index = i > 1 ? ':' + i : '';

        var conditionRegex = new RegExp('^parking:condition:(' + side + '|both)' + index + '$');
        var intervalRegex = new RegExp('^parking:condition:(' + side + '|both)' + index + ':time_interval$');

        cond = {};

        for (var tag in tags) {
            if (conditionRegex.test(tag))
                cond.condition = tags[tag];
            else if (intervalRegex.test(tag))
                cond.interval = tags[tag];
        }

        if (i == 1 && cond.interval == undefined) {
            if (cond.condition != undefined)
                conditions.default = cond.condition;
            break;
        }

        if (cond.condition != undefined)
            conditions.intervals[i - 1] = cond;
        else
            break;
    }
    
    return conditions;
}

function addLane(line, condition, side, osm, offset) {
    lanes[side == 'right' ? osm.id : -osm.id] = L.polyline(line,
        {
            color: getColour(condition),
            weight: 3,
            offset: side == 'right' ? offset : -offset,
            conditions: getConditions(side, osm.tags),
            osm: osm
        })
        .addTo(map)
        .bindPopup('', { conditions: getConditions(side, osm.tags), osm: osm });
}

function getColour(condition) {
    for (var element of legend)
        if (condition == element.condition)
            return element.color;
}

function getQuery() {
    var bounds = map.getBounds();
    var bbox = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(',');
    return '[out:json];(way[~"^parking:lane:.*"~"."](' + bbox + ');>;);out body;';
}

function getPopupContent(options) {
    var regex = new RegExp('^parking:');
    var result = '';

    result += options.conditions.default + ' = default<br />';
    
    for (var interval of options.conditions.intervals)
        result += interval.condition + ' = ' + interval.interval + '<br />';

    result += '<hr>';

    for (var tag in options.osm.tags)
        if (regex.test(tag))
            result += tag + ' = ' + options.osm.tags[tag] + '<br />';
        
    return result;
}


map.on('moveend', drawLanes);
map.on('popupopen', e => e.popup.setContent(getPopupContent(e.popup.options)));
drawLanes();
