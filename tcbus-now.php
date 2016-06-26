<?php

# copied from http://v.im.cyut.edu.tw/~doofenshmirtz/tcbus-now.php
mb_parse_str($_SERVER["QUERY_STRING"], $qs);
$rid = array_key_exists('rid', $qs) ? preg_replace('/\W/', '', $qs["rid"]) : '151';

$table = file_get_contents("http://117.56.225.175/tcbus2/GetBusData.php?routeIds=$rid");
$table = json_decode($table, true);

$bp = '{"1":"\u53f0\u4e2d\u5ba2\u904b","2":"\u4ec1\u53cb\u5ba2\u904b","3":"\u7d71\u806f\u5ba2\u904b","4":"\u5de8\u696d\u4ea4\u901a","5":"\u5168\u822a\u5ba2\u904b","6":"\u8c50\u539f\u5ba2\u904b","7":"\u5f70\u5316\u5ba2\u904b","8":"\u548c\u6b23\u5ba2\u904b","11":"\u6771\u5357\u5ba2\u904b","12":"\u82d7\u6817\u5ba2\u904b","14":"\u8c50\u69ae\u5ba2\u904b","15":"\u4e2d\u53f0\u7063\u5ba2\u904b","16":"\u5357\u6295\u5ba2\u904b","17":"\u56db\u65b9\u5ba2\u904b","18":"\u6377\u9806\u4ea4\u901a","20":"\u81fa\u4e2d\u5feb\u6377\u5df4\u58eb"}';
$bp = json_decode($bp, true);


$busgeojson = array();

foreach($table as $car){
	array_push($busgeojson, array(
		"type" => "Feature",
		"geometry" => array(
			"type" => "Point",
			"coordinates" => array($car["Longitude"], $car["Latitude"])
		),
		"properties" => array(
			"BusID" => $car["BusID"],
			"ProviderID" => $car["ProviderID"],
			"Provider" => $bp[$car["ProviderID"]],
			"GoBack" => $car["GoBack"],
			"Speed" => $car["Speed"],
			"Azimuth" => $car["Azimuth"],
			"carType" => $car["carType"]
		)
	));
	
}



echo json_encode($busgeojson);

?>
