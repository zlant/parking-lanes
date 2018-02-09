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

        var editorCheckBox = document.createElement('input');
        editorCheckBox.setAttribute('type', 'checkbox');
        editorCheckBox.setAttribute('id', 'editorcb');
        editorCheckBox.style.display = 'inline';
        editorCheckBox.style.verticalAlign = 'top';
        editorCheckBox.onchange = (ch) => {
            editorMode = !editorMode;
        };
        div.appendChild(editorCheckBox);


        var label = document.createElement('label');
        label.setAttribute('for', 'editorcb');
        label.innerText = 'Editor';
        label.style.display = 'inline';
        div.appendChild(label);

        var editors = document.createElement('span');
        editors.id = 'editors';
        editors.style.display = 'none';
        editors.innerHTML += ', <a id="josm-bbox" target="_blank">Josm</a>';
        editors.innerHTML += ', <a id="id-bbox" target="_blank">iD</a>';
        editors.innerHTML += ' | <a target="_blank" href="https://wiki.openstreetmap.org/wiki/Key:parking:lane">Tagging</a>';
        div.appendChild(editors);
        
        div.innerHTML += ' | <a target="_blank" href="https://github.com/zetx16/parking-lanes">GitHub</a>';

        div.onmouseenter = e => document.getElementById('editors').style.display = 'inline';
        div.onmouseleave = e => document.getElementById('editors').style.display = 'none';
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

//------------- Save control --------------------

L.Control.Save = L.Control.extend({
    onAdd: map => {
        var div = L.DomUtil.create('button', 'leaflet-control-layers control-padding');
        div.id = 'saveChangeset';
        div.innerText = 'Save';
        div.style.background = 'yellow';
        div.style.display = 'none';
        div.onclick = createChangset;
        return div;
    }
});

new L.Control.Save({ position: 'topright' }).addTo(map);

//------------- Auth control --------------------

L.Control.Auth = L.Control.extend({
    onAdd: map => {
        var div = L.DomUtil.create('button', 'leaflet-control-layers control-padding');
        div.id = 'auth';
        div.innerText = 'Auth';
        return div;
    }
});

new L.Control.Auth({ position: 'topright' }).addTo(map);

//----------------------------------------------------

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

var editorName = 'PLanes'
var version = '0.1'

var change = { osmChange: { $version: '0.6', $generator: 'Parking lane ' + version, modify: { way: [] } } };

var datetime = new Date();
document.getElementById('datetime-input').value =
    datetime.getFullYear() + '-' + (datetime.getMonth() + 1) + '-' + datetime.getDate() + ' ' +
    datetime.getHours() + ':' + datetime.getMinutes();

var urlOverpass = 'https://overpass-api.de/api/interpreter?data=';
var urlJosm = 'http://127.0.0.1:8111/import?url=';
var urlID = 'https://www.openstreetmap.org/edit?editor=id';

var useTestServer = true;
var urlOsmTest = useTestServer
    ? 'https://master.apis.dev.openstreetmap.org'
    : 'https://www.openstreetmap.org';

var lastBounds;

var editorMode = false;

var valuesLane = ['parallel', 'diagonal', 'perpendicular', 'no_parking', 'no_stopping', 'marked', 'fire_lane'];
var valuesCond = ['free', 'ticket', 'disc', 'residents', 'customers', 'private'];

// ------------- functions -------------------

