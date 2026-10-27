window.RoadnetModules = window.RoadnetModules || {};
window.RoadnetModules['roads'] = function initialize() {

      var map = new AMap.Map("amap", {
        resizeEnable: true,
        center: [116.390241, 39.996243],
        zoom: 14,
        // mapStyle: 'amap://styles/4e20baf67ef643952ae6357398c3c1c9'
        mapStyle: 'amap://styles/darkblue'
      });


      // 研究区间覆盖范围
      function coverageArea() {
        var path = [
          [116.348206, 40.025370],
          [116.412408, 40.024450],
          [116.410519, 39.967113],
          [116.377560, 39.966455],
          [116.378590, 39.976584],
          [116.373784, 39.991579],
          [116.348206, 40.025370]
        ]
        var polygon = new AMap.Polygon({
          path: path,
          strokeColor: "#FFFF00",
          strokeWeight: 2,
          strokeOpacity: 0.6,
          fillOpacity: 0.2,
          fillColor: "#1791fc",
          zIndex: 50,
          map: map
        })
      }
      coverageArea();

      //--------------------road display function-------------------
      // OD连线函数
      function showline(lineArr, rid) {
        // Line
        var polyline = new AMap.Polyline({
          path: lineArr, // 设置线覆盖物路径
          bubble: false,
          showDir: false,
          strokeColor: '#00AAFF', // 线颜色
          strokeOpacity: 0.3, // 线透明度
          strokeWeight: 3, // 线宽
          strokeStyle: 'solid', // 线样式
          geodesic: true, // 绘制大地线
          lineCap: 'round', // 折线两端样式
          map: map
        })
      }

      //---------------------- road with car display -----------------

      roads.forEach(function (e, ind) {
        showline(nodes[e], e);
      })

      // --------------------- 定义异常路段组合（称为树）显示函数 ----------
      // 起终点标记，路径使用线标记
      function showTree(nodes) {
        // Original point Marker
        var mark_O = new AMap.CircleMarker({
          center: nodes[0],
          fillColor: '#7FFF55',
          strokeColor: '#7FFF55',
          radius: 3,
          fillOpacity: 0.5,
          strokeOpacity: 0.5,
          strokeWeight: 2,
          map: map
        });
        // Destination point Marker
        var mark_D = new AMap.CircleMarker({
          center: nodes[nodes.length - 1],
          fillColor: '#7FFF55',
          strokeColor: '#7FFF55',
          radius: 3,
          fillOpacity: 0.5,
          strokeOpacity: 0.5,
          strokeWeight: 2,
          map: map
        });
        // link between OD
        var polyline = new AMap.Polyline({
          path: nodes,
          strokeColor: 'red',
          strokeWeight: 4,
          bubble: false,
          showDir: true,
          strokeStyle: 'solid',
          geodesic: true,
          lineCap: 'round',
          map: map
        });
        return [mark_O, mark_D, polyline]
      }

      // 函数：显示事件信息： icon + info_window
      function showicon(ele) {
        if (ele[6] === '101') {
          var icon = new AMap.Icon({
            size: new AMap.Size(60, 60),    // 图标尺寸
            image: "assets/data/acc.png",
            imageSize: new AMap.Size(25, 25) // 根据所设置的大小拉伸或压缩图片
          });
        } else if (ele[6] === '201') {
          var icon = new AMap.Icon({
            size: new AMap.Size(40, 50),    // 图标尺寸
            image: "assets/data/road_work.png",
            imageSize: new AMap.Size(25, 25)
          });
        } else if (ele[6] === '401') {
          var icon = new AMap.Icon({
            size: new AMap.Size(40, 50),    // 图标尺寸
            image: "assets/data/expo.png",
            imageSize: new AMap.Size(25, 25)
          });
        }

        var marker = new AMap.Marker({
          icon: icon,
          position: [ele[4], ele[5]],
          offset: new AMap.Pixel(-7, -7),
          zIndex: 10,
          //title: ele[7],
          map: map
        });

        //鼠标点击marker弹出自定义的信息窗体
        var title = '交通状态异常识别时间：<span style="font-size:11px;color:#F00;">' + ele[0] + '</span>',
          content = [];
        content.push("<img src='assets/data/key.png'>" + "事件描述：" + ele[7]);
        //content.push("事件描述："+ele[7]);

        content.push("上报时间：" + ele[2]);
        content.push("结束时间：" + ele[3]);

        var infoWindow = new AMap.InfoWindow({
          anchor: 'bottom-left',
          isCustom: true,  //使用自定义窗体
          content: createInfoWindow(title, content.join("<br/>")), // 调用createInfoWindow()
          offset: new AMap.Pixel(20, -25)
        });

        AMap.event.addListener(marker, 'click', function () {
          infoWindow.open(map, marker.getPosition()); //加载inforWindow
        });
      }


      //构建自定义信息窗体
      function createInfoWindow(title, content) {
        var info = document.createElement("div");
        info.className = "custom-info input-card content-window-card";

        //可以通过下面的方式修改自定义窗体的宽高
        info.style.width = "300px";
        // 定义顶部标题
        var top = document.createElement("div");
        var titleD = document.createElement("div");
        var closeX = document.createElement("img");
        top.className = "info-top";
        titleD.innerHTML = title;
        closeX.src = "https://webapi.amap.com/images/close2.gif";
        closeX.onclick = closeInfoWindow;

        top.appendChild(titleD);
        top.appendChild(closeX);
        info.appendChild(top);

        // 定义中部内容
        var middle = document.createElement("div");
        middle.className = "info-middle";
        middle.style.backgroundColor = 'white';
        middle.innerHTML = content;
        info.appendChild(middle);

        // 定义底部内容,信息窗下面的尖端
        var bottom = document.createElement("div");
        bottom.className = "info-bottom";
        bottom.style.position = 'relative';
        bottom.style.top = '0px';
        bottom.style.margin = '0 auto';
        var sharp = document.createElement("img");
        sharp.src = "https://webapi.amap.com/images/sharp.png";
        bottom.appendChild(sharp);
        info.appendChild(bottom);
        return info;
      }

      //关闭信息窗体
      function closeInfoWindow() {
        map.clearInfoWindow();
      }

      function search() {
        const val = document.getElementById('tree_ind').value.trim();
        const error = document.getElementById('road-error');
        if (!/^\d+$/.test(val) || !nrc_trees[val] || !incid_info[val]) {
          error.textContent = '请输入有效事件编号（1–' + Object.keys(nrc_trees).length + '）';
          return false;
        }
        error.textContent = '';
        map.clearMap(); coverageArea();
        nrc_trees[val].forEach(e => { if (nodes[e]) showTree(nodes[e]); });
        showicon(incid_info[val]); map.setFitView();
        return false;
      }

window.search = search;
};
