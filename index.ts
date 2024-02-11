import { Chart, ChartItem } from "chart.js/auto";
var shape;
var coordinates;
var area;
var center;
var county;
var state;
var landValue;

var chartData2;
var irradianceSum = 0;


const element = document.getElementById("delete-button");
element!.addEventListener("click", deleteShape);

const element2 = document.getElementById("calculate-button");
element2!.addEventListener("click", displayGraphs);

const element3 = document.getElementById("reset-button");
//element3!.addEventListener("click", reset());

function displayGraphs() {
    const ctx = document.getElementById('myChart') as ChartItem;
    let dataLength = chartData2.length;
    let chartData3: any[] = []
    for(let i  = 0; i < 8759; i++) {
        irradianceSum += parseFloat(chartData2[i].irradiance);
        chartData3.push([chartData2[i].date, chartData2[i].irradiance]);
    }
  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: "Solar Irradiance",
        data: chartData3,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  makeTable();
}


function makeTable() {
    const element4 = document.getElementById("land-text");
    const element5 = document.getElementById("setup-text");
    const element6 = document.getElementById("yearly-text");
    element4!.innerText = "- Land Cost: " + landValue;
    element5!.innerText = "- Setup Cost: " + ((irradianceSum * (area)) / 100000) * 2.7;
    element6!.innerText = "+ Money Gained: " + ((irradianceSum * (area)) * 0.17) / 100000;
}
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
    area = google.maps.geometry.spherical.computeArea(polygon.getPath());
    geocodeLatLng(geocoder);
    drawingManager.setOptions({
        drawingControl: false
    });
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
async function getCountyState(input: any) {
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
    let data = await callAPI(center[0], center[1], county, state, area);
    landValue = data[0][0];
    let day = 0
    let chartData: any[] = []
    let chartDataIrradiance: any[] = []
    for(let i = 0; i < data[0][1].length; i++) {
       //if (i != 0 && i % 24 == 0) {
            day += 1
        //}
        let temp = {
            date: day,
            irradiance: parseFloat(data[0][1][i])
        }
        chartData.push(temp)
    }
    chartData2 = chartData;
}
  
window.initMap = initMap;
export {};

async function callAPI(latitudeTemp, longitudeTemp, countyTemp, stateTemp, areaTemp) {
let formData = new FormData();
formData.append("latitude", latitudeTemp);
formData.append("longitude", longitudeTemp);
formData.append("county", countyTemp);
formData.append("state", stateTemp);
formData.append("area", areaTemp);
let data = new URLSearchParams(formData as any);
let ret = await fetch("http://127.0.0.1:5000/", {
  method: "POST",
  body: data,
})
let jsonRet = ret.json();
return jsonRet
}
