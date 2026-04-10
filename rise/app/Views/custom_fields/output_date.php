<?php 
if($value && strlen($value)==10){
    echo format_to_date($value, false);
}else {
    echo $value;
}
 ?>