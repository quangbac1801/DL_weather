    var baseUrl = "http://localhost:8083";
    var workspace = "webgisweather";
    var layerName = "vnm_admbnda_adm1_gov_20201027";

    var styleTP = "thanhpho";

    const imgLegend = (ws, sn) => {
      return `${baseUrl}/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&STRICT=false&style=${ws}:${sn}`;
    };

    var layerOSM = new ol.layer.Tile({
      source: new ol.source.OSM(),
    });

    var layerProvince = new ol.layer.Image({
      source: new ol.source.ImageWMS({
        ratio: 1,
        url: `${baseUrl}/geoserver/${workspace}/wms`,
        params: {
          LAYERS: `${workspace}:${layerName}`,
          STYLES: styleTP,
        },
      }),
    });

    var vietnamHaNoi = ol.proj.fromLonLat([105.695835, 16.762622]);

    var map = new ol.Map({
      layers: [layerOSM, layerProvince],
      target: "map",
      view: new ol.View({
        center: vietnamHaNoi,
        zoom: 6,
      }),
    });

    var styles = {
      MultiPolygon: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: "yellow",
          width: 2,
        }),
      }),
    };

    var styleFunction = function (feature) {
      return styles[feature.getGeometry().getType()];
    };

    var vectorLayer = new ol.layer.Vector({
      style: styleFunction,
    });

    $(document).ready(function () {
      map.addLayer(vectorLayer);
      $("#legend").attr("src", imgLegend(workspace, styleTP));
    });

    map.on("singleclick", async function (evt) {
      const layer = layerProvince;
      const view = map.getView();
      const url = layer.getSource().getGetFeatureInfoUrl(
          evt.coordinate,
          view.getResolution(),
          view.getProjection(),
          { INFO_FORMAT: "application/json", FEATURE_COUNT: 50 }
      );
  
      window.listInfor = []; // Khởi tạo danh sách tỉnh
  
      if (url) {
          const resp = await $.ajax({ type: "POST", url, dataType: "json" });
          if (resp?.features.length) {
              listInfor = resp.features.map(item => item.properties);
              vectorLayer.setSource(new ol.source.Vector({
                  features: new ol.format.GeoJSON().readFeatures(resp),
              }));
              $("#modalDetail").modal("show");
          }
      }
  });
  
  $("#modalDetail").on("show.bs.modal", function () {
      const modal = $(this);
      modal.find(".modal-title").text("Thông tin chi tiết").end().find(".modal-body").html(""); 
  
      let html = `<table class="table">
                      <thead>
                          <tr>
                              <th>STT</th>
                              <th>Tên tỉnh</th>
                              <th>Nhiệt độ</th>
                              <th>Độ ẩm</th>
                              <th>Code</th>
                              <th>Thời gian dự báo</th>
                          </tr>
                      </thead>
                      <tbody>`;
  
      const Time = new Date();
  
      window.listInfor.forEach((infor, index) => {
          const adm1_pcode = infor.adm1_pcode;
          let maxTemp = '#', minTemp = '#', humidiAmount = '#';
  
          $.ajax({
              url: `/get_weather/${adm1_pcode}/`,
              type: 'GET',
              success: function (weather_data) {
                  if (weather_data.length) {
                      maxTemp = weather_data[index]?.max?.toFixed(2) || '#';
                      minTemp = weather_data[index]?.min?.toFixed(2) || '#';
                      humidiAmount = weather_data[index]?.humidi?.toFixed(2) || '#';
                  }
  
                  html += `<tr>
                              <th>${index + 1}</th>
                              <td>${infor.adm1_en}</td>
                              <td>${minTemp} - ${maxTemp}</td>
                              <td>${humidiAmount}%</td>
                              <td>${adm1_pcode}</td>
                              <td>${Time.toLocaleString()}</td>
                            </tr>`;
                  modal.find(".modal-body").html(html);
              },
              error: function () {
                  html += `<tr>
                              <th>${index + 1}</th>
                              <td>${infor.adm1_en}</td>
                              <td># - #</td>
                              <td>#</td>
                              <td>${adm1_pcode}</td>
                              <td>${Time.toLocaleString()}</td>
                            </tr>`;
                  modal.find(".modal-body").html(html);
              }
          });
      });
  });


