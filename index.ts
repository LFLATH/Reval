
var shape;
var coordinates;
var area;
var center;
var county;
var state;
const element = document.getElementById("delete-button");
element!.addEventListener("click", deleteShape);

function deleteShape() {
    shape = shape.setMap(null);
}

function initMap(): void {
  const geocoder = new google.maps.Geocoder();

  const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      center: { lat: 33.7488, lng: -84.3877 },
      zoom: 8,
    }
  );

  const drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: null,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON
      ],
    }
  });

  google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
    coordinates = (polygon.getPath().getArray());
    shape = polygon;
    calculateCenter();
    geocodeLatLng(geocoder);
    drawingManager.setOptions({
        drawingControl: false
    });
    area = google.maps.geometry.spherical.computeArea(polygon.getPath()); 
  });

  drawingManager.setMap(map);
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
function calculateCenter() {
    let xSum = 0;
    let ySum = 0;
    for(let i = 0; i < coordinates.length; i++){
        xSum += coordinates[i].lat();
        ySum += coordinates[i].lng();
    }
    let xCent = xSum/coordinates.length;
    let yCent = ySum/coordinates.length;
    center = [xCent, yCent];
}
function geocodeLatLng(geocoder) {
    const latlng = {
      lat: center[0],
      lng: center[1]
    };
  
    geocoder
      .geocode({ location: latlng })
      .then((response) => {
        getCountyState(response['results'][0]['address_components']);
      })
      .catch((e) => window.alert("Geocoder failed due to: " + e));
}
function getCountyState(input: any) {
    let countyIdx = 0;
    let stateIdx = 0;
    for(let i = 0; i < input.length; i++) {
        if(input[i]['types'][0] == "administrative_area_level_2") {
            countyIdx = i;
        }
        else if(input[i]['types'][0] == "administrative_area_level_1") {
            stateIdx = i;
        }
    }
    
    county = input[countyIdx]['long_name'];
    state = input[stateIdx]['long_name']; 
}
  
window.initMap = initMap;
export {};
