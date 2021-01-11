//list ArcGIS services 

class Service {
    constructor(name, typ, url, server, rest, wms, wfs, csw, rdf, oai) { // Constructor
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
    }
}

class Server {
    constructor(url, typ) {
        this.url = url;
        this.typ = typ;
    }
}

const regServices = [
    new Service('Thesaurus Lithology', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/lithology', 'PoolParty', 1, 0, 0, 0, 1, 0),
    new Service('Thesaurus GeologicUnit', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/GeologicUnit', 'PoolParty', 1, 0, 0, 0, 1, 0),
    new Service('Thesaurus Structure', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/structure', 'PoolParty', 1, 0, 0, 0, 1, 0),
    new Service('Thesaurus GeologicTimeScale', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/GeologicTimeScale', 'PoolParty', 1, 0, 0, 0, 1, 0),
    new Service('Thesaurus TectonicUnits', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/tectonicunit', 'PoolParty', 1, 0, 0, 0, 1, 0),
    new Service('Thesaurus Mineral', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/mineral', 'PoolParty', 1, 0, 0, 0, 1, 0),
    new Service('Thesaurus Mineral Resources', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/minres', 'PoolParty', 1, 0, 0, 0, 1, 0),
    new Service('GeoERA Keywords (GBA)', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/keyword', 'PoolParty', 1, 0, 0, 0, 1, 0),
    new Service('GeoERA Keywords (BRGM)', 'RDF Server', 'https://data.geoscience.earth/ncl/system', 'Jena', 1, 0, 0, 0, 1, 0),
    new Service('GBA Geonetwork', 'Catalog', 'https://gis.geologie.ac.at/geonetwork', 'OSGeo', 1, 0, 0, 1, 1, 1),
    new Service('Tethys - Research Data Repository', 'Repository', 'https://tethys.at/oai', 'Tethys', 1, 0, 0, 0, 0, 1),
    new Service('OPAC - Online Catalog', 'Catalog', 'https://opac.geologie.ac.at/wwwopacx/wwwopac.ashx', 'AdLib', 1, 0, 0, 0, 0, 5),
    new Service('EGDI Catalog', 'Catalog', 'https://egdi.geology.cz', 'Micka', 1, 0, 0, 1, 1, 5),
    new Service('LRFZ Catalog', 'Catalog', 'https://geometadaten.lfrz.at/at.lfrz.discoveryservices/srv/ger/', 'OSGeo', 1, 0, 0, 1, 1, 1),
    new Service('INSPIRE Catalog', 'Catalog', 'https://inspire-geoportal.ec.europa.eu', 'OSGeo', 1, 0, 0, 1, 0, 5),
    new Service('BEV Catalog', 'Catalog', 'http://sd.bev.gv.at/geonetwork/srv/ger/', 'OSGeo', 1, 0, 0, 1, 1, 5),
    new Service('EGDI WMS (GEUS)', 'MapServer', 'https://data.geus.dk/egdi/wms', 'OSGeo', 1, 1, 0, 0, 0, 0)
];

function getServices(response, server) {
    let b = [];
    switch (server) {
        case 'ArcGIS':
            for (item of response.replace(/(\r\n|\n|\r|https:\/\/gisgba.geologie.ac.at\/arcgis\/rest\/services\/)/gm, '').split('<loc>')) {
                let c = item.split('</loc>')[0].split('/');
                let d = 'https://gisgba.geologie.ac.at/arcgis/rest/services/' + item.split('<')[0];
                if (c.length > 2) {
                    b.push(new Service(c[1] + ' (' + c[0] + ')', c[2], d, server, 1, 0, 0, 0, 0, 0, 0));
                } else {
                    b.push(new Service(c[0], c[1], d, server, 1, 0, 0, 0, 0, 0, 0));
                }
            }
            b.shift();
            return b;
            break;
        case 'OSGeo':
            for (item of response.split('http').filter(s => s.includes('/ows?')).map(a => 'http' + a.split('/ows?')[0] + '/ows').filter((v, i, a) => a.indexOf(v) === i)) {
                b.push(new Service(item.split('/')[4], 'Geoserver', item, server, 1, 1, 0, 0, 0, 0, 0));
            }
            return b;
    }
}


let serverList = [
    new Server('https://gisgba.geologie.ac.at/arcgis/rest/services/?f=sitemap', 'ArcGIS'),
    //new Server('https://gis.geologie.ac.at/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage', 'OSGeo')
];

Promise.all(serverList.map(s =>
        fetch(s.url)
        .then(resp => resp.text())
        .then(data => getServices(data, s.typ))
    ))
    .then(texts => {
        let allServices = texts.flat().concat(regServices);
        let monitorsList = [];

        postData('https://api.uptimerobot.com/v2/getMonitors', {
                answer: 42,
                api_key: 'ur1005820-31d8f6b693be1669f8596d19',
                response_times: 1,
                response_times_average: 1,
                all_time_uptime_ratio: 1

            })
            .then(data1 => {
                monitorsList = data1.monitors;
                //console.log(monitorsList);

                postData('https://api.uptimerobot.com/v2/getMonitors', {
                        answer: 42,
                        api_key: 'ur1005820-31d8f6b693be1669f8596d19',
                        response_times: 1,
                        response_times_average: 1,
                        all_time_uptime_ratio: 1,
                        offset: 50

                    })
                    .then(data2 => {
                        monitorsList = monitorsList.concat(data2.monitors);
                        //console.log(monitorsList);
                        let u1 = '<a title="stats" href="https://stats.uptimerobot.com/nNwk9IGgjk/$">';
                        let u2 = '</a>';

                        let smiley = {
                            0: '<span class="hidden">7</span>', //empty
                            1: '<span class="hidden">5</span><i class="fas fa-circle" style="color:lightgrey;"></i>', //grey
                            2: '<span class="hidden">2</span><i class="fas fa-smile" style="color:#27ae60;"></i>', //OK
                            3: '<span class="hidden">3</span><i class="fas fa-meh" style="color:#FFC300;"></i>', //slow
                            4: '<span class="hidden">4</span><i class="fas fa-frown" style="color:#e74c3c;"></i>', //down
                            5: '<span class="hidden">6</span><i class="fas fa-question-circle" style="color:grey;"></i>' //possible
                        };

                        //console.log('allServices', allServices);

                        let WMSList = monitorsList.map(a => a.url.toLowerCase()).filter(b => b.includes('wms'));
                        let RESTList = monitorsList.map(a => a.url.toLowerCase()).filter(b => b.includes('/rest/'));

                        let queryLink = '';

                        let wfsServices = ['GBA_Pangeo_Ground_Stability (projekte_pangeo)', '1GE_GBA_500k_Surface_Geology (projekte_onegeology)', 'TEST_WFS_IRIS_Lagerstaetten_Reviere (test)'];
                        let serverTyp = ['MapServer', 'ImageServer', 'FeatureServer'];

                        let responseTime = '';
                        let uptime = '';
                        let restBonus = 0;
                        let lookUpID = '';

                        for (let i of allServices) {

                            let lookUp = monitorsList.filter(s => s.url.includes(i.url.replace('/ows', ''))).concat(monitorsList.filter(s => s.url.includes(i.url.replace('/rest/', '/'))));

                            //console.log('lookUp', lookUp);
                            monitorLink = '-';
                            addStatus = 1;
                            restBonus = 0;
                            responseTime = '-';
                            uptime = '-';
                            lookUpID = '-';


                            if (lookUp.length > 0) {
                                responseTime = parseInt(lookUp[0].average_response_time);
                                uptime = parseFloat(lookUp[0].all_time_uptime_ratio).toFixed(2);
                                monitorLink = `<a title="statistics" href="https://stats.uptimerobot.com/nNwk9IGgjk/${lookUp[0].id}"><i class="fas fa-poll"></i></a>`;
                                lookUpID = `<a title="try" href="${lookUp[0].url}"><i class="fab fa-creative-commons-sampling"></i></a>`;

                                switch (lookUp[0].status) {
                                    case 2:
                                        if (responseTime < 2000 && uptime > 99) {
                                            addStatus = 2;
                                        } else {
                                            addStatus = 3;
                                        }
                                        break;
                                    case 0:
                                        addStatus = 5;
                                        break;
                                    case 8:
                                        addStatus = 4;
                                        break;
                                    case 9:
                                        addStatus = 4;
                                        break;
                                }
                            } else if (serverTyp.includes(i.typ)) {
                                i.wms = 5;
                            }

                            if (wfsServices.includes(i.name)) {
                                i.wfs = 1;
                            }
                            if (WMSList.filter(a => a.includes(i.url.replace('/rest/', '/').toLowerCase())).length > 0) {
                                i.wms = 1;
                            }
                            if (RESTList.filter(a => a.includes(i.url.toLowerCase())).length > 0) {
                                i.rest = 1;
                            }
                            if (i.wms == 1 && i.rest == 1 && addStatus == 3 && responseTime < 2500) {
                                restBonus = 1;
                            }

                            $('#monitors').append(`<tr>
                                <td><a title="link" href="${i.url}"><i class="fas fa-link"></i></a>&nbsp;&nbsp;&nbsp;${i.name}</td>
                                <td>${i.typ}</td>
                                <td>${i.server}</td>
                                <td class="middle">${((i.rest==5)?smiley[5]:smiley[i.rest * addStatus - restBonus])}</td>
                                <td class="middle">${((i.wms==5)?smiley[5]:smiley[i.wms * addStatus])}</td>
                                <td class="middle">${((i.wfs==5)?smiley[5]:smiley[i.wfs * addStatus])}</td>
                                <td class="middle">${((i.csw==5)?smiley[5]:smiley[i.csw * addStatus])}</td>
                                <td class="middle">${((i.rdf==5)?smiley[5]:smiley[i.rdf * addStatus])}</td>
                                <td class="middle">${((i.oai==5)?smiley[5]:smiley[i.oai * addStatus])}</td>
                                <td class="middle">${monitorLink}</td>
                                <td class="middle">${lookUpID}</td>
                                <td class="number">${uptime}</td>
                                <td class="number">${responseTime}</td>
                            </tr>`);
                        }


                    //monitorLink = `<a title="test" href="${lookUp[0].url}"><i class="fab fa-creative-commons-sampling"></i></a>`;

                        //https://datatables.net/examples/basic_init/

                        $('#example').DataTable({
                            "order": [[1, "asc"]], //nach Namen sortiert
                            //"paging": false
                            "lengthMenu": [25, 50, 100]
                        });
                        $('#loading').hide();

                        $('.col-md-6').addClass('col-md-4').removeClass('col-md-6');
                        $('#example_filter').parent().parent().append(`
                            <div class="col-sm-12 col-md-4">
                                uptime status:
                                <br>
                                <span class="legend">
                                ${smiley[2]} OK&nbsp;&nbsp;&nbsp;
                                ${smiley[3]} slow (>2s)&nbsp;&nbsp;&nbsp;
                                ${smiley[4]} down&nbsp;&nbsp;
                                ${smiley[1]} unknown&nbsp;
                                ${smiley[5]} relevant&nbsp;
                                </span>
                            </div>`);
                    });
            });
    });


async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}
