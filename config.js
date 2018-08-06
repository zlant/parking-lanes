var editorName = 'PLanes'

var valuesLane = ['parallel', 'diagonal', 'perpendicular', 'no_parking', 'no_stopping', 'marked', 'fire_lane'];
var valuesCond = ['free', 'ticket', 'disc', 'residents', 'customers', 'private'];

var legend = [
    { condition: 'disc', color: 'yellowgreen', text: 'Disc' },
    { condition: 'no_parking', color: 'orange', text: 'No parking' },
    { condition: 'no_stopping', color: 'salmon', text: 'No stopping' },
    { condition: 'free', color: 'limegreen', text: 'Free parking' },
    { condition: 'ticket', color: 'dodgerblue', text: 'Paid parking' },
    { condition: 'customers', color: 'greenyellow', text: 'For customers' },
    { condition: 'residents', color: 'hotpink', text: 'For residents' },
    { condition: 'disabled', color: 'turquoise', text: 'Disabled' }
];

var useTestServer = false;

var urlOverpass = 'https://overpass-api.de/api/interpreter?data=';
var urlJosm = 'http://127.0.0.1:8111/import?url=';
var urlID = 'https://www.openstreetmap.org/edit?editor=id';

var urlOsmTest = useTestServer
    ? 'https://master.apis.dev.openstreetmap.org'
    : 'https://www.openstreetmap.org';

var auth = useTestServer
    ? osmAuth({
        url: urlOsmTest,
        oauth_consumer_key: 'FhbDyU5roZ0wAPffly1yfiYChg8RaNuFlJTB0SE1',
        oauth_secret: 'gTzuFDWUqmZnwho2NIaVoxpgSX47Xyqq65lTw8do',
        auto: true,
        //singlepage: true
    })
    : osmAuth({
        url: urlOsmTest,
        oauth_consumer_key: 'Np0gmfYoqo6Ronla4wuFTXEUgypODL0jPRzjiFW6',
        oauth_secret: 'KnUDQ3sL3T7LZjvwi5OJj1hxNBz0UiSpTr0T0fLs',
        auto: true,
        //singlepage: true
    });