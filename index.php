<?php
$curl = curl_init();

$offset = "&offset=50";
$page1 = "api_key=ur1005820-31d8f6b693be1669f8596d19&format=json&response_times=1&response_times_limit=1&response_times_average=30&all_time_uptime_ratio=1";
$page2 = $page1 . $offset;

$curlopt = array(
    CURLOPT_URL => "https://api.uptimerobot.com/v2/getMonitors",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_HTTPHEADER => array(
        "cache-control: no-cache",
        "content-type: application/x-www-form-urlencoded"
    ),
    CURLOPT_POSTFIELDS => $page1,
);

curl_setopt_array($curl, $curlopt);
$response1 = curl_exec($curl);
$curlopt[CURLOPT_POSTFIELDS] = $page2;
curl_setopt_array($curl, $curlopt);
$response2 = curl_exec($curl);
curl_close($curl);
?>
<!DOCTYPE html>
<html>

<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>GBA-Webservices Monitoring</title>

    <!-- Bootstrap core CSS -->
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/dataTables.bootstrap4.min.css">
    <link rel="stylesheet" href="css/FontAwesome/all.min.css" />
    <link href="css/jquery.dataTables.min.css">

    <script src="js/jquery.slim.min.js"></script>
    <script src="js/jquery.dataTables.min.js"></script>
    <script src="js/dataTables.bootstrap4.min.js"></script>
    <style>
        .number {
            text-align: right;
        }

        .middle {
            text-align: center;
        }

        .hidden {
            opacity: 0%;
            font-size: 1px;
        }

        .pointer {
            cursor: pointer;
        }

        .help {
            cursor: help;
        }

        #loading {
            position: absolute;
            top: 100%;
            left: 50%;
            z-index: 1000;
            color: aqua;
            width: 3rem;
            height: 3rem;
        }

        .legend {
            font-size: 70%;
        }
    </style>

</head>

<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark static-top">
        <div class="container">
            <a class="navbar-brand" href="#">GBA-Webservices Monitoring</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarResponsive">
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item active">
                        <a class="nav-link" href="https://www.geologie.ac.at/services/web-services">GBA website
                            <span class="sr-only">(current)</span>
                        </a>
                    </li>
                    <!--<li class="nav-item">
                        <a class="nav-link" href="#">About</a>
                    </li>-->
                    <li class="nav-item">
                        <a class="nav-link" href="https://stats.uptimerobot.com/nNwk9IGgjk">UptimeRobot</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="https://www.geologie.ac.at/kontakt">Contact</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Page Content -->
    <div class="container">
        <div class="row">
            <div class="col-lg-12 text-center"><br>
                <!--        <h1 class="mt-5">A Bootstrap 4 Starter Template</h1>-->
                <p class="lead">Web APIs overview, uptime ratio and response times average</p>
                <table id="example" class="text-left table table-hover table-striped table-sm order-column">
                    <thead class="pointer" title="sort">
                        <tr>
                            <th scope="col">Web service</th>
                            <th scope="col">Server</th>
                            <th scope="col">Software</th>
                            <th class="middle" scope="col">REST</th>
                            <th class="middle" scope="col">WMS</th>
                            <th class="middle" scope="col">WFS</th>
                            <th class="middle" scope="col">CSW</th>
                            <th class="middle" scope="col">RDF</th>
                            <th class="middle" scope="col">OAI</th>
                            <th class="middle" scope="col">Monitor</th>
                            <th class="middle" scope="col">view</th>
                            <th scope="col">uptime</th>
                            <th class="number" scope="col">[ms]</th>
                        </tr>
                    </thead>
                    <tbody id="monitors">
                    </tbody>
                </table>
                <div id="loading" class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </div>
    </div>
    <script>
        let monitorsList = <?php print $response1 ?>.monitors.concat(<?php print $response2 ?>.monitors);
        //console.log(xy);
    </script>
    <script src="js/site.js"></script>
</body>

</html>