window.RoadnetModules = window.RoadnetModules || {};
window.RoadnetModules['optimization'] = function initialize() {
var map = new AMap.Map("amap", {
      resizeEnable: true,
      center: [116.397428, 39.90923],
      zoom: 12,
      mapStyle: 'amap://styles/4e20baf67ef643952ae6357398c3c1c9'
    });

    window.vm = new Vue({
      el: '#app',
      data: {
        liList: [],
        isShow: false,
        isFloat1: false,
        isFloat: false,
        route: route,//{}
        afterData: afterData, // 饼图数据
        beforeList,
        floatPieData: [],
        ysxwFlag: false,
        yhxwFlag: false,
        loading: false,
        lineRequestId: 0,
        currentItem: null,
        // 浮窗数据
        floatData: {}
      },
      /*
      created() {
        this.fetchRouteObjApi()
        this.fetchListApi()
        this.fetchAfterDataApi()
      },
      mounted() {
        this.$nextTick(() => this.drawCharts())
      },
      beforeDestroy() {
        this.isFloat = false
      },
      destroyed() {
        this.isFloat = false
      },
      */
      async created() {
        this.liList = await this.getliList()
      },
      mounted() {
        this.$nextTick(() => this.drawCharts())
      },
      beforeDestroy() {
        this.isFloat1 = false
        this.isFloat = false
      },
      destroyed() {
        this.isFloat1 = false
        this.isFloat = false
      },
      methods: {
        /*虚拟请求部分
        fetchRouteObjApi() {
          let t = this
          // 请求route的信息
          axios.get('/data/routeData.json')
            .then(function (res) {
              t.route = res.data
            })
            .catch(function (err) {

            });
        },
          // 请求优化后的数据
        fetchAfterDataApi() {
          let t = this
          axios.get('/data/afterData.json')
            .then(function (res) {
              t.afterData = res.data
            })
            .catch(function (err) {

            });
        },
          // 请求liList的信息
        fetchListApi() {
          let t = this
          // 请求route的信息
          axios.get('/data/initAfterData.json')
            .then(function (res) {
              t.liList = res.data
            })
            .catch(function (err) {

            });
        },
        */
        // 请求数据
        getliList(keyword = '') { return Promise.resolve(Roadnet.searchItems(liList, keyword)); },
        searchList(e) {
          const name = e.target.innerText
          let currentItem = this.liList.find((o, index) => o.val === e.target.innerText)
          this.currentItem = currentItem
          this.ysxwFlag = true
          this.yhxwFlag = true
          this.clearYsxw()
          this.clearYhxw()
          this.renderYsxw(name)
          this.renderYhxw(name)
        },
        onSelectBarChange(e) {
          const type = e.target.value
          const checked = e.target.checked

          const name = this.currentItem && this.currentItem.val
          if (!name) return
          const _handle1 = () => {
            this.isFloat1 = checked
            checked ? this.renderYsxw(name) : this.clearYsxw()
          }
          const _handle2 = () => {
            this.isFloat = checked
            checked ? this.renderYhxw(name) : this.clearYhxw()
          }
          switch (type) {
            case 'ysxw':
              _handle1()
              break;
            case 'yhxw':
              _handle2()
              break;
            default:
              break;
          }
        },
        // 渲染原始线网
        renderYsxw(name) {
          if (!name) return
          const requestId = ++this.lineRequestId;
          if (!this.linesearch) {
            this.linesearch = new AMap.LineSearch({
              pageIndex: 1,
              city: '北京',
              pageSize: 2,
              extensions: 'all'
            });
          }
          const matcher = name.match(/\((.+)--(.+)\)/)
          const start_stop = matcher[1]
          const end_stop = matcher[2]
          const nametmp = name.match(/([^\(]+)/)[1]
          //搜索“536”相关公交线路
          this.linesearch.search(nametmp, (status, result) => {
            if (requestId !== this.lineRequestId || !this.ysxwFlag || !this.currentItem || this.currentItem.val !== name) return;
            if (status === 'complete' && result.info === 'OK') {
              result = result.lineInfo.filter(item => item.start_stop.includes(start_stop) && item.end_stop.includes(end_stop))
              this.lineSearch_Callback(result);
            } else {
              alert('原始线网：' + status);
            }
          });
          let obj = this.beforeList.find((o, index) => o.line_name === name)
          this.$nextTick(() => this.renderRadarChart(obj))
          this.floatData = obj
        },
        // 渲染雷达图
        renderRadarChart(dataObj) {
 dataObj = dataObj || {};

          const fieldMap = [
            { name: '总目标值', field: 'sum', max: 10 },
            { name: '行程时间/稳定性', field: 'travelTimeStability', max: 1 },
            { name: '归一化/线路需求量', field: 'normalizedLineCommutingDemand', max: 1 },
            { name: '线路通勤/时间比倒数', field: 'lineCommutingTimeRatioReciprocal', max: 1 },
            { name: '归一化客流/服务人次', field: 'normalizedPassengerFlowServicePersonTimes', max: 1 }]

          const indicator = []
          const value = []
          fieldMap.forEach(item => {
            indicator.push({
              name: item.name,
              max: item.max
            })
            value.push(dataObj[item.field] || 0)
          })
          this.radarChart = (echarts.getInstanceByDom(document.getElementById('radarChart')) || echarts.init(document.getElementById('radarChart')));
          const option = {
            radar: {
              radius: '85',
              indicator,
              name: {
                textStyle: {
                  color: '#fff',
                  fontSize: 12,
                },
                formatter(params) {
                  return params.replace(/\//g, "\n");
                },
              }
            },
            series: [{
              type: 'radar',
              itemStyle: {
                color: '#F9713C'
              },
              data: [
                {
                  value
                }
              ]
            }]
          };
          this.radarChart.setOption(option)
        },
        clearYsxw() {
          this.lineRequestId += 1;
          if (this.yslxOverlayroup) {
            this.yslxOverlayroup.clearOverlays()
          }
        },
        // 渲染优化线网
        renderYhxw(name) {
          if (!name) return
          if (this.polyline) {
            map.remove(this.polyline);
          }
          if (this.startMarker) {
            map.remove(this.startMarker);
          }
          if (this.endMarker) {
            map.remove(this.endMarker);
          }

          this.polyline = new AMap.Polyline({
            path: this.route[name],
            strokeColor: "#3366FF",
            strokeOpacity: 1,
            strokeWeight: 4,
            strokeStyle: "dashed",
            strokeDasharray: [20, 3],
            showDir: true,
            isOutline: true,
            outlineColor: '#fff',
            borderWeight: 1.5,
            zIndex: 50
          });
          this.polyline.setMap(map);
          map.setFitView([this.polyline]);
          // 构造点标记
          this.startMarker = new AMap.Marker({
            icon: "https://webapi.amap.com/theme/v1.3/markers/b/start.png",
            position: this.route[name][0],
            anchor: 'bottom'
          });
          this.endMarker = new AMap.Marker({
            icon: "https://webapi.amap.com/theme/v1.3/markers/b/end.png",
            position: this.route[name][this.route[name].length - 1],
            anchor: 'bottom'

          });
          map.add(this.startMarker);
          map.add(this.endMarker);
          let obj = this.afterData.find((o, index) => o.line_name === name)
          this.floatPieData = obj
          this.isShow = false;
          this.isFloat1 = this.ysxwFlag
          this.isFloat = true
          this.$nextTick(() => this.drawCharts())
        },
        clearYhxw() {
          if (this.polyline) {
            map.remove(this.polyline);
          }
          if (this.startMarker) {
            map.remove(this.startMarker);
          }
          if (this.endMarker) {
            map.remove(this.endMarker);
          }
        },
        drawCharts() {
          if (!this.floatPieData || this.floatPieData.oldData == null) return;
          // 基于准备好的dom，初始化echarts实例
          let myChart = (echarts.getInstanceByDom(document.getElementById("firstPie")) || echarts.init(document.getElementById("firstPie")));
          let myChart2 = (echarts.getInstanceByDom(document.getElementById("twoPie")) || echarts.init(document.getElementById("twoPie")));
          let myChart3 = (echarts.getInstanceByDom(document.getElementById("threePie")) || echarts.init(document.getElementById("threePie")));
          // 旧指标数据
          let e = this.floatPieData.oldData;
          // 新指标数据
          let e2 = this.floatPieData.newData;
          // 差值数据
          let e3 = this.floatPieData.dataChange;
          // 判断差值是否是负数 动态修改颜色
          let colorSel = e3 > 0 ? '#90EE90' : '#B22222'

          let option = {
            title: {
              show: true,
              // 标题
              text: '旧指标值',
              // 副标题
              subtext: e,
              left: 'center',
              top: '37%',
              // 标题样式
              textStyle: {
                fontSize: "13",
                color: "white",
                align: 'center',
                fontWeight: "400",
                fontFamily: "DINPro, DINPro-Regular",
              },
              // 副标题样式
              subtextStyle: {
                color: "white",
              }
            },
            tooltip: {
              trigger: "item",
              formatter: "{d}%",
              show: false,
            },
            legend: {
              orient: "vertical",
              x: "left",
              show: false,
            },
            series: {
              name: "",
              type: "pie",
              radius: ["90%", "98%"],
              avoidLabelOverlap: true,
              hoverAnimation: false,
              label: {
                normal: {
                  show: false,
                  position: "center",
                },
                emphasis: {
                  show: false,
                },
              },
              labelLine: {
                normal: {
                  show: false,
                },
              },
              data: [
                {
                  value: e * 10,
                  name: "",
                  itemStyle: {
                    color: "#6790D8",
                  },
                },
                {
                  value: 100 - e * 10,
                  name: "",
                  itemStyle: {
                    color: "#1a3861",
                  },
                },
              ],
            },
          };
          let option2 = {
            title: {
              show: true,
              // 标题
              text: '新指标值',
              // 副标题
              subtext: e2,
              left: 'center',
              top: '37%',
              // 标题样式
              textStyle: {
                fontSize: "13",
                color: "white",
                align: 'center',
                fontWeight: "400",
                fontFamily: "DINPro, DINPro-Regular",
              },
              // 副标题样式
              subtextStyle: {
                color: "white",
              }
            },
            tooltip: {
              trigger: "item",
              formatter: "{d}%",
              show: false,
            },
            legend: {
              orient: "vertical",
              x: "left",
              show: false,
            },
            series: {
              name: "",
              type: "pie",
              radius: ["90%", "98%"],
              avoidLabelOverlap: true,
              hoverAnimation: false,
              label: {
                normal: {
                  show: false,
                  position: "center",
                },
                emphasis: {
                  show: false,
                },
              },
              labelLine: {
                normal: {
                  show: false,
                },
              },
              data: [
                {
                  value: e2 * 10,
                  name: "",
                  itemStyle: {
                    color: "#ac5353",
                  },
                },
                {
                  value: 100 - e2 * 10,
                  name: "",
                  itemStyle: {
                    color: "#1a3861",
                  },
                },
              ],
            },
          };
          let option3 = {
            title: {
              show: true,
              // 标题
              text: '指标变化',
              // 副标题
              subtext: e3,
              left: 'center',
              top: '37%',
              // 标题样式
              textStyle: {
                fontSize: "13",
                color: "white",
                align: 'center',
                fontWeight: "400",
                fontFamily: "DINPro, DINPro-Regular",
              },
              // 副标题样式
              subtextStyle: {
                color: "white",
              }
            },
            tooltip: {
              trigger: "item",
              formatter: "{d}%",
              show: false,
            },
            legend: {
              orient: "vertical",
              x: "left",
              show: false,
            },
            series: {
              name: "",
              type: "pie",
              radius: ["90%", "98%"],
              avoidLabelOverlap: true,
              hoverAnimation: false,
              label: {
                normal: {
                  show: false,
                  position: "center",
                },
                emphasis: {
                  show: false,
                },
              },
              labelLine: {
                normal: {
                  show: false,
                },
              },
              data: [
                {
                  value: e3 * 10,
                  name: "",
                  itemStyle: {
                    color: colorSel,
                  },
                }
              ],
            },
          };
          myChart.setOption(option);
          myChart2.setOption(option2);
          myChart3.setOption(option3);
        },
        /*公交路线查询服务返回数据解析概况*/
        lineSearch_Callback(dataArr) {
          var lineArr = dataArr;
          var lineNum = dataArr.length;
          if (lineNum == 0) {
          } else {
            for (var i = 0; i < lineNum; i++) {
              var pathArr = lineArr[i].path;
              var stops = lineArr[i].via_stops;
              var startPot = stops[0].location;
              var endPot = stops[stops.length - 1].location;
              if (i == 0) //作为示例，只绘制一条线路
                this.drawbusLine(startPot, endPot, pathArr);

            }
          }
        },
        /*绘制路线*/
        drawbusLine(startPot, endPot, BusArr) {
          //绘制起点，终点
          if (!this.yslxOverlayroup) {
            this.yslxOverlayroup = new AMap.OverlayGroup()
            this.yslxOverlayroup.setMap(map)
          }
          this.yslxOverlayroup.clearOverlays()
          const m1 = new AMap.Marker({
            map: map,
            position: startPot, //基点位置
            icon: "https://webapi.amap.com/theme/v1.3/markers/n/start.png",
            zIndex: 10
          });
          const m2 = new AMap.Marker({
            map: map,
            position: endPot, //基点位置
            icon: "https://webapi.amap.com/theme/v1.3/markers/n/end.png",
            zIndex: 10
          });
          //绘制乘车的路线
          const busPolyline = new AMap.Polyline({
            map: map,
            path: BusArr,
            showDir: true,
            strokeColor: "#09f",//线颜色
            strokeOpacity: 0.8,//线透明度
            isOutline: true,
            outlineColor: 'white',
            strokeWeight: 6//线宽
          });
          this.yslxOverlayroup.addOverlays([m1, m2, busPolyline])
          map.setFitView();
        },
        // 关闭浮窗
        closeFloat1() {
          this.isFloat1 = false
        },
        // 关闭浮窗
        closeFloat() {
          this.isFloat = false
        },
        focusStart() {
          this.reliList = this.liList
          this.isShow = true;
        },
        filter(e) {
          this.getliList(e.target.value).then(res => {
            this.liList = res
          })
        }
      }
    });
};
