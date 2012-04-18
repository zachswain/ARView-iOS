/*
 * Converts kilometers to miles
 */
function _KMtoMI(km) {
	if( km ) {
		return km * 0.621371192;
	}
	
	return 0;
}

/*
 * Converts miles to feet
 */
function _MItoFT(mi) {
	if( mi ) {
		return mi * 5280;
	}
	
	return 0;
}

function _MItoYD(mi) {
	if( mi ) {
		return mi * 5280 / 3.0;
	}
	
	return 0;
}

function normalize180(firstAngle, secondAngle)
{
      var difference = secondAngle - firstAngle;
      while (difference < -180) difference += 360;
      while (difference > 180) difference -= 360;
      return difference;
}