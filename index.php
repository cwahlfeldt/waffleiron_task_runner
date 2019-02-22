<?php

/**
 *
 * Simulates regular template heirarchy with PHP
 *
 */

include "lib/BladeOne/lib/BladeOne.php";

$views = __DIR__ . '/src/views'; // it uses the folder /views to read the templates
$cache = __DIR__ . '/.cache'; // it uses the folder /cache to compile the result. 

// The nulls indicates the default folders. By drfault it's /views and /compiles
// \eftec\bladeone\BladeOne::MODE_DEBUG is useful because it indicates the correct file if the template fails to load.  
//  You must disable it in production. 
$blade = new \eftec\bladeone\BladeOne($views,$cache,\eftec\bladeone\BladeOne::MODE_AUTO);

if (is_home() || is_front_page()) {
  echo $blade->run("page", []);
} else if (is_page()) {
  echo $blade->run("page", []);
} else if (is_404()) {
  echo $blade->run("404", []);
} else {
  echo $blade->run("404", []);
}
