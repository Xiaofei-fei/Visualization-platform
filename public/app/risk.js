
            // 初始化地图容器
            var map = new AMap.Map("amap", {
                resizeEnable: true,
                center: [116.381105, 39.998579],
                zoom: 13.9,
                features: ['point', 'road'],
                mapStyle: 'amap://styles/darkblue'
            });

            // 初始化可视化容器
            var loca = new Loca.Container({
                map
            });

            // 研究区间覆盖范围
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
            roads.forEach(function (e, ind) {
                showline(nodes[e], e);
            })

            // --------------------- 异常检测呼吸点标识 ------------------
            // 黄色呼吸点
            var geoLevelE = new Loca.GeoJSONSource({
                data: bread_info
            });
            var breathYellow = new Loca.ScatterLayer({
                loca,
                opacity: 0.6,
                visible: true,
                zooms: [2, 22],
            });
            breathYellow.setSource(geoLevelE);
            breathYellow.setStyle({
                unit: 'meter',
                size: [200, 200],
                borderWidth: 0,
                texture: 'https://a.amap.com/Loca/static/loca-v2/demos/images/breath_yellow.png',
                duration: 2000,
                animate: true,
            });

            // top10 红色呼吸点
            var geoLevelF = new Loca.GeoJSONSource({
                data: T10_incid_info
            });

            var breathRed = new Loca.ScatterLayer({
                loca,
                opacity: 0.6,
                visible: true,
                zooms: [2, 22],
            });
            breathRed.setSource(geoLevelF);
            breathRed.setStyle({
                unit: 'meter',
                size: [300, 300],
                borderWidth: 0,
                texture: 'https://a.amap.com/Loca/static/loca-v2/demos/images/breath_red.png',
                duration: 1000,
                animate: true,
            });
            // 启动渲染动画
            loca.animate.start();


            //-------------------------display function -------------------------
            // 路段颜色定义（基于速度归一化值0~1，越大表明月拥堵）
            function color_selec(sp) {
                if (sp < 0.1) {
                    return '#FFAA00'
                } else if (sp < 0.2) {
                    return '#FFAA00'
                } else if (sp < 0.3) {
                    return '#FF7F00'
                } else if (sp < 0.4) {
                    return '#FF7F00'
                } else if (sp < 0.5) {
                    return '#FF5500'
                } else if (sp < 0.6) {
                    return '#FF5500'
                } else if (sp < 0.7) {
                    return '#FF2A00'
                } else if (sp < 0.8) {
                    return '#FF2A00'
                } else if (sp < 0.9) {
                    return '#FF0000'
                } else {
                    return '#FF0000'
                }
            }
            var O_markers = [];
            var D_markers = [];
            var OD_lines = [];
            var O_marker;
            var D_marker;
            var s_line;
            var incident_icons = [];
            var incident_icon;
            var infoWindow;
            var img_ind;

            // Uve框架下实现数据联动
            vm = new Vue({
                el: '#app',
                data: {
                    liList: [],
                    beforeList: [],
                    loading: false,
                    currentItem: null,
                    isShow: true,
                    isFloat: false,
                    isFloat1: false,
                    incid_info: [],
                    nrc_trees: [],
                    nodes: [],
                    sp_evolve: [],
                    // 浮窗数据
                    floatData: [],
                    imageLayer: {}
                },
                async created() {
                    this.beforeList = beforeList
                    this.liList = await this.getliList()
                },
                beforeDestroy() {
                    this.isFloat = false
                    this.isFloat1 = false
                },
                destroyed() {
                    this.isFloat = false
                    this.isFloat1 = false
                },
                methods: {

                    // 请求数据
                    getliList(keyword = '') { return Promise.resolve(Roadnet.searchItems(liList, keyword)); },

                    // 关闭浮窗
                    closeFloat() {
                        this.isFloat = false
                    },

                    closeFloat1() {
                        this.isFloat1 = false
                    },
                    searchList: function (e) {
                        this.isShow = true
                        this.isFloat = true
                        this.isFloat1 = true
                        let obj = this.beforeList.find(o => String(o.rank_no) === String(e.id))

                        this.floatData = obj
                        this.$nextTick(() => this.renderRadarChart(obj))
                        this.display_all(obj['rank_no'])
                        this.infoClose()
                    },

                    // ------------- 渲染雷达图
                    renderRadarChart(dataObj) {
 dataObj = dataObj || {};

                        const fieldMap = [
                            { name: '道路等级', field: 'roadClass', max: 1 },
                            { name: '事件类型', field: 'evt_type', max: 1 },
                            { name: '速度降幅比', field: 'speedDownRate', max: 1 },
                            { name: '拥堵长度(米)', field: 'congestionLength', max: 2450 },
                            { name: '拥堵程度', field: 'congestionDegree', max: 1 }]

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
                                        value,
                                        label: {
                                            normal: {
                                                show: true,
                                                color: '#ffff00',
                                                formatter: function (params) {
                                                    return params.value
                                                }
                                            }
                                        }
                                    }
                                ]
                            }]
                        };
                        this.radarChart.setOption(option)
                    },

                    // ------------------- 路段速度 & 图标
                    display_all(tree_ind) {
                        // 每次先清除已加载的覆盖物并初始化
                        map.remove(O_markers);
                        map.remove(D_markers);
                        map.remove(OD_lines);
                        map.remove(incident_icons);
                        O_markers = [];
                        D_markers = [];
                        OD_lines = [];
                        incident_icons = [];

                        // ----- 遍历每个案例中的异常路段，显示路段两端节点和连线
                        (nrc_trees[tree_ind] || []).forEach(function (e, ind) {

                            O_marker = new AMap.CircleMarker({
                                center: nodes[e][0],
                                fillColor: '#7FFF55',
                                strokeColor: '#7FFF55',
                                radius: 4,
                                fillOpacity: 0.5,
                                strokeOpacity: 0.5,
                                strokeWeight: 2
                            });
                            O_markers.push(O_marker); // 道路段起点汇总

                            D_marker = new AMap.CircleMarker({
                                center: nodes[e][nodes[e].length - 1],
                                fillColor: '#7FFF55',
                                strokeColor: '#7FFF55',
                                radius: 4,
                                fillOpacity: 0.5,
                                strokeOpacity: 0.5,
                                strokeWeight: 2
                            });
                            D_markers.push(D_marker); // 道路段起点汇总

                            s_line = new AMap.Polyline({
                                path: nodes[e],
                                strokeColor: color_selec(sp_evolve[tree_ind][ind]),
                                strokeWeight: 8,
                                strokeOpacity: 0.9, // 线透明度
                                bubble: false,
                                showDir: true,
                                strokeStyle: 'solid',
                                geodesic: true,
                                lineCap: 'round'
                            });
                            OD_lines.push(s_line);  // 道路段连线汇总
                        });
                        map.add(O_markers);  // 加载到地图
                        map.add(D_markers);
                        map.add(OD_lines);

                        // ***************  展示事件信息 ***************
                        ele = incid_info[tree_ind]; // 加载编号对应的事件信息
                        // 事件图标类型选择
                        if (ele[6] === '101') {
                            var icon = new AMap.Icon({
                                image: "assets/data/acc.png",
                                imageSize: new AMap.Size(25, 25)
                            });
                        } else if (ele[6] === '201') {
                            var icon = new AMap.Icon({
                                image: "assets/data/road_work.png",
                                imageSize: new AMap.Size(25, 25)
                            });
                        } else if (ele[6] === '401') {
                            var icon = new AMap.Icon({
                                image: "assets/data/expo.png",
                                imageSize: new AMap.Size(25, 25)
                            });
                        }
                        // 把图标加载到地图
                        incident_icon = new AMap.Marker({
                            icon: icon,
                            position: [ele[4], ele[5]],
                            offset: new AMap.Pixel(-7, -7)
                        });
                        incident_icons.push(incident_icon);
                        map.add(incident_icons);
                        img_ind = tree_ind;
                        incident_icon.on('click', this.drawImage);
                    },

                    //在指定位置打开信息窗体
                    drawImage() {
                        this.infoClose();
                        const file = Roadnet.animations[String(img_ind)];
                        const content = document.createElement('div');
                        if (file) {
                            const image = document.createElement('img');
                            image.src = file; image.alt = '事件 ' + img_ind + ' 的路况动态';
                            image.width = 300; image.height = 300; content.append(image);
                        } else content.textContent = '该事件暂无动态图片';
                        infoWindow = new AMap.InfoWindow({anchor:'bottom-left', autoMove:true, content});
                        infoWindow.open(map, incident_icon.getPosition());
                    },
                    infoClose() { if (infoWindow) infoWindow.close(); },

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
