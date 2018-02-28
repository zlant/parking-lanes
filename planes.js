var map = L.map('map', { fadeAnimation: false });
var hash = new L.Hash(map);

if (document.location.href.indexOf('#') == -1)
    if (!setViewFromCookie())
        map.setView([51.591, 24.609], 5);

L.tileLayer.grayscale('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map);

L.control.locate({ drawCircle: false, drawMarker: true }).addTo(map);

//------------- GitHub control ------------------

L.Control.Link = L.Control.extend({
    onAdd: map => {
        var div = L.DomUtil.create('div', 'leaflet-control-layers control-padding control-bigfont');

        var editors = document.createElement('span');
        editors.id = 'editors';
        editors.style.display = 'none';
        editors.innerHTML += '<a target="_blank" href="https://wiki.openstreetmap.org/wiki/Key:parking:lane">Tagging</a>';
        editors.innerHTML += ' | <a id="id-bbox" target="_blank">iD</a>, ';
        editors.innerHTML += '<a id="josm-bbox" target="_blank">Josm</a>, ';
        div.appendChild(editors);

        var editorActivation = document.createElement('span');
        editorActivation.id = 'editorActive';
        
        var editorCheckBox = document.createElement('input');
        editorCheckBox.setAttribute('type', 'checkbox');
        editorCheckBox.setAttribute('id', 'editorcb');
        editorCheckBox.style.display = 'inline';
        editorCheckBox.style.verticalAlign = 'top';
        editorActivation.appendChild(editorCheckBox);


        var label = document.createElement('label');
        label.setAttribute('for', 'editorcb');
        label.innerText = 'Editor';
        label.style.display = 'inline';
        editorActivation.appendChild(label);

        div.appendChild(editorActivation);
        
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
        var div = L.DomUtil.create('div', 'leaflet-control-layers control-padding control-bigfont');
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
        var div = L.DomUtil.create('input', 'leaflet-control-layers control-padding control-bigfont');
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
        var div = L.DomUtil.create('div', 'leaflet-control-layers control-padding control-bigfont');
        div.innerHTML = 'Zoom in on the map.';
        div.id = 'info';
        div.onclick = () => map.setZoom(viewMinZoom);
        return div;
    }
});

new L.Control.Info({ position: 'topright' }).addTo(map);

//------------- Save control --------------------

L.Control.Save = L.Control.extend({
    onAdd: map => {
        var div = L.DomUtil.create('button', 'leaflet-control-layers control-padding control-bigfont');
        div.id = 'saveChangeset';
        div.innerText = 'Save';
        div.style.background = 'yellow';
        div.style.display = 'none';
        div.onclick = createChangset;
        return div;
    }
});

new L.Control.Save({ position: 'topright' }).addTo(map);

//------------- LaneInfo control --------------------

L.Control.LaneInfo = L.Control.extend({
    onAdd: map => {
        var div = L.DomUtil.create('div', 'leaflet-control-layers control-padding');
        div.id = 'laneinfo';
        div.onclick = div.onpointerdown = div.onmousedown = div.ondblclick = L.DomEvent.stopPropagation;
        div.style.display = 'none';
        return div;
    }
});

new L.Control.LaneInfo({ position: 'topright' }).addTo(map);

//----------------------------------------------------

var ways = {};
var lanes = {};
var offsetMajor = 6;
var weightMajor = 3;
var offsetMinor = 6;
var weightMinor = 3;

var change = { osmChange: { $version: '0.6', $generator: 'Parking lane ' + version, modify: { way: [] } } };

var datetime = new Date();
document.getElementById('datetime-input').value =
    datetime.getFullYear() + '-' + (datetime.getMonth() + 1) + '-' + datetime.getDate() + ' ' +
    datetime.getHours() + ':' + datetime.getMinutes();

var lastBounds;

var editorMode = false;
var saving = false;

var viewMinZoom = 15;

// ------------- functions -------------------

document.getElementById('editorcb').onchange = (chb) => {

    var checkAuth = function (err) {
        if (err) {
            document.getElementById('editorActive').style.color = 'red';
            auth.authenticate(checkAuth);
        }
        else {
            editorMode = true;
            document.getElementById('editorActive').style.color = 'green';
            lastBounds = undefined;
            mapMoveEnd();
        }
    };

    if (chb.currentTarget.checked)
        auth.authenticate(checkAuth);
    else {
        editorMode = false;
        document.getElementById('editorActive').style.color = 'black';
        for (var lane in lanes)
            if (lane.startsWith('empty')) {
                lanes[lane].remove();
                delete lanes[lane];
            }
    }
};

function mapMoveEnd() {
    document.getElementById('josm-bbox').href = urlJosm + urlOverpass + getQueryHighways();
    document.getElementById('id-bbox').href = urlID + '#map=' +
        document.location.href.substring(document.location.href.indexOf('#') + 1);
    setLocationCookie();
    
    var zoom = map.getZoom();

    if (zoom <= 12) {
        offsetMajor = 1;
        weightMajor = 1;
        offsetMinor = 0.5;
        weightMinor = 0.5;
    } else if (zoom >= 13 && zoom <= 14) {
        offsetMajor = 1.5;
        weightMajor = 1.5;
        offsetMinor = 1;
        weightMinor = 1;
    } else if (zoom == 15) {
        offsetMajor = 3;
        weightMajor = 2;
        offsetMinor = 1.25;
        weightMinor = 1.25;
    } else if (zoom == 16) {
        offsetMajor = 5;
        weightMajor = 3;
        offsetMinor = 2;
        weightMinor = 1.5;
    } else if (zoom == 17) {
        offsetMajor = 7;
        weightMajor = 3;
        offsetMinor = 3;
        weightMinor = 1.5;
    } else if (zoom >= 18) {
        offsetMajor = 8;
        weightMajor = 3;
        offsetMinor = 3;
        weightMinor = 2;
    }

    for (var lane in lanes) {
        if (lane === 'right' || lane === 'left' || lane.startsWith('empty'))
            continue;
        var sideOffset = lanes[lane].options.offset > 0 ? 1 : -1;
        var isMajor = lanes[lane].options.isMajor;
        lanes[lane].setOffset(sideOffset * (isMajor ? offsetMajor : offsetMinor));
        lanes[lane].setStyle({ weight: (isMajor ? weightMajor : weightMinor) });
    }

    if (map.getZoom() < viewMinZoom) {
        document.getElementById("info").style.display = 'block';
        return;
    }

    document.getElementById("info").style.display = 'none';

    if (withinLastBbox())
        return;

    lastBounds = map.getBounds();
    if (useTestServer)
        getContent(urlOsmTest + getQueryParkingLanes(), parseContent);
    else
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
    var regex = new RegExp('^motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street');

    for (var obj of Array.isArray(content.osm.node) ? content.osm.node : [content.osm.node] ) {
        nodes[obj.$id] = [obj.$lat, obj.$lon];
    }

    content.osm.way = Array.isArray(content.osm.way) ? content.osm.way : [content.osm.way];
    for (var obj of content.osm.way.filter(x => x.tag != undefined)) {
        if (!Array.isArray(obj.tag))
            obj.tag = [obj.tag];
        if (lanes[obj.$id.toString()] || lanes['-' + obj.$id] || lanes['empty' + obj.$id])
            continue;

        var isMajor = wayIsMajor(obj.tag);

        if (typeof isMajor !== 'boolean')
            continue;

        ways[obj.$id] = obj;

        var polyline = obj.nd.map(x => nodes[x.$ref]);
        var emptyway = true;

        for (var side of ['right', 'left']) {
            var conditions = getConditions(side, obj.tag);
            if (conditions.default != null || conditions.intervals.length > 0) {
                addLane(polyline, conditions, side, obj, isMajor ? offsetMajor : offsetMinor, isMajor);
                emptyway = false;
            }
        }
        if (editorMode && emptyway && obj.tag.filter(x => x.$k == 'highway' && regex.test(x.$v)).length > 0)
            addLane(polyline, null, 'right', obj, 0, isMajor);
    }
}

function wayIsMajor(tags)
{
    var findResult = tags.find(x => x.$k == 'highway');
    if (findResult) {
        if (findResult.$v.search(/^motorway|trunk|primary|secondary|tertiary|unclassified|residential/) >= 0)
            return true;
        else
            return false;
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

        var laneTags = sides.map(side => 'parking:lane:' + side + index);
        var conditionTags = sides.map(side => 'parking:condition:' + side + index);
        var intervalTags = sides.map(side => 'parking:condition:' + side + index + ':time_interval');

        var cond = {};

        for (var j = 0; j < sides.length; j++) {
            findResult = tags.find(x => x.$k == laneTags[j]);
            if (findResult && legend.findIndex(x => x.condition === findResult.$v) >= 0)
                cond.condition = findResult.$v;
            findResult = tags.find(x => x.$k == conditionTags[j]);
            if (findResult)
                cond.condition = findResult.$v;
            findResult = tags.find(x => x.$k == intervalTags[j]);
            if (findResult)
                cond.interval = !/\d+-\d+\/\d+$/.test(findResult.$v)
                    ? new opening_hours(findResult.$v, null, 0)
                    : parseInt(findResult.$v.match(/\d+/g)[0]) % 2 == 0
                        ? 'even'
                        : 'odd';
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

    if (legend.findIndex(x => x.condition === conditions.default) == -1)
        conditions.default = null;
    
    return conditions;
}

function addLane(line, conditions, side, osm, offset, isMajor) {
    var id = !conditions
        ? 'empty' + osm.$id
        : side == 'right'
            ? osm.$id
            : -osm.$id;

    lanes[id] = L.polyline(line,
        {
            color: getColorByDate(conditions),
            weight: isMajor ? weightMajor : weightMinor,
            offset: side == 'right' ? offset : -offset,
            conditions: conditions,
            osm: osm,
            isMajor: isMajor
        })
        .on('click', showLaneInfo)
        .addTo(map);
}

function showLaneInfo(e) {
    closeLaneInfo(e);
    var laneinfo = document.getElementById('laneinfo');
    laneinfo.appendChild(getLaneInfoPanelContent(e.target.options.osm));
    laneinfo.style.display = 'block';
    map.originalEvent.preventDefault();
}

function getColor(condition) {
    for (var element of legend)
        if (condition == element.condition)
            return element.color;
}

function getColorByDate(conditions) {
    if (!conditions)
        return 'black';
    for (var interval of conditions.intervals)
        if (interval.interval == 'even' || interval.interval == 'odd') {
            if ((interval.interval == 'even' && datetime.getDate() % 2 == 0) ||
                (interval.interval == 'odd' && datetime.getDate() % 2 == 1))
                return getColor(interval.condition);
        } else if (interval.interval && interval.interval.getState(datetime))
            return getColor(interval.condition);
    return getColor(conditions.default);
}

function getQueryParkingLanes() {
    var bounds = map.getBounds();
    if (useTestServer) {
        var bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()].join(',');
        return '/api/0.6/map?bbox=' + bbox;
    } else {
        var bbox = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(',');
        return editorMode
            ? '[out:xml];(way[highway~"^motorway|trunk|primary|secondary|tertiary|unclassified|residential|service|living_street"](' + bbox + ');>;);out meta;'
            : '[out:xml];(way[~"^parking:lane:.*"~"."](' + bbox + ');>;);out meta;';
    }
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
    "parking:condition:{side}:default",
    "parking:condition:{side}:capacity"
];

function getLaneInfoPanelContent(osm) {
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

    //if (true) {
    if (editorMode) {
        var form = document.createElement("form");
        form.setAttribute('id', osm.$id);
        form.onsubmit = (e) => {
            save(e);
            closeLaneInfo();
        };
        //form.onreset = removeFromOsmChangeset;

        var checkBoth = document.createElement('input');
        checkBoth.style.display = 'inline';
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
        label.style.display = 'inline';
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
        cancel.onclick =  () => removeFromOsmChangeset(osm.$id);
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
        div.id = 'infoContent';
        div.appendChild(head);
        div.appendChild(document.createElement('hr'));
        div.appendChild(form);

        var result = document.createElement('div');
        result.appendChild(div);

        return div;
    }
    else {
        var getTagsBlockForViewer = function (tags, side) {
            var regex = new RegExp('^parking:.*(?:'+side+'|both)');

            var tagsBlock = document.createElement('div');
            tagsBlock.id = side;

            tagsBlock.innerHTML = tags.filter(tag => regex.test(tag.$k))
                .map(tag => tag.$k + ' = ' + tag.$v)
                .join('<br />');

            return tagsBlock;
        }

        var div = document.createElement('div');
        div.id = 'infoContent';
        div.appendChild(head);
        div.appendChild(document.createElement('hr'));
        div.appendChild(getTagsBlockForViewer(osm.tag, 'right'));
        div.appendChild(getTagsBlockForViewer(osm.tag, 'left'));

        return div;
    }
}

function setBacklight(osm) {
    var polyline = lanes[osm.$id]
        ? lanes[osm.$id].getLatLngs()
        : lanes[-osm.$id]
            ? lanes[-osm.$id].getLatLngs()
            : lanes['empty' + osm.$id].getLatLngs();

    var n = 3;

    lanes['right'] = L.polyline(polyline,
        {
            color: 'fuchsia',
            weight: offsetMajor * n - 4,
            offset: offsetMajor * n,
            opacity: 0.4
        })
        .addTo(map);

    lanes['left'] = L.polyline(polyline,
        {
            color: 'cyan',
            weight: offsetMajor * n - 4,
            offset: -offsetMajor * n,
            opacity: 0.4
        })
        .addTo(map);
}

function getTagsBlock(side, osm) {
    var div = document.createElement('div');
    div.setAttribute('id', side);
    /*
    var listValLane = document.createElement('datalist');
    listValLane.setAttribute('id', 'lanesList');
    listValLane.innerHTML = valuesLane.map(x => '<option value="' + x + '"></option>').join('');
    div.appendChild(listValLane);

    var listValCond = document.createElement('datalist');
    listValCond.setAttribute('id', 'condsList');
    listValCond.innerHTML = valuesCond.map(x => '<option value="' + x + '"></option>').join('');
    div.appendChild(listValCond);
    */
    var hideDefault = false;
    var regexTimeInt = new RegExp('parking:condition:.+:time_interval');
    var regexDefault = new RegExp('parking:condition:.+:default');

    var sign = document.createElement('img');
    sign.src = 'https://upload.wikimedia.org/wikipedia/commons/9/98/3.27_Russian_road_sign.svg';
    sign.height = 20;
    sign.width = 20;
    sign.className = 'sign';
    sign.onclick = () => {
        document.getElementById(osm.$id)['parking:lane:' + side].value = 'no_stopping';
        document.getElementById(osm.$id)['parking:condition:' + side].value = '';
        document.getElementById(osm.$id)['parking:condition:' + side + ':time_interval'].value = '';
        document.getElementById(osm.$id)['parking:condition:' + side + ':default'].value = '';
        document.getElementById(osm.$id)['parking:lane:' + side].onchange();
    };
    div.appendChild(sign);

    var sign = document.createElement('img');
    sign.src = 'https://upload.wikimedia.org/wikipedia/commons/8/81/3.28_Russian_road_sign.svg';
    sign.height = 20;
    sign.width = 20;
    sign.className = 'sign';
    sign.onclick = () => {
        document.getElementById(osm.$id)['parking:lane:' + side].value = 'no_parking';
        document.getElementById(osm.$id)['parking:condition:' + side].value = '';
        document.getElementById(osm.$id)['parking:condition:' + side + ':time_interval'].value = '';
        document.getElementById(osm.$id)['parking:condition:' + side + ':default'].value = '';
        document.getElementById(osm.$id)['parking:lane:' + side].onchange();
    };
    div.appendChild(sign);

    var sign = document.createElement('img');
    sign.src = 'https://upload.wikimedia.org/wikipedia/commons/f/f4/3.29_Russian_road_sign.svg';
    sign.height = 20;
    sign.width = 20;
    sign.className = 'sign';
    sign.onclick = () => {
        document.getElementById(osm.$id)['parking:lane:' + side].value = 'no_parking';
        document.getElementById(osm.$id)['parking:condition:' + side + ':time_interval'].value = '1-31/2';
        document.getElementById(osm.$id)['parking:condition:' + side].value = '';
        document.getElementById(osm.$id)['parking:condition:' + side + ':default'].value = '';
        document.getElementById(osm.$id)['parking:lane:' + side].onchange();
    };
    div.appendChild(sign);

    var sign = document.createElement('img');
    sign.src = 'https://upload.wikimedia.org/wikipedia/commons/7/76/3.30_Russian_road_sign.svg';
    sign.height = 20;
    sign.width = 20;
    sign.className = 'sign';
    sign.onclick = () => {
        document.getElementById(osm.$id)['parking:lane:' + side].value = 'no_parking';
        document.getElementById(osm.$id)['parking:condition:' + side + ':time_interval'].value = '2-30/2';
        document.getElementById(osm.$id)['parking:condition:' + side].value = '';
        document.getElementById(osm.$id)['parking:condition:' + side + ':default'].value = '';
        document.getElementById(osm.$id)['parking:lane:' + side].onchange();
    };
    div.appendChild(sign);

    var sign = document.createElement('img');
    sign.src = 'https://upload.wikimedia.org/wikipedia/commons/e/eb/6.4_Russian_road_sign.svg';
    sign.height = 20;
    sign.width = 20;
    sign.className = 'sign';
    sign.onclick = () => {
        document.getElementById(osm.$id)['parking:lane:' + side].value = '';
        document.getElementById(osm.$id)['parking:condition:' + side + ':time_interval'].value = '';
        document.getElementById(osm.$id)['parking:condition:' + side].value = 'free';
        document.getElementById(osm.$id)['parking:condition:' + side + ':default'].value = '';
        document.getElementById(osm.$id)['parking:lane:' + side].onchange();
    };
    div.appendChild(sign);

    var sign = document.createElement('img');
    sign.src = 'https://upload.wikimedia.org/wikipedia/commons/f/f3/8.8_Russian_road_sign.svg';
    sign.height = 20;
    sign.width = 40;
    sign.className = 'sign';
    sign.onclick = () => {
        document.getElementById(osm.$id)['parking:lane:' + side].value = '';
        document.getElementById(osm.$id)['parking:condition:' + side + ':time_interval'].value = '';
        document.getElementById(osm.$id)['parking:condition:' + side].value = 'ticket';
        document.getElementById(osm.$id)['parking:condition:' + side + ':default'].value = '';
        document.getElementById(osm.$id)['parking:lane:' + side].onchange();
    };
    div.appendChild(sign);

    var table = document.createElement('table');

    for (var tag of tagsBlock) {
        tag = tag.replace('{side}', side);

        var label = document.createElement('label');
        var tagSplit = tag.split(':');
        label.innerText = tagSplit[Math.floor(tagSplit.length / 2) * 2 - 1];
        var inputdiv = document.createElement('tr');
        inputdiv.id = tag;
        var dt = document.createElement('td');
        dt.appendChild(label);

        var value = osm.tag.filter(x => x.$k === tag)[0];
        var tagval;

        if (tag == 'parking:lane:' + side) {
            tagval = document.createElement('select');
            var additVals = value && valuesLane.indexOf(value.$v) == -1 ? ['', value.$v] : [''];

            for (var x of additVals.concat(valuesLane)) {
                var option = document.createElement('option');
                option.value = x;
                option.innerText = x;
                if (value && value.$v === x)
                    option.setAttribute('selected', 'selected');
                tagval.appendChild(option);
            }
            tagval.setAttribute('name', tag);
        }
        else if (tag == 'parking:condition:' + side) {
            tagval = document.createElement('select');
            var additVals = value && valuesCond.indexOf(value.$v) == -1 ? ['', value.$v] : [''];

            for (var x of additVals.concat(valuesCond)) {
                var option = document.createElement('option');
                option.value = x;
                option.innerText = x;
                if (value && value.$v === x)
                    option.setAttribute('selected', 'selected');
                tagval.appendChild(option);
            }
            tagval.setAttribute('name', tag);
        }
        else {
            tagval = document.createElement('input');
            tagval.setAttribute('type', 'text');
            tagval.setAttribute('placeholder', tag);
            tagval.setAttribute('name', tag);
            tagval.setAttribute('value', value != undefined ? value.$v : '');
        }
        tagval.setAttribute('name', tag);
        var dd = document.createElement('td');
        tagval.onchange = addOrUpdate;
        dd.appendChild(tagval);
        
        if (regexTimeInt.test(tag))
            hideDefault = tagval.value === '';
        else if (regexDefault.test(tag) && hideDefault)
            inputdiv.style.display = 'none';

        inputdiv.appendChild(dt);
        inputdiv.appendChild(dd);
        table.appendChild(inputdiv);
    }
    div.appendChild(table);
    return div;
}

function addOrUpdate() {
    var regex = new RegExp('parking:condition:.+:time_interval');
    if (regex.test(this.name)) {
        var side = this.name.split(':')[2];
        if (this.value === '')
            document.getElementById('parking:condition:' + side + ':default').style.display = 'none';
        else
            document.getElementById('parking:condition:' + side + ':default').style.display = '';
    }

    var obj = formToOsmWay(this.form);
    var polyline;
    if (lanes[obj.$id])
        polyline = lanes[obj.$id].getLatLngs();
    else if (lanes[-obj.$id])
        polyline = lanes[-obj.$id].getLatLngs();
    else if (lanes['empty' + obj.$id])
        polyline = lanes['empty' + obj.$id].getLatLngs();


    var emptyway = true;
    for (var side of ['right', 'left']) {
        var conditions = getConditions(side, obj.tag);
        var id = side == 'right' ? obj.$id : -obj.$id;
        if (conditions.default != null) {
            if (lanes[id]) {
                lanes[id].conditions = conditions;
                lanes[id].setStyle({ color: getColorByDate(conditions) });
            } else {
                var isMajor = wayIsMajor(obj.tag);
                addLane(polyline, conditions, side, obj, (isMajor ? offsetMajor : offsetMinor), isMajor);
            }
            emptyway = false;
        } else if (lanes[id]) {
            lanes[id].remove();
        }
    }
    if (emptyway) {
        if (!lanes['empty' + obj.$id]) {
            var isMajor = wayIsMajor(obj.tag);
            addLane(polyline, null, 'right', obj, 0, isMajor);
        }
    } else if (lanes['empty' + obj.$id]) {
        lanes['empty' + obj.$id].setStyle({ color: 'white' });
    }

    save({ target: this.form });
}

function chooseSideTags(form, side) {
    var regex = new RegExp('^parking:.*' + side);

    for (var input of form)
        if (regex.test(input.name) && input.value != '') 
            return true;
        
    return false;
}

function formToOsmWay(form) {
    var regex = new RegExp('^parking:');
    var osm = ways[form.id];
    osm.tag = osm.tag.filter(tag => !regex.test(tag.$k));

    for (var input of form)
        if (regex.test(input.name) && input.value != '') {
            osm.tag.push({ $k: input.name, $v: input.value })
        }
    return osm;
}

function save(form) {
    var osm = formToOsmWay(form.target);

    delete osm.$user;
    delete osm.$uid;
    delete osm.$timestamp;

    var index = change.osmChange.modify.way.findIndex(x => x.$id == osm.$id);

    if (index > -1)
        change.osmChange.modify.way[index] = osm;
    else
        change.osmChange.modify.way.push(osm);

    document.getElementById('saveChangeset').innerText = 'Save (' + change.osmChange.modify.way.length + ')';
    document.getElementById('saveChangeset').style.display = 'block';

    return false;
}

function removeFromOsmChangeset(id) {
    var form = document.getElementById(id);
    form.reset();
    form['parking:lane:both'].onchange();

    var index = change.osmChange.modify.way.findIndex(x => x.$id == id);

    if (index > -1)
        change.osmChange.modify.way.splice(index, 1);

    if (change.osmChange.modify.way.length == 0)
        document.getElementById('saveChangeset').style.display = 'none';
    document.getElementById('saveChangeset').innerText = 'Save (' + change.osmChange.modify.way.length + ')';

    closeLaneInfo();
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
        saving = false;
    });
}
function createChangset() {
    if (saving)
        return;
    saving = true;

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

function closeLaneInfo(e) {
    var laneinfo = document.getElementById('laneinfo');
    laneinfo.style.display = 'none';
    laneinfo.innerHTML = '';

    if (lanes['right'])
        lanes['right'].remove();
    if (lanes['left'])
        lanes['left'].remove();
}

map.on('moveend', mapMoveEnd);
map.on('click', closeLaneInfo);
mapMoveEnd();
