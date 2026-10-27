window.RoadnetModules = window.RoadnetModules || {};
window.RoadnetModules['transit'] = function initialize() {
var map = new AMap.Map("amap", {
            resizeEnable: true,
            center: [116.397428, 39.90923],
            zoom: 12,
            mapStyle: 'amap://styles/4e20baf67ef643952ae6357398c3c1c9'
            // mapStyle: 'amap://styles/darkblue'
        });
        var transOptions = {
            map: map,
            city: '北京市',
            panel: 'panel',
            policy: AMap.TransferPolicy.LEAST_TIME //乘车策略
        };

        vm = new Vue({
            el: '#app',
            data: {
                liList: [],
                beforeList: [],
                line: [{
                    keyword: '东湖',
                    city: '北京'
                },
                //第一个元素city缺省时取transOptions的city属性
                {
                    keyword: '北官厅',
                    city: '北京'
                },
                ],
                loading: false,
                lineRequestId: 0,
                currentItem: null,
                isShow: false,
                isFloat: false,
                // 浮窗数据
                floatData: []
            },
            async created() {
                this.beforeList = beforeList
                this.liList = await this.getliList()
            },
            beforeDestroy() {
                this.isFloat = false
            },
            destroyed() {
                this.isFloat = false
            },
            methods: {
                // 请求数据
                getliList(keyword = '') { return Promise.resolve(Roadnet.searchItems(liList, keyword)); },
                // 关闭浮窗
                closeFloat() {
                    this.isFloat = false
                },
                searchList: function (e) {
                    this.isShow = false;
                    this.isFloat = true
                    let currentItem = this.liList.find((o, index) => o.val === e.target.innerText)
                    this.currentItem = currentItem
                    const requestId = ++this.lineRequestId;
                    map.clearMap();
                    var linesearch = new AMap.LineSearch({
                        pageIndex: 1,
                        city: '北京',
                        pageSize: 2,
                        extensions: 'all'
                    });
                    const { val } = currentItem
                    const matcher = val.match(/\((.+)--(.+)\)/)
                    const start_stop = matcher[1]
                    const end_stop = matcher[2]

                    //搜索“536”相关公交线路
                    const name = val.match(/([^\(]+)/)[1]
                    linesearch.search(name, (status, result) => {
                        if (requestId !== this.lineRequestId || this.currentItem !== currentItem) return;
                        map.clearMap()

                        if (status === 'complete' && result.info === 'OK') {
                            result = result.lineInfo.filter(item => item.start_stop.includes(start_stop) && item.end_stop.includes(end_stop))
                            this.lineSearch_Callback(result);
                        } else {
                            alert(status);
                        }
                    });
                    // const transfer = new AMap.Transfer(transOptions);
                    // transfer.clear()
                    // transfer.search(new AMap.LngLat(...currentItem.start), new AMap.LngLat(...currentItem.end));
                    let obj = this.beforeList.find((o, index) => o.line_name === e.target.innerText)
                    this.floatData = obj
                    this.$nextTick(() => this.renderRadarChart(obj))
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
                            radius: '80',
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
                    new AMap.Marker({
                        map: map,
                        position: startPot, //基点位置
                        icon: "https://webapi.amap.com/theme/v1.3/markers/n/start.png",
                        zIndex: 10
                    });
                    new AMap.Marker({
                        map: map,
                        position: endPot, //基点位置
                        icon: "https://webapi.amap.com/theme/v1.3/markers/n/end.png",
                        zIndex: 10
                    });
                    //绘制乘车的路线
                    busPolyline = new AMap.Polyline({
                        map: map,
                        path: BusArr,
                        showDir: true,
                        strokeColor: "#09f",//线颜色
                        strokeOpacity: 0.8,//线透明度
                        isOutline: true,
                        outlineColor: 'white',
                        strokeWeight: 6//线宽
                    });
                    map.setFitView();
                },
                focusStart() {
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
