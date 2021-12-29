<?php
header("Access-Control-Allow-Origin: *"); #enable cors
#create a list of GBA Geoserver layers from website
libxml_use_internal_errors(true);
$html = new DOMDocument();
$html->loadHtmlFile('https://gis.geologie.ac.at/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage?4&filter=false');
$shtml = simplexml_import_dom($html);
$matches = $shtml->xpath('//tr');
array_shift($matches);

#$gsLayer_js = 'const gsLayer = [';
$gsLayer_js = '[';

foreach ($matches as $node) {
    $gsLayer_js .= '{"title":"' . $node->td[1]->span 
                . '", "name":"' . $node->td[2]->span 
                . '", "url":"' . $node->td[3]->span->span[0]->a['href'] 
                . '"},';
    #echo "<pre>".$node->td[1]->span."<pre/>";
} 
$gsLayer_js = rtrim($gsLayer_js, ", ");
$gsLayer_js .= ']';
$gsLayer_js = str_replace("Ä","&#196;",$gsLayer_js);
$gsLayer_js = str_replace("Ö","&#214;",$gsLayer_js);
$gsLayer_js = str_replace("Ü","&#220;",$gsLayer_js);
$gsLayer_js = str_replace("ä","&#228;",$gsLayer_js);
$gsLayer_js = str_replace("ö","&#246;",$gsLayer_js);
$gsLayer_js = str_replace("ü","&#252;",$gsLayer_js);
$gsLayer_js = str_replace("ß","&#223;",$gsLayer_js);
echo $gsLayer_js;
#$file_pointer = 'gsLayer.js';
#file_put_contents($file_pointer, $gsLayer_js);
?>
