var map = L.map('map', { fadeAnimation: false });
var hash = new L.Hash(map);

if (document.location.href.indexOf('#') == -1)
    if (!setViewFromCookie())
        map.setView([51.591, 24.609], 5);

L.tileLayer.grayscale('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map);

L.control.locate({ drawCircle: false, drawMarker: false }).addTo(map);

//------------- GitHub control ------------------

L.Control.Link = L.Control.extend({
    onAdd: map => {
        var div = L.DomUtil.create('div', 'leaflet-control-layers control-padding');
        div.innerHTML = 'Edit:';
        div.innerHTML += ' <a id="josm-bbox" target="_blank">Josm</a>';
        div.innerHTML += ', <a id="id-bbox" target="_blank">iD</a>';
        div.innerHTML += ' | <a target="_blank" href="https://wiki.openstreetmap.org/wiki/Key:parking:lane">Tagging</a>';
        div.innerHTML += ' | <a target="_blank" href="https://github.com/zetx16/parking-lanes">GitHub</a>';
        return div;
    }
});

new L.Control.Link({ position: 'bottomright' }).addTo(map);

//------------- Legend control --------------------

L.Control.Legend = L.Control.extend({
    onAdd: map => {
        var div = L.DomUtil.create('div', 'leaflet-control-layers control-padding');
        div.innerHTML = "Legend";
        div.onmouseenter = setLegendBody;
        div.onmouseleave = setLegendHead;
        div.onclick = changeLegend;
        div.id = 'legend';
        return div;
    }
});

new L.Control.Legend({ position: 'bottomright' }).addTo(map);

function changeLegend(e) {
    if (this.onmouseenter == null) {
        setLegendHead(e);
        this.onmouseenter = setLegendBody;
        this.onmouseleave = setLegendHead;
    } else {
        setLegendBody(e);
        this.onmouseenter = this.onmouseleave = null;
    }
}

function setLegendBody(e) {
    e.currentTarget.innerHTML = legend
        .map(x => "<div class='legend-element' style='background-color:" + x.color + ";'></div> " + x.text)
        .join("<br />");
}

function setLegendHead(e) {
    e.currentTarget.innerHTML = "Legend";
}

//------------- Datetime control --------------------

L.Control.Datetime = L.Control.extend({
    onAdd: map => {
        var div = L.DomUtil.create('input', 'leaflet-control-layers control-padding');
        div.style.width = '115px';
        div.id = 'datetime-input';
        div.onmousedown = div.ondblclick = div.onpointerdown = L.DomEvent.stopPropagation;
        div.oninput = setDate;
        return div;
    }
});

new L.Control.Datetime({ position: 'topright' }).addTo(map);

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

// ---------------------------------------------

var osmstatic = `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6" generator="Overpass API 0.7.54.12 054bb0bb">
<note>The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.</note>
<meta osm_base="2018-01-23T17:47:02Z"/>
<node id="4301705340" changeset="69643" timestamp="2016-01-08T14:40:04Z" version="1" visible="true" user="Zverik" uid="221" lat="55.7965727" lon="49.1250105">
<tag k="historic" v="memorial"/>
<tag k="name" v="Памятник В.И. Ленину"/>
</node>
<node id="4301705355" changeset="69643" timestamp="2016-01-08T14:40:05Z" version="1" visible="true" user="Zverik" uid="221" lat="55.7912044" lon="49.1222602">
<tag k="historic" v="memorial"/>
<tag k="name" v="Памятник В.И. Ульянову-Ленину"/>
</node>
<node id="4301705402" changeset="69643" timestamp="2016-01-08T14:40:08Z" version="1" visible="true" user="Zverik" uid="221" lat="55.7910116" lon="49.1303252">
<tag k="historic" v="memorial"/>
<tag k="name" v="Памятник-бюст Ленину"/>
</node>
<node id="4307727993" changeset="109495" timestamp="2018-01-08T17:50:13Z" version="1" visible="true" user="acsd" uid="6277" lat="55.7879536" lon="49.1233323"/>
<node id="4307727994" changeset="109495" timestamp="2018-01-08T17:50:13Z" version="1" visible="true" user="acsd" uid="6277" lat="55.7883596" lon="49.1237711"/>
<node id="4307727995" changeset="109495" timestamp="2018-01-08T17:50:13Z" version="1" visible="true" user="acsd" uid="6277" lat="55.7898878" lon="49.1245002"/>
<node id="4307727996" changeset="109495" timestamp="2018-01-08T17:50:13Z" version="1" visible="true" user="acsd" uid="6277" lat="55.7924735" lon="49.1248956"/>
<node id="4307727997" changeset="109495" timestamp="2018-01-08T17:50:13Z" version="1" visible="true" user="acsd" uid="6277" lat="55.7944425" lon="49.1251198"/>
<node id="4307727998" changeset="109495" timestamp="2018-01-08T17:50:13Z" version="1" visible="true" user="acsd" uid="6277" lat="55.7940067" lon="49.1293788"/>
<node id="4307727999" changeset="109495" timestamp="2018-01-08T17:50:13Z" version="1" visible="true" user="acsd" uid="6277" lat="55.7949098" lon="49.1216080"/>
<node id="4307733510" changeset="109530" timestamp="2018-01-10T20:21:49Z" version="1" visible="true" user="acsd" uid="6277" lat="55.7877700" lon="49.1277900">
<tag k="test" v="testing"/>
</node>
<node id="4307742318" changeset="109557" timestamp="2018-01-11T15:52:11Z" version="1" visible="true" user="acsd" uid="6277" lat="55.7877700" lon="49.1277900">
<tag k="test" v="testing"/>
</node>
<node id="4307742382" changeset="109560" timestamp="2018-01-11T18:31:51Z" version="1" visible="true" user="acsd" uid="6277" lat="55.7897700" lon="49.1297900"/>
<node id="4307742383" changeset="109560" timestamp="2018-01-11T18:31:51Z" version="1" visible="true" user="acsd" uid="6277" lat="55.7807700" lon="49.1207900"/>
<way id="4304212395" changeset="109496" timestamp="2018-01-08T17:51:28Z" version="2" visible="true" user="acsd" uid="6277">
<nd ref="4307727993"/>
<nd ref="4307727994"/>
<nd ref="4307727995"/>
<nd ref="4307727996"/>
<nd ref="4307727997"/>
<tag k="highway" v="secondary"/>
<tag k="parking:condition:both" v="ticket"/>
<tag k="parking:lane:both" v="parallel"/>
</way>
<way id="4304212396" changeset="109496" timestamp="2018-01-08T17:51:28Z" version="2" visible="true" user="acsd" uid="6277">
<nd ref="4307727998"/>
<nd ref="4307727997"/>
<nd ref="4307727999"/>
<tag k="highway" v="tertiary"/>
<tag k="parking:lane:right" v="no_parking"/>
</way>

</osm>
`

var legend = [
    { condition: 'disc',        color: 'gold',          text: 'Disc'          },
    { condition: 'no_parking',  color: 'gold',          text: 'No parking'    },
    { condition: 'no_stopping', color: 'salmon',        text: 'No stopping'   },
    { condition: 'free',        color: 'limegreen',     text: 'Free parking'  },
    { condition: 'ticket',      color: 'dodgerblue',    text: 'Paid parking'  },
    { condition: 'customers',   color: 'greenyellow',   text: 'For customers' },
    { condition: 'residents',   color: 'hotpink',       text: 'For residents' }
];

var ways = {};
var lanes = {};
var offset = 6;

var version = '0.1'

var change = { osmChange: { $version: '0.6', $generator: 'Parking lane ' + version, modify: { way: [] } } };

var datetime = new Date();
document.getElementById('datetime-input').value =
    datetime.getFullYear() + '-' + (datetime.getMonth() + 1) + '-' + datetime.getDate() + ' ' +
    datetime.getHours() + ':' + datetime.getMinutes();

var urlOverpass = 'https://overpass-api.de/api/interpreter?data=';
var urlJosm = 'http://127.0.0.1:8111/import?url=';
var urlID = 'https://www.openstreetmap.org/edit?editor=id';

var lastBounds;

// ------------- functions -------------------

function mapMoveEnd() {
    document.getElementById('josm-bbox').href = urlJosm + urlOverpass + getQueryHighways();
    document.getElementById('id-bbox').href = urlID + '#map=' +
        document.location.href.substring(document.location.href.indexOf('#') + 1);
    setLocationCookie();

    var newOffset = map.getZoom() < 15 ? 2 : offset;
    for (var lane in lanes) {
        var sideOffset = lanes[lane].options.offset > 0 ? 1 : -1;
        lanes[lane].setOffset(sideOffset * newOffset);
        lanes[lane].setStyle({ weight: (map.getZoom() < 15 ? 2 : 3) });
    }
    
    if (map.getZoom() < 15) {
        document.getElementById("info").style.visibility = 'visible';
        return;
    }
    
    document.getElementById("info").style.visibility = 'hidden';

    if (withinLastBbox())
        return;

    lastBounds = map.getBounds();
    getContent(urlOverpass + encodeURIComponent(getQueryParkingLanes()), parseContent);
}

function withinLastBbox()
{
    if (lastBounds == undefined)
        return false;

    var bounds = map.getBounds();
    return bounds.getWest() > lastBounds.getWest() && bounds.getSouth() > lastBounds.getSouth() &&
        bounds.getEast() < lastBounds.getEast() && bounds.getNorth() < lastBounds.getNorth();
}

function parseContent(content) {
    var nodes = {};

    for (var obj of content.osm.node) {
        nodes[obj.$id] = [obj.$lat, obj.$lon];
    }

    for (var obj of content.osm.way) {
        if (lanes[obj.$id.toString()] || lanes['-'+obj.$id])
            continue;

        ways[obj.$id] = obj;

        var polyline = obj.nd.map(x => nodes[x.$ref]);

        for (var side of ['right', 'left']) {
            var conditions = getConditions(side, obj.tag);
            if (conditions.default != null)
                addLane(polyline, conditions, side, obj, offset);
        }
    }
}

function setLocationCookie() {
    var center = map.getCenter();
    var date = new Date(new Date().getTime() + 10 * 365 * 24 * 60 * 60 * 1000);
    document.cookie = 'location=' + map.getZoom() + '/' + center.lat + '/' + center.lng + '; expires=' + date;
}

function setViewFromCookie() {
    var location = document.cookie.split('; ').find((e, i, a) => e.startsWith('location='));
    if (location == undefined)
        return false;
    location = location.split('=')[1].split('/');

    map.setView([location[1], location[2]], location[0]);
    return true;
}

function setDate() {
    datetime = new Date(document.getElementById('datetime-input').value);
    redraw();
}

function redraw() {
    for (var lane in lanes)
        lanes[lane].setStyle({ color: getColorByDate(lanes[lane].options.conditions) });
}

function getContent(url, callback)
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = () => callback(JXON.stringToJs(xhr.responseText));
    //xhr.send();
    callback(JXON.stringToJs(osmstatic));
}

function getConditions(side, tags) {
    var conditions = { intervals: [], default: null };
    var sides = [side, 'both'];

    var defaultTags = sides.map(side => 'parking:condition:' + side + ':default')
        .concat(sides.map(side => 'parking:lane:' + side));

    var findResult;
    for (var tag of defaultTags) {
        findResult = tags.find(x => x.$k == tag);
        if (findResult)
            conditions.default = findResult.$v;
        if (conditions.default)
            break;
    }

    for (var i = 1; i < 10; i++) {
        var index = i > 1 ? ':' + i : '';

        var conditionTags = sides.map(side => 'parking:condition:' + side + index);
        var intervalTags = sides.map(side => 'parking:condition:' + side + index + ':time_interval');

        var cond = {};

        for (var j = 0; j < sides.length; j++) {
            findResult = tags.find(x => x.$k == conditionTags[j]);
            if (findResult)
                cond.condition = findResult.$v;
            findResult = tags.find(x => x.$k == intervalTags[j]);
            if (findResult)
                cond.interval = new opening_hours(findResult.$v, null, 0);
        }

        if (i == 1 && cond.interval == undefined) {
            if ('condition' in cond)
                conditions.default = cond.condition;
            break;
        }

        if ('condition' in cond)
            conditions.intervals[i - 1] = cond;
        else
            break;
    }
    
    return conditions;
}

function addLane(line, conditions, side, osm, offset) {
    lanes[side == 'right' ? osm.$id.toString() : ('-' + osm.$id)] = L.polyline(line,
        {
            color: getColorByDate(conditions),
            weight: 3,
            offset: side == 'right' ? offset : -offset,
            conditions: conditions,
            osm: osm
        })
        .addTo(map)
        .bindPopup('', { osm: osm });
}

function getColor(condition) {
    for (var element of legend)
        if (condition == element.condition)
            return element.color;
}

function getColorByDate(conditions) {
    for (var interval of conditions.intervals)
        if (interval.interval.getState(datetime))
            return getColor(interval.condition);
    return getColor(conditions.default);
}

function getQueryParkingLanes() {
    var bounds = map.getBounds();
    var bbox = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(',');
    return '[out:xml];(way[~"^parking:lane:.*"~"."](' + bbox + ');>;);out meta;';
}

function getQueryHighways() {
    var bounds = map.getBounds();
    var bbox = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(',');
    var tag = 'highway~"^motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street"';
    return '[out:xml];(way[' + tag + '](' + bbox + ');>;way[' + tag + '](' + bbox + ');<;);out meta;';
}

function getQueryOsmId(id) {
    return '[out:xml];(way(id:' + id + ');>;way(id:' + id + ');<;);out meta;';
}

function getPopupContent(osm) {
    var head = document.createElement('div');
    head.setAttribute('style', 'min-width:250px');

    var linkOsm = document.createElement('a');
    linkOsm.setAttribute('target', '_blank');
    linkOsm.setAttribute('href', 'https://openstreetmap.org/way/' + osm.$id);
    linkOsm.innerText = 'View in OSM';
    head.appendChild(linkOsm);

    var editorBlock = document.createElement('span');
    editorBlock.setAttribute('style', 'float:right');
    editorBlock.innerText = 'Edit: ';

    var linkJosm = document.createElement('a');
    linkJosm.setAttribute('target', '_blank');
    linkJosm.setAttribute('href', urlJosm + urlOverpass + getQueryOsmId(osm.$id));
    linkJosm.innerText = 'Josm';
    editorBlock.appendChild(linkJosm);
    editorBlock.innerHTML += ', ';

    var linkID = document.createElement('a');
    linkID.setAttribute('target', '_blank');
    linkID.setAttribute('href', urlID + '&way=' + osm.$id);
    linkID.innerText = 'iD';
    editorBlock.appendChild(linkID);

    head.appendChild(editorBlock);

    var form = document.createElement("form");
    form.setAttribute('id', osm.$id);
    form.onsubmit = save;
    
    var regex = new RegExp('^parking:');
    var tagsText = [];
    var dl = document.createElement('dl');
    for (var tag of osm.tag)
        if (regex.test(tag.$k)) {

            var label = document.createElement('label');
            label.innerText = tag.$k;
            var dt = document.createElement('dt');
            dt.appendChild(label);

            var tagval = document.createElement('input');
            tagval.setAttribute('type', 'text');
            tagval.setAttribute('name', tag.$k);
            tagval.setAttribute('value', tag.$v);
            var dd = document.createElement('dd');
            dd.appendChild(tagval);

            dl.appendChild(dt);
            dl.appendChild(dd);
        }
    form.appendChild(dl);

    var submit = document.createElement('input');
    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'Save');
    form.appendChild(submit);

    var cancel = document.createElement('input');
    cancel.setAttribute('type', 'reset');
    cancel.setAttribute('value', 'Cancel');
    form.appendChild(cancel);

    var div = document.createElement('div');
    div.appendChild(head);
    div.appendChild(document.createElement('hr'));
    div.appendChild(form);

    return div;
}

function save(form) {
    var regex = new RegExp('^parking:');
    var osm = ways[form.target.id];
    osm.tag = osm.tag.filter(tag => !regex.test(tag.$k));

    for (var input of form.target)
        if (input.value != '') {
            osm.tag.push({ $k: input.name, $v: input.value })
        }

    delete osm.$user;
    delete osm.$uid;
    delete osm.$timestamp;

    change.osmChange.modify.way.push(osm);
    document.getElementById(osm.$id).innerText = JXON.jsToString(change);
}


map.on('moveend', mapMoveEnd);
map.on('popupopen', e => e.popup.setContent(getPopupContent(e.popup.options.osm)));
mapMoveEnd();