function mapMoveEnd() {
    document.getElementById('josm-bbox').href = urlJosm + urlOverpass + getQueryHighways();
    document.getElementById('id-bbox').href = urlID + '#map=' +
        document.location.href.substring(document.location.href.indexOf('#') + 1);
    setLocationCookie();

    var newOffset = map.getZoom() < 15 ? 2 : offset;
    for (var lane in lanes) {
        if (lane === 'right' || lane === 'left')
            continue;
        var sideOffset = lanes[lane].options.offset > 0 ? 1 : -1;
        lanes[lane].setOffset(sideOffset * newOffset);
        lanes[lane].setStyle({ weight: (map.getZoom() < 15 ? 2 : 3) });
    }
    
    if (map.getZoom() < 15) {
        document.getElementById("info").style.display = 'block';
        return;
    }
    
    document.getElementById("info").style.display = 'none';

    if (withinLastBbox())
        return;

    lastBounds = map.getBounds();
    getContent(urlOsmTest + getQueryParkingLanes(), parseContent);
    //getContent(urlOverpass + encodeURIComponent(getQueryParkingLanes()), parseContent);
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

    for (var obj of Array.isArray(content.osm.node) ? content.osm.node : [content.osm.node] ) {
        nodes[obj.$id] = [obj.$lat, obj.$lon];
    }

    content.osm.way = Array.isArray(content.osm.way) ? content.osm.way : [content.osm.way];
    for (var obj of content.osm.way.filter(x => x.tag != undefined)) {
        if (!Array.isArray(obj.tag))
            obj.tag = [obj.tag];
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
    xhr.send();
}

function getConditions(side, tags) {
    var conditions = { intervals: [], default: null };
    var sides = ['both', side];

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

    var bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()].join(',');
    return '/api/0.6/map?bbox=' + bbox;

    //var bbox = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(',');
    //return '[out:xml];(way[~"^parking:lane:.*"~"."](' + bbox + ');>;);out meta;';
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

var tagsBlock = [
    "parking:lane:{side}",
    "parking:condition:{side}",
    "parking:condition:{side}:time_interval",
    "parking:condition:{side}:capacity"
];

function getPopupContent(osm) {
    setBacklight(osm);

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

    var checkBoth = document.createElement('input');
    checkBoth.setAttribute('type', 'checkbox');
    checkBoth.setAttribute('id', 'checkboth');
    checkBoth.onchange = (ch) => {
        if (ch.currentTarget.checked) {
            document.getElementById("right").style.display = 'none';
            document.getElementById("left").style.display = 'none';
            document.getElementById("both").style.display = 'block';
        } else {
            document.getElementById("right").style.display = 'block';
            document.getElementById("left").style.display = 'block';
            document.getElementById("both").style.display = 'none';
        }
    };
    form.appendChild(checkBoth);

    var label = document.createElement('label');
    label.setAttribute('for', 'checkboth');
    label.innerText = 'Both';
    form.appendChild(label);
    
    var regex = new RegExp('^parking:');
    var dl = document.createElement('dl');
    for (var side of ['both', 'right', 'left'].map(x => getTagsBlock(x, osm)))
        dl.appendChild(side);
    form.appendChild(dl);

    var submit = document.createElement('input');
    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'Apply');
    form.appendChild(submit);

    var cancel = document.createElement('input');
    cancel.setAttribute('type', 'reset');
    cancel.setAttribute('value', 'Cancel');
    form.appendChild(cancel);

    if ((chooseSideTags(form, 'right') || chooseSideTags(form, 'left')) || !chooseSideTags(form, 'both')) {
        form[0].checked = false;
        form.childNodes[2].childNodes[0].style.display = 'none';
        form.childNodes[2].childNodes[1].style.display = 'block';
        form.childNodes[2].childNodes[2].style.display = 'block';
    } else {
        form[0].checked = true;
        form.childNodes[2].childNodes[0].style.display = 'block';
        form.childNodes[2].childNodes[1].style.display = 'none';
        form.childNodes[2].childNodes[2].style.display = 'none';
    }


    var div = document.createElement('div');
    div.appendChild(head);
    div.appendChild(document.createElement('hr'));
    div.appendChild(form);

    return div;
}

function setBacklight(osm) {
    var polyline = lanes[osm.$id]
        ? lanes[osm.$id].getLatLngs()
        : lanes[-osm.$id].getLatLngs();

    var n = 3;

    lanes['right'] = L.polyline(polyline,
        {
            color: 'fuchsia',
            weight: offset * n - 4,
            offset: offset * n,
            opacity: 0.4
        })
        .addTo(map);

    lanes['left'] = L.polyline(polyline,
        {
            color: 'cyan',
            weight: offset * n - 4,
            offset: -offset * n,
            opacity: 0.4
        })
        .addTo(map);
}

