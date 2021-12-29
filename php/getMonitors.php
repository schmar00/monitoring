<?php
header("Access-Control-Allow-Origin: *"); #enable cors
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
echo ($response1 . '|' . $response2);
#$file_pointer = 'getMonitors.js';
#file_put_contents($file_pointer, ('const uptimeArr = ['.$response1.','.$response2.'];'));
curl_close($curl);
?>