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
    new Service('Thesaurus Lithology', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/lithology', 'resource', 1, 0, 0, 0, 1),
    new Service('Thesaurus GeologicUnits', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/GeologicUnit', 'resource', 1, 0, 0, 0, 1),
    new Service('Thesaurus Structure', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/structure', 'resource', 1, 0, 0, 0, 1),
    /*new Service('Thesaurus Structure', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/structure', 'resource'),
    new Service('Thesaurus Structure', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/structure', 'resource'),
    new Service('Thesaurus Structure', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/structure', 'resource'),
    new Service('Thesaurus Structure', 'RDF Server', 'https://resource.geolba.ac.at/PoolParty/sparql/structure', 'resource'),*/
    new Service('GBA Geonetwork', 'Catalog', 'https://gis.geologie.ac.at/geonetwork', 'geonetwork', 1, 0, 0, 1),
    new Service('Tethys', 'Repository', 'https://tethys.at/oai', 'tethys', 0, 0, 0, 0, 0, 1)

];

//monitor ESRI
//http://gisgba.geologie.ac.at/arcgis/services/projekte_onegeology/1GE_GBA_500k_Surface_Geology/MapServer/WMSServer?request=GetCapabilities&service=WMS

//https://gisgba.geologie.ac.at/arcgis/rest/services/image/AT_GBA_GK50/ImageServer/exportImage?bbox=900000,300000,5000,570385&size=600&f=image

//https://gisgba.geologie.ac.at/arcgis/services/image/AT_GBA_GEBIETSKARTEN/ImageServer/WMSServer?service=WMS&version=1.1.0&request=GetMap&layers=0&bbox=12,47,17.5,49&width=768&height=330&srs=EPSG%3A4326&styles=default&format=image%2Fpng

//https://gis.geologie.ac.at/geoserver/mr_lagerst/wms?service=WMS&version=1.1.0&request=GetMap&layers=mr_lagerst%3Amr_lagerst&bbox=9.53650665283203%2C46.3820953369141%2C17.061107635498%2C49.0268630981445&width=768&height=330&srs=EPSG%3A4258&format=image%2Fpng

//harvest WMS
//https://gisgba.geologie.ac.at/arcgis/rest/services/projekte_onegeology/1GE_GBA_500k_Surface_Geology/MapServer

function getServices(response, server) {
    let b = [];
    switch (server) {
        case 'arcgis':
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
        case 'geoserver':
            for (item of response.split('http').filter(s => s.includes('/ows?')).map(a => 'http' + a.split('/ows?')[0] + '/ows').filter((v, i, a) => a.indexOf(v) === i)) {
                b.push(new Service(item.split('/')[4], 'Geoserver', item, server, 1, 1));
            }
            return b;
    }
}


let serverList = [
    new Server('https://gisgba.geologie.ac.at/arcgis/rest/services/?f=sitemap', 'arcgis'),
    new Server('https://gis.geologie.ac.at/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage?4&filter=false', 'geoserver')
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
                        console.log(monitorsList);

                        let face = {
                            1: '<i class="fas fa-smile" style="color:#27ae60;"></i>',
                            2: '<i class="fas fa-meh" style="color:#FFC300;"></i>',
                            3: '<i class="fas fa-angry" style="color:#e74c3c;"></i>'
                        };

                        let utrLink = 'https://stats.uptimerobot.com/nNwk9IGgjk/';

                        //console.log(allServices); //WFS->WMS->REST->without
                        let lookUpWFS = monitorsList.map(a => a.url.toLowerCase()).filter(b => b.includes('service=wfs'));
                        let lookUpWMS = monitorsList.map(a => a.url.toLowerCase()).filter(b => b.includes('service=wms'));
                        let lookUpREST = monitorsList.map(a => a.url.toLowerCase()).filter(b => b.includes('/rest/'));
                        //console.log(lookUpWMS);

                        for (let i of allServices) {
                            let lookUp = monitorsList.filter(s => s.url.includes(i.url.replace('/ows',''))).concat(monitorsList.filter(s => s.url.includes(i.url.replace('/rest/','/'))));

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

                            //https://gisgba.geologie.ac.at/ArcGIS/rest/services/AT_GBA_BOHRKERNE/MapServer?f=jsapi
                            //https://gisgba.geologie.ac.at/arcgis/rest/services/AT_GBA_BOHRKERNE/MapServer

                            //console.log(lookUp);
                            let uptimeStatus = '<i class="fas fa-circle" style="color:lightgrey;"></i>';
                            let responseTime = '';
                            let uptime = '';

                            let restStatus = '';
                            if (i.rest == 1) {
                                restStatus = uptimeStatus;
                            }

                            if (lookUp.length > 0) {
                                responseTime = parseInt(lookUp[0].average_response_time);
                                uptime = parseFloat(lookUp[0].all_time_uptime_ratio).toFixed(2);

                                switch (lookUp[0].status) {
                                    case 2:
                                        if (responseTime < 1500 && uptime > 99) {
                                            uptimeStatus = `<a href="${utrLink+lookUp[0].id}">${face[1]}</a>`;
                                        } else {
                                            uptimeStatus = `<a href="${utrLink+lookUp[0].id}">${face[2]}</a>`;
                                        }

                                        if (i.wms == 1 && responseTime < 3000 && uptime > 99) {
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
                                        <td>${i.name}&nbsp;&nbsp;&nbsp;<a href="${i.url}"><i class="fas fa-external-link-alt fa-xs"></i></a></td>
                                        <td>${i.typ}</td>
                                        <td>${i.server}</td>
                                        <td>${restStatus}</td>
                                        <td>${(i.wms==1)?uptimeStatus:''}</td>
                                        <td>${(i.wfs==1)?uptimeStatus:''}</td>
                                        <td>${(i.csw==1)?uptimeStatus:''}</td>
                                        <td>${(i.sparql==1)?uptimeStatus:''}</td>
                                        <td>${(i.oai==1)?uptimeStatus:''}</td>
                                        <td class="number">${uptime}</td>
                                        <td class="number">${responseTime}</td>
                                    </tr>`);



                        }

                        //https://datatables.net/examples/basic_init/

                        $('#example').DataTable({
                            "order": [[1, "asc"]], //nach Namen sortiert
                            //"lengthMenu": [25, 50, 100]
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