function getTagsBlock(side, osm) {
    var div = document.createElement('div');
    div.setAttribute('id', side);

    var listValLane = document.createElement('datalist');
    listValLane.setAttribute('id', 'lanesList');
    listValLane.innerHTML = valuesLane.map(x => '<option value="' + x + '"></option>').join('');
    div.appendChild(listValLane);

    var listValCond = document.createElement('datalist');
    listValCond.setAttribute('id', 'condsList');
    listValCond.innerHTML = valuesCond.map(x => '<option value="' + x + '"></option>').join('');
    div.appendChild(listValCond);

    for (var tag of tagsBlock) {
        tag = tag.replace('{side}', side);

        var label = document.createElement('label');
        label.innerText = tag.replace('parking:', '');
        var dt = document.createElement('dt');
        dt.appendChild(label);
        
        var tagval = document.createElement('input');
        tagval.setAttribute('type', 'text');
        tagval.setAttribute('name', tag);
        if (tag == 'parking:lane:' + side)
            tagval.setAttribute('list', 'lanesList');
        else if (tag == 'parking:condition:' + side)
            tagval.setAttribute('list', 'condsList');
        var value = osm.tag.filter(x => x.$k === tag)[0];
        tagval.setAttribute('value', value != undefined ? value.$v : '');
        var dd = document.createElement('dd');
        dd.appendChild(tagval);

        div.appendChild(dt);
        div.appendChild(dd);
    }
    return div;
}

function chooseSideTags(form, side) {
    var regex = new RegExp('^parking:.*' + side);

    for (var input of form)
        if (regex.test(input.name) && input.value != '') 
            return true;
        
    return false;
}

function save(form) {
    var regex = new RegExp('^parking:');
    var osm = ways[form.target.id];
    osm.tag = osm.tag.filter(tag => !regex.test(tag.$k));

    for (var input of form.target)
        if (regex.test(input.name) && input.value != '') {
            osm.tag.push({ $k: input.name, $v: input.value })
        }

    delete osm.$user;
    delete osm.$uid;
    delete osm.$timestamp;

    var index = change.osmChange.modify.way.findIndex(x => x.$id == osm.$id);

    if (index > -1)
        change.osmChange.modify.way[index] = osm;
    else
        change.osmChange.modify.way.push(osm);

    document.getElementById('saveChangeset').style.display = 'block';

    return false;
}

function saveChangesets(changesetId) {
    for (var way of change.osmChange.modify.way)
        way.$changeset = changesetId;

    var path = '/api/0.6/changeset/' + changesetId + '/upload';
    var text = JXON.jsToString(change);

    auth.xhr({
        method: 'POST',
        path: path,
        options: { header: { 'Content-Type': 'text/xml' } },
        content: text
    }, function (err, details) {
        closeChangset(changesetId);
        });
}

function closeChangset(changesetId) {
    var path = '/api/0.6/changeset/' + changesetId + '/close';

    auth.xhr({
        method: 'PUT',
        options: { header: { 'Content-Type': 'text/xml' } },
        path: path
    }, function (err, details) {
        document.getElementById('saveChangeset').style.display = 'none';
    });
}
function createChangset() {
    var path = '/api/0.6/changeset/create';

    var change = {
        osm: {
            changeset: {
                tag: [
                    { $k: 'created_by', $v: editorName + ' ' + version },
                    { $k: 'comment', $v: 'Parking lanes' }]
            }
        }
    };

    var text = JXON.jsToString(change);

    auth.xhr({
        method: 'PUT',
        path: path,
        options: { header: { 'Content-Type': 'text/xml' } },
        content: text
    }, function (err, details) {
        if (!err)
            saveChangesets(details);
    });
}

var auth = useTestServer
    ? osmAuth({
        url: urlOsmTest,
        oauth_consumer_key: 'ZSneUbP6ZQROcwbTT09ihsUPeDPWnvj1PoRWEAsa',
        oauth_secret: 'BcqBWMzRzuYIRHGZqsS81nsD07h3pTjY3A4bbAQA',
        auto: true,
        singlepage: true
    })
    : osmAuth({
        url: urlOsmTest,
        oauth_consumer_key: '44puUDhiBVg8gzyXTVeUEwBaaOQvIaJaZk271cYy',
        oauth_secret: 'ryi5BcUVOIkgkcalQBQg4SQPjAHNqwiNlgpcrhAR',
        auto: true,
        singlepage: true
    });


document.getElementById('auth').onclick = function () {
    var getUserName = () =>
        auth.xhr({
            method: 'GET',
            path: '/api/0.6/user/details'
        }, function (err, details) {
            var user = JXON.xmlToJs(details);
            document.getElementById('auth').innerText = user.osm.user.$display_name;
        });
    
    if (auth.authenticated())
        getUserName();
    else
        auth.authenticate(getUserName);
};

function deleteBacklight() {
    lanes['right'].remove();
    lanes['left'].remove();
}

map.on('moveend', mapMoveEnd);
map.on('popupopen', e => e.popup.setContent(getPopupContent(e.popup.options.osm)));
map.on('popupclose', e => deleteBacklight());
mapMoveEnd();
