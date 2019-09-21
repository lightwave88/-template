<?php
header('Content-Type: text/html; charset=utf-8');

$data = $_REQUEST;
$data['phpTime'] = time();

$text = json_encode($data);

echo $text;
