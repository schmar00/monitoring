//list ArcGIS services

class Service {
    constructor(name, typ, url, server, rest, wms, wfs, csw, sparql, oai) { // Constructor
        this.name = name;
        this.typ = typ;
        this.url = url;
        this.server = server;
        this.rest = rest;
        this.wms = wms;
        this.wfs = wfs;
        this.csw = csw;
        this.sparql = sparql;
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
    new Service('Thesaurus Lithology', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/lithology', 'PoolParty', 1, 0, 0, 0, 1),
    new Service('Thesaurus GeologicUnit', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/GeologicUnit', 'PoolParty', 1, 0, 0, 0, 1),
    new Service('Thesaurus Structure', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/structure', 'PoolParty', 1, 0, 0, 0, 1),
    new Service('Thesaurus GeologicTimeScale', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/GeologicTimeScale', 'PoolParty', 1, 0, 0, 0, 1),
    new Service('Thesaurus TectonicUnits', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/tectonicunit', 'PoolParty', 1, 0, 0, 0, 1),
    new Service('Thesaurus Mineral', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/mineral', 'PoolParty', 1, 0, 0, 0, 1),
    new Service('Thesaurus Mineral Resources', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/minres', 'PoolParty', 1, 0, 0, 0, 1),
    new Service('GeoERA Keywords (GBA)', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/structure', 'PoolParty', 1, 0, 0, 0, 1),
    new Service('GeoERA Keywords (BRGM)', 'RDF Server', 'https://data.geoscience.earth/ncl/system', 'Jena', 1, 0, 0, 0, 1),
    new Service('GBA Geonetwork', 'Catalog', 'https://gis.geologie.ac.at/geonetwork', 'OSGeo', 1, 0, 0, 1),
    new Service('Tethys - Research Data Repository', 'Repository', 'https://tethys.at/oai', 'Tethys', 0, 0, 0, 0, 0, 1),
    new Service('OPAC - Online Catalog', 'Catalog', 'https://opac.geologie.ac.at/wwwopacx/wwwopac.ashx', 'AdLib', 1),
    new Service('EGDI Catalog', 'Catalog', 'https://egdi.geology.cz', 'Micka', 1, 0, 0, 1),
    new Service('EGDI WMS (GEUS)', 'MapServer', 'https://data.geus.dk/egdi/wms', 'OSGeo', 1, 1)
];

function getServices(response, server) {
    let b = [];
    switch (server) {
        case 'ArcGIS':
            for (item of response.replace(/(\r\n|\n|\r|https:\/\/gisgba.geologie.ac.at\/arcgis\/rest\/services\/)/gm, '').split('<loc>')) {
                let c = item.split('</loc>')[0].split('/');
                let d = 'https://gisgba.geologie.ac.at/arcgis/rest/services/' + item.split('<')[0];
                if (c.length > 2) {
                    b.push(new Service(c[1] + ' (' + c[0] + ')', c[2], d, server, 1));
                } else {
                    b.push(new Service(c[0], c[1], d, server, 1));
                }
            }
            b.shift();
            return b;
            break;
        case 'OSGeo':
            for (item of response.split('http').filter(s => s.includes('/ows?')).map(a => 'http' + a.split('/ows?')[0] + '/ows').filter((v, i, a) => a.indexOf(v) === i)) {
                b.push(new Service(item.split('/')[4], 'Geoserver', item, server, 1, 1));
            }
            return b;
    }
}


let serverList = [
    new Server('https://gisgba.geologie.ac.at/arcgis/rest/services/?f=sitemap', 'ArcGIS'),
    new Server('https://gis.geologie.ac.at/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage?4&filter=false', 'OSGeo')
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

                        let face = {
                            1: '<i class="fas fa-smile" style="color:#27ae60;"></i>',
                            2: '<i class="fas fa-meh" style="color:#FFC300;"></i>',
                            3: '<i class="fas fa-angry" style="color:#e74c3c;"></i>'
                        };

                        let utrLink = 'https://stats.uptimerobot.com/nNwk9IGgjk/';

                        //console.log(allServices); //WFS->WMS->REST->without
                        let lookUpWFS = monitorsList.map(a => a.url.toLowerCase()).filter(b => b.includes('service=wfs'));
                        let lookUpWMS = monitorsList.map(a => a.url.toLowerCase()).filter(b => b.includes('wms'));
                        let lookUpREST = monitorsList.map(a => a.url.toLowerCase()).filter(b => b.includes('/rest/'));
                        //console.log(lookUpWMS);

                        let queryLink = '';

                        for (let i of allServices) {
                            let lookUp = monitorsList.filter(s => s.url.includes(i.url.replace('/ows', ''))).concat(monitorsList.filter(s => s.url.includes(i.url.replace('/rest/', '/'))));

                            if (lookUpWFS.filter(a => a.includes(i.url.replace('/rest/', '/').toLowerCase())).length > 0) {
                                i.wfs = 1;
                                i.wms = 1;
                            }
                            if (lookUpWMS.filter(a => a.includes(i.url.replace('/rest/', '/').toLowerCase())).length > 0) {
                                i.wms = 1;
                            }
                            if (lookUpREST.filter(a => a.includes(i.url.toLowerCase())).length > 0) {
                                i.rest = 1;
                            }

                            //console.log(lookUp);
                            let uptimeStatus = '<i class="fas fa-circle" style="color:lightgrey;"></i>';
                            let unknownStatus = '<i class="fas fa-question-circle" style="color:lightgrey;"></i>';
                            let responseTime = '';
                            let uptime = '';

                            let restStatus = '';
                            let wmsStatus = '';
                            let wfsStatus = '';
                            if (i.rest == 1) {
                                restStatus = uptimeStatus;

                            }

                            let wmsTyp = ['MapServer', 'ImageServer', 'FeatureServer'];
                            if (wmsTyp.includes(i.typ)) {
                                wmsStatus = unknownStatus;
                            }

                            let wfsServices = ['IRIS_Lagerstaetten_Reviere (projekte_iris)', 'GBA_Pangeo_Ground_Stability (projekte_pangeo)', '1GE_GBA_500k_Surface_Geology (projekte_onegeology)'];
                            if (wfsServices.includes(i.name)) {
                                wfsStatus = uptimeStatus;
                                i.wfs = 1;
                            }
                            queryLink = '';
                            if (lookUp.length > 0) {
                                responseTime = parseInt(lookUp[0].average_response_time);
                                uptime = parseFloat(lookUp[0].all_time_uptime_ratio).toFixed(2);
                                queryLink = `<a href="${lookUp[0].url}"><i class="fab fa-creative-commons-sampling"></i></a>`;

                                switch (lookUp[0].status) {
                                    case 2:
                                        if (responseTime < 2000 && uptime > 99) {
                                            uptimeStatus = `<a href="${utrLink+lookUp[0].id}">${face[1]}</a>`;
                                        } else {
                                            uptimeStatus = `<a href="${utrLink+lookUp[0].id}">${face[2]}</a>`;
                                        }

                                        if (i.wms == 1 && i.typ !== 'Geoserver' && responseTime < 4000 && uptime > 99) {
                                            restStatus = `<a href="${utrLink+lookUp[0].id}">${face[1]}</a>`
                                        } else {
                                            restStatus = uptimeStatus;
                                        }
                                        break;
                                    case 0:
                                        uptimeStatus = `<a href="${utrLink+lookUp[0].id}">${face[3]}</a>`;
                                        break;
                                    case 8:
                                        uptimeStatus = `<a href="${utrLink+lookUp[0].id}">${face[3]}</a>`;
                                        break;
                                    case 9:
                                        uptimeStatus = `<a href="${utrLink+lookUp[0].id}">${face[3]}</a>`;
                                }

                            }
                            $('#monitors').append(`<tr>
                                        <td><a title="website" href="${i.url}"><i class="fas fa-server"></i></a>&nbsp;&nbsp;&nbsp;${i.name}</td>
                                        <td>${i.typ}</td>
                                        <td>${i.server}</td>
                                        <td class="middle">${restStatus}</td>
                                        <td class="middle">${(i.wms==1)?uptimeStatus:wmsStatus}</td>
                                        <td class="middle">${(i.wfs==1)?uptimeStatus:wfsStatus}</td>
                                        <td class="middle">${(i.csw==1)?uptimeStatus:''}</td>
                                        <td class="middle">${(i.sparql==1)?uptimeStatus:''}</td>
                                        <td class="middle">${(i.oai==1)?uptimeStatus:''}</td>
                                        <td class="middle">${queryLink}</td>
                                        <td class="number">${uptime}</td>
                                        <td class="number">${responseTime}</td>
                                    </tr>`);
                        }

                        //https://datatables.net/examples/basic_init/

                        $('#example').DataTable({
                            "order": [[1, "asc"]], //nach Namen sortiert
                            //"paging": false
                            "lengthMenu": [25, 50, 100]
                        });


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
