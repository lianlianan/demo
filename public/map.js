
var map = null;
var center = new google.maps.LatLng(51.5125,-0.0914);

function fetch_tile(coord, zoom) {
  console.log($('#country').val())
  return "http://59.110.228.51/map/" + $('#country').val() + "/.tiles/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
}

function mobilecheck() {
var check = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
return check; }
// --- begin geocoding stuff --
var geocoder = new google.maps.Geocoder();
var southwest_limit = new google.maps.LatLng(24.940, -124.95);
var northeast_limit = new google.maps.LatLng(49.98, -67.08);
var bounding_box = new google.maps.LatLngBounds(southwest_limit, northeast_limit);
var outside_il = false; // until prove true
var user_marker = null;
var user_image = 'favorite_marker.png';
var has_zoomed = false;
var has_moved = false;

function geocode(query, country) {
    if (typeof(query) == 'string') {
        pattr = /\sny\s|\snewyork\s|\snew york\s/gi;
        match = query.match(pattr);
        if (!match) {
            query = query + (country === 'uscr') ? ' NY' : 'LONDON';
        }

        gr = { 'address': query };
    } else {
        gr = { 'location': query };
    }
    geocoder.geocode(gr, handle_geocode);
}

function handle_geocode(results, status) {
    alt_addresses(results);

    lat = results[0].geometry.location.lat();
    lng = results[0].geometry.location.lng();

    normalized_address = results[0].formatted_address;
    $('#query').val(normalized_address)

    var zoom = (has_zoomed) ? map.zoom : 14;
    process_location(lat, lng, zoom, true);
}

function alt_addresses(results) {
    $('#alt-addresses').html('');

    keep = new Array();

    $.each(results, function(i,val) {
        if (i==0) return; // skip the first result

        for (var t in val.types) {
            if (val.types[t] == 'street_address' || val.types[t] == 'intersection') {
                keep.push(val.formatted_address);
                break;
            }
        }
    });

    if (keep.length <= 1) {
        $('#did-you-mean')
            .addClass('disabled-link')
            .unbind();
    } else {
        $('#did-you-mean')
            .removeClass('disabled-link')
            .click(function(e) {
                    e.stopPropagation();
                    toggle_alt_addresses();
                    });

        $('#alt-addresses').append('<p>Did you mean...</p>');
        for (var i in keep) {
            $('#alt-addresses').append('<a href="javascript:geocode(\'' + keep[i] + '\');">' + keep[i] + '</a>');
        }
    }
}
function process_location(lat, lng, zoom, showMarker) {
    var center = new google.maps.LatLng(lat, lng);
    map.panTo(center);
    if (zoom) {
        map.setZoom(zoom);
    }
    if (showMarker instanceof Array) {
        show_user_marker(showMarker[0],showMarker[1]); //?
    } else if (showMarker) {
            show_user_marker(lat, lng); //?
  }
}

function show_user_marker(lat, lng) {
    if (user_marker == null) {
        user_marker = new google.maps.Marker();
        user_marker.setMap(map);
    }
    user_marker.setPosition(new google.maps.LatLng(lat, lng));
    user_marker.setTitle("latitude: " + lat + "  longitude: "+ lng);

}

function toggle_alt_addresses() {
    alt_adds_div = $('#alt-addresses');
    if (alt_adds_div.is(':hidden')) {
        show_alt_addresses();
    } else if (alt_adds_div.is(':visible')) {
        hide_alt_addresses();
    }
}

function show_alt_addresses() {
    $('#alt-addresses').slideDown(250);
    $('#did-you-mean').addClass('highlight');
}

function hide_alt_addresses() {
    $('#alt-addresses').hide();
    $('#did-you-mean.highlight').removeClass('highlight');
}


function parse_hash(s) {
    try {
        if (s[0] == "#") {
            s = s.substr(1);
        }
        parts = s.split(",");
        lat = parseFloat(parts[0]);
        lng = parseFloat(parts[1]);
        zoom = parseInt(parts[2]);
        if (parts.length == 5) {
          marker_location = [parts[3], parts[4]];
        process_location(lat, lng, zoom, marker_location);
        } else {
        process_location(lat, lng, zoom, true);
        }
    } catch (e) { }
}

function make_hash() {
    var parts = [map.center.lat(),map.center.lng(),map.zoom]
    if (user_marker) {
      parts.push(user_marker.position.lat());
      parts.push(user_marker.position.lng());
    }
    return parts.join(",");
}

// --- end geocoding stuff ---

function detectBrowser() {
  var useragent = navigator.userAgent;
  var mapdiv = document.getElementById("map_canvas");

  if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    mapdiv.style.width = '100%';
    mapdiv.style.height = '100%';
  } else {
    mapdiv.style.width = '100%';
    mapdiv.style.height = '100%';
  }
}


$(document).ready(function() {
  map_demo_options = {
    getTileUrl: fetch_tile,
    tileSize: new google.maps.Size(256, 256),
    opacity:0.48,
    isPng: true
  }
  map_demo = new google.maps.ImageMapType(map_demo_options);

  map_options = {
    minZoom: 5,
    maxZoom: 15,
    zoom: 14,
    center: center,
    mapTypeControl: false,
    zoomControl: false,
    streetViewControl: false,
    mapTypeId: "simple"
  };

  if (mobilecheck() == false) {
  	map_options.zoomControl = true;
  	//map_options.streetViewControl = true;
  }

    backdrop_styles = [
        {
            featureType: "administrative",
            elementType: "labels",
            stylers: [
                { lightness: 10 }
            ]
        },{
            featureType: "poi",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "poi.park",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "poi.business",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "poi.attraction",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [
                { visibility: "off" }
            ]
        },{
            featureType: "poi.lodging",
            elementType: "geometry",
            stylers: [
                { visibility: "on" }
            ]
        },{
            featureType: "road",
            elementType: "geometry",
            stylers: [
                { visibility: "simplified" },
                { saturation: -100 },
                { lightness: 0 }
            ]
        },{
            featureType: "road.arterial",
            elementType: "labels",
            stylers: [
                { gamma: 10 }
            ]
        }
    ];

    var initial_hash = window.location.hash;

    simple = new google.maps.StyledMapType(backdrop_styles, { name: "riskarma scores" });
    map = new google.maps.Map(document.getElementById("map_canvas"), map_options);
    map.mapTypes.set("simple", simple);
    map.overlayMapTypes.push(map_demo);

    if (initial_hash) {
      parse_hash(initial_hash);
    }

    $("#search").submit(function(){
      geocode($("#query").val(), $("#country").val());
      return false;
    });

    $("#show-wards").click(function(){
        if(this.checked){
            map.overlayMapTypes.push(wards);
        }
        else {
            map.overlayMapTypes.pop();
        }
    });

    google.maps.event.addListener(map, 'zoom_changed', function() {
        has_zoomed = true;
    });
    google.maps.event.addListener(map, 'bounds_changed', function() {
      if (has_moved) {
        window.location.hash = make_hash();
      }
      has_moved = true;
    });
});
