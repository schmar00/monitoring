
class Service {
    constructor(name, typ, url, server, rest, wms, wfs, csw, rdf, oai, urlPart) { // Constructor
        this.name = name;
        this.typ = typ;
        this.url = url;
        this.server = server;
        this.rest = rest;
        this.wms = wms;
        this.wfs = wfs;
        this.csw = csw;
        this.rdf = rdf;
        this.oai = oai;
        this.urlPart = urlPart; //url part to find monitor
    }
}

let regServices = [ //
    new Service('Thesaurus Lithology', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/lithology', 'PoolParty', 1, 0, 0, 0, 1, 0, 'sparql/lithology'),
    new Service('Thesaurus GeologicUnit', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/GeologicUnit', 'PoolParty', 1, 0, 0, 0, 1, 0, 'sparql/GeologicUnit'),
    new Service('Thesaurus Structure', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/structure', 'PoolParty', 1, 0, 0, 0, 1, 0, 'sparql/structure'),
    new Service('Thesaurus GeologicTimeScale', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/GeologicTimeScale', 'PoolParty', 1, 0, 0, 0, 1, 0, 'sparql/GeologicTimeScale'),
    new Service('Thesaurus TectonicUnits', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/tectonicunit', 'PoolParty', 1, 0, 0, 0, 1, 0, 'sparql/tectonicunit'),
    new Service('Thesaurus Mineral', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/mineral', 'PoolParty', 1, 0, 0, 0, 1, 0, 'sparql/mineral'),
    new Service('Thesaurus Mineral Resources', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/minres', 'PoolParty', 1, 0, 0, 0, 1, 0, 'sparql/minres'),
    new Service('GeoERA Keywords (GBA)', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/keyword', 'PoolParty', 1, 0, 0, 0, 1, 0, 'sparql/keyword'),
    new Service('GeoERA Keywords (BRGM)', 'RDF Server', 'https://data.geoscience.earth/ncl/system', 'Jena', 1, 0, 0, 0, 1, 0, 'data.geoscience.earth/ncl'),
    new Service('GBA Geonetwork', 'Catalog', 'https://gis.geologie.ac.at/geonetwork', 'OSGeo', 1, 0, 0, 1, 1, 0, 'gis.geologie.ac.at/geonetwork'),
    new Service('Tethys - Research Data Repository', 'Repository', 'https://tethys.at/oai', 'Tethys', 1, 0, 0, 0, 0, 1, 'tethys.at/oai'),
    new Service('OPAC - Online Catalog', 'Catalog', 'https://opac.geologie.ac.at/wwwopacx/wwwopac.ashx', 'AdLib', 1, 0, 0, 0, 0, 1, 'opac.geologie.ac.at'),
    new Service('EGDI Catalog', 'Catalog', 'https://egdi.geology.cz', 'Micka', 1, 0, 0, 1, 1, 1, 'egdi.geology.cz'),
    new Service('LRFZ Catalog', 'Catalog', 'https://geometadaten.lfrz.at/at.lfrz.discoveryservices/srv/ger/', 'OSGeo', 1, 0, 0, 1, 1, 1, 'lfrz.at'),
    new Service('INSPIRE Catalog', 'Catalog', 'https://inspire-geoportal.ec.europa.eu', 'OSGeo', 1, 0, 0, 1, 0, 1, 'inspire-geoportal.ec'),
    new Service('BEV Catalog', 'Catalog', 'http://sd.bev.gv.at/geonetwork/srv/ger/', 'OSGeo', 1, 0, 0, 1, 1, 1, 'bev.gv.at/geonetwork'),
    new Service('CCCA Catalog', 'Catalog', 'https://data.ccca.ac.at', 'CKAN', 1, 0, 0, 1, 1, 0, 'ccca.ac.at'),
    new Service('OGD Catalog', 'Catalog', 'https://www.data.gv.at', 'CKAN', 1, 0, 0, 1, 1, 0, 'data.gv.at'),
    new Service('European Data Portal', 'Catalog', 'https://www.europeandataportal.eu', 'Virtuoso', 1, 0, 0, 0, 1, 0, 'europeandataportal'),
    new Service('EGDI WMS (GEUS)', 'MapServer', 'https://data.geus.dk/egdi/wms', 'OSGeo', 1, 1, 0, 0, 0, 0, 'data.geus.dk/egdi')
];

let otherIDs = [];

document.addEventListener("DOMContentLoaded", function (event) {
    Promise.all([getMonitors(), getGsLayers(), getArcGisLayers()]) //get external resources
        .then((val) => {
            //console.log(val);
            addArcGisServices(val[2]);
            addGsServices(val[1]);
            createRow(val[0]);
            addWebsites(val[0]);
            addHeader();
        });
});

function addHeader() {
    $('#example').DataTable({
        "order": [
            [1, "asc"]
        ], //nach Namen sortiert
        //"paging": false
        "lengthMenu": [25, 50, 100]
    });
    $('#loading').hide();

    $('.col-md-6').addClass('col-md-4').removeClass('col-md-6');
    $('#example_filter').parent().parent()
        .append(`<div class="col-sm-12 col-md-4">
                uptime status:
                <br>
                <span class="legend">
                 ${getSmiley(1, 2, false)} OK&nbsp;&nbsp;&nbsp;
                 ${getSmiley(1, 3, false)} variable&nbsp;&nbsp;&nbsp;
                 ${getSmiley(1, 9, false)} down&nbsp;&nbsp;
                 ${getSmiley(1, 0, false)} not monitored&nbsp;
                </span>
            </div>`);
}

function createRow(monitorArr) {

    for (let i of regServices) {
        let m = monitorArr.find(a => a.url.indexOf(i.urlPart) > -1);
        let all_time_uptime_ratio = 0;
        let average_response_time = 0;
        let uptimeLink = '-';
        let viewLink = '-';
        let status = 0;
        let slow = 0;

        if (m !== undefined) {
            all_time_uptime_ratio = parseFloat(m.all_time_uptime_ratio).toFixed(2);
            average_response_time = parseInt(m.average_response_time);
            uptimeLink = `<a title="statistics" href="https://stats.uptimerobot.com/nNwk9IGgjk/${m.id}">
                            <i class="fas fa-poll"></i>
                          </a>`;
            viewLink = `<a title="view" href="${m.url}">
                            <i class="far fa-eye"></i>
                        </a>`;
            status = m.status;
            if (average_response_time > 2000 || all_time_uptime_ratio < 98) {
                slow = 1;
            }
            otherIDs.push(m.id);
        }
        //console.log(i, status, slow);

        $('#monitors').append(`<tr>
                                <td><a title="link" href="${i.url}">
                                        <i class="fas fa-link"></i>
                                    </a>&nbsp;&nbsp;&nbsp;${i.name}
                                </td>
                                <td>${i.typ}</td>
                                <td>${i.server}</td>
                                <td class="middle">${getSmiley(i.rest, status, slow)}</td>
                                <td class="middle">${getSmiley(i.wms, status, slow)}</td>
                                <td class="middle">${getSmiley(i.wfs, status, slow)}</td>
                                <td class="middle">${getSmiley(i.csw, status, slow)}</td>
                                <td class="middle">${getSmiley(i.rdf, status, slow)}</td>
                                <td class="middle">${getSmiley(i.oai, status, slow)}</td>
                                <td class="middle">${uptimeLink}</td>
                                <td class="middle">${viewLink}</td>
                                <td class="number">${all_time_uptime_ratio}</td>
                                <td class="number">${average_response_time}</td>
                                </tr>`);
    }
}

function addWebsites(monitorArr) {
    let eC = `<td class="middle"><span class="hidden">5</span></td>`;
    for (let i of monitorArr) {
        if (!otherIDs.includes(i.id)) {
            $('#monitors').append(`<tr>
                                    <td><a title="link" href="${i.url}">
                                            <i class="fas fa-link"></i>
                                        </a>&nbsp;&nbsp;&nbsp;${i.friendly_name}
                                    </td>
                                    <td>other</td>
                                    <td>HTTP</td>
                                    ${eC}${eC}${eC}${eC}${eC}${eC}
                                    <td class="middle">
                                        <a title="statistics" href="https://stats.uptimerobot.com/nNwk9IGgjk/${i.id}">
                                            <i class="fas fa-poll"></i>
                                        </a>
                                    </td>
                                    <td class="middle">
                                        <a title="view" href="${i.url}">
                                            <i class="far fa-eye"></i>
                                        </a>
                                    </td>
                                    <td class="number">${parseFloat(i.all_time_uptime_ratio).toFixed(2)}</td>
                                    <td class="number">${parseInt(i.average_response_time)}</td>
                                    </tr>`);
        }
    }
}

function getSmiley(s, status, slow) {
    if (s == 1) {
        s += status + slow;
    }
    if (s > 8) {
        s = 9;
    }

    switch (s) {
        case 0: //not available
            return '<span class="hidden">5</span>';
            break;
        case 1: //possible
            return '<span class="hidden">4</span><i class="fas fa-circle" style="color:lightgrey;"></i>';
            break;
        case 3: //ok
            return '<span class="hidden">1</span><i class="fas fa-smile" style="color:#27ae60;"></i>';
            break;
        case 4: //slow
            return '<span class="hidden">2</span><i class="fas fa-meh" style="color:#FFC300;"></i>';
            break;
        case 9: //down
            return '<span class="hidden">3</span><i class="fas fa-frown" style="color:#e74c3c;"></i>'
            break;
        default: //not available
            return '<span class="hidden">5</span>';
    }
}

function addArcGisServices(s) {
    for (c of s) {
        let cs = c.split('/');
        let wfs = 0;
        let check = c.split('services/')[1];
        if (cs[cs.length - 1] == 'FeatureServer') {
            wfs = 1;
        }
        if (cs.length > 8) {
            regServices.push(new Service(cs[7] + ' (' + cs[6] + ')', cs[8], c, 'ArcGIS', 1, 1, wfs, 0, 0, 0, check));
        } else {
            regServices.push(new Service(cs[6], cs[7], c, 'ArcGIS', 1, 1, wfs, 0, 0, 0, check));
        }
    }
}

function addGsServices(s) {
    for (c of s) {
        let check = c.url.split('layers=')[1].split('&')[0];
        regServices.push(new Service(c.title, 'Geoserver', c.url, 'OSGeo', 1, 1, 1, 0, 0, 0, check));
    }
    //console.log(regServices);
}

function getMonitors() { //get uptime stats
    return fetch('https://resource.geolba.net/webservices/getMonitors.php')
        .then(res => res.text())
        .then(data => {
            return (data.split('|').map(a => JSON.parse(a).monitors).flat());
        });
}

function getGsLayers() { //get all Geoserver layers
    return fetch('https://resource.geolba.net/webservices/gsLayer.php')
        .then(res => res.json())
        .then(data => {
            return (data);
        });
}

function getArcGisLayers() { //get all ArcGIS services
    return fetch('https://gisgba.geologie.ac.at/arcgis/rest/services/?f=sitemap')
        .then(res => res.text())
        .then(data => {
            let urlArr = data.split('<loc>').map(a => a.split('</loc>')[0]);
            urlArr.shift();
            return (urlArr);
        });
}