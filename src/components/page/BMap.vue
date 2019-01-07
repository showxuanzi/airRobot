<!-- 页面模版 -->
<template>
    <div>
        <div id="allmap" style="width: 100%; height:1000px; border: 1px solid gray;overflow:hidden;"></div>
        <div id="box" v-show="isShow">
            <div class="box">
                <h3 class="box-title">{{pointDetail.devicename}}</h3>
                <div class="clear">
                    <div class="box-img">
                        <img src=" data_info[i][3] ">
                    </div>
                    <div class="box-para">
                        <ul>
                            <li><span>温度：</span><strong> {{pointDetail.temperature}}  </strong></li>
                            <li><span>湿度：</span><strong> {{pointDetail.shidu}}  </strong></li>
                            <li><span>PM2.5：</span><strong> {{pointDetail.pm25}}  </strong></li>
                            <li><span>PM10：</span><strong> {{pointDetail.pm10}}  </strong></li>
                            <li><span>SO2：</span><strong> {{pointDetail.so2}} </strong></li>
                            <li><span>NO2：</span><strong> {{pointDetail.no2}}  </strong></li>
                            <li><span>CO：</span><strong> {{pointDetail.co}}  </strong></li>
                            <li><span>O3：</span><strong> {{pointDetail.o3}}  </strong></li>
                        </ul>
                    </div>
                </div>
                <div class="box-address"> {{pointDetail.address}} </div>
            </div>
        </div>
    </div>
</template>
<script>
import BMap from 'BMap'
export default {
    data: () => ({
        isShow: false, 
        dataList: [],
        pointDetail: {}
    }),
    mounted () {
        this.map();
  },
  methods: {
    map(){
    let map = new BMap.Map("allmap"); // 创建Map实例
        map.centerAndZoom(new BMap.Point(117.162605,39.166283), 15);// 初始化地图,设置中心点坐标和地图级别
        map.addControl(new BMap.MapTypeControl({//添加地图类型控件
            mapTypes:[
                BMAP_NORMAL_MAP,
                BMAP_HYBRID_MAP
            ]}));
        map.setCurrentCity("天津");// 设置地图显示的城市 此项是必须设置的
        map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
        this.$axios.get("http://192.168.1.102:8080/device/alldevice.do")
        .then((res)=>{
            for(let i = 0; i < res.data.length; i++){
                var lon = res.data[i].position.split(",")[0];
                var lat = res.data[i].position.split(",")[1];
                var id = res.data[i].id;
                this.dataList.push({
                    id: id,
                    lon: lon,
                    lat: lat
                })
            }
            console.log(this.dataList)
            for (let i = 0; i < this.dataList.length;i++) {
                var points = new BMap.Point(this.dataList[i].lon,this.dataList[i].lat);//创建坐标点
                markerFun(points,this.dataList[i].id);
            }
        });
        let _this = this;
        function markerFun (points,id) {
            var markers = new BMap.Marker(points);
            map.addOverlay(markers);
            markers.customData = {markerId: id};
            
            markers.addEventListener("click", function (e) { 
                console.log(this);
                console.log(e.target.customData.markerId);
                // _this.mapDetail(e.target.customData.markerId);
                _this.$axios.get("http://192.168.1.102:8080/device/environmentDetail.do?",{
                    params:{deviceId: e.target.customData.markerId}
                }).then((res)=>{
                    console.log(res.data)
                    _this.pointDetail = res.data;
                    // this.isShow = true;
                    console.log(_this.pointDetail );
                    _this.$nextTick(() => {
                        var content = document.getElementById("box").innerHTML;
                        console.log(content);
                        console.log(this)
                        var infoWindow = new BMap.InfoWindow(content);
                        this.openInfoWindow(infoWindow); 
                    })
                    
                })
                
            });
        }
    },
    // mapDetail(id){
    //     this.$axios.get("http://192.168.1.102:8080/device/environmentDetail.do?",{
    //         params:{deviceId: id}
    //     }).then((res)=>{
    //         console.log(res.data)
    //         this.pointDetail = res.data;
    //         // this.isShow = true;
    //     })
    // }
  },
}
</script>
<style>
  /* 去掉地图左下角的百度LOGO */
  .anchorBL {
    display:none
  }
  body, html {width: 100%;height: 100%;margin:0;font-family:"微软雅黑";}
        body,html,head,header,section,footer,h1,h2,h3,h4,h5,h6,div,p,a,img,ul,li,ol,dl,dd,dt,form,input,button,textarea,select,option,table,thead,tbody,tfoot,th,tr,td,span{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-box-sizing: border-box;
        }
        li{
            list-style: none;
        }
    #allmap{width:100%;height:500px;}
        .box{
            width: 600px;
            padding: 10px;
            border-radius: 20px;
        }
        .box-title{
            line-height: 50px;
            color: #f80b0b;
        }
        .clear:after{
            display: block;
            content: ".";
            clear: both;
            overflow: hidden;
            visibility: hidden;
        }
        .box-img{
            float: left;

        }
        .box-img>img{
            width: 210px;
            height: 140px;
            margin-top: 15px;
        }
        .box-para{
            float: left;
            width: 340px;
            padding-left: 20px;
        }
        .box-para>ul>li{
            width: 50%;
            float: left;
            line-height: 40px;
            border-bottom: 1px dashed #ccc;
        }
        .box-para>ul>li>strong{
            color: #26c4f9;
        }
        .box-address{
            text-align: center;
            line-height: 40px;
        }
</style>
