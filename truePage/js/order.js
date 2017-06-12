/**
 * Created by HuWen on 2017/4/28.
 */
angular.module("orderApp", ['config','api','fang'])
    .controller('orderCtr', [ '$scope', '$http','UrlConstant','$timeout','$interval',function( $scope, $http,UrlConstant,$timeout,$interval) {

        // if(GetQueryString("treatStatus")){
        //     console.log("从url获取userid");
        //     $scope.userId=GetQueryString("userId");
        //     $scope.userCid=GetQueryString("userCid");
        //     $scope.treatStatus=GetQueryString("treatStatus");
        //     $scope.inviteAddress=GetQueryString("inviteAddress") ;
        //     $scope.inviteMoney= GetQueryString("inviteMoney");
        //     $scope.inviteUserName= GetQueryString("inviteUserName");
        //     $scope.inviteTime= GetQueryString("inviteTime");
        //     storeElem("userId",$scope.userId);
        //     storeElem("userCid",$scope.userCid);
        //     storeElem("treatStatus",$scope.treatStatus);
        //     storeElem("inviteAddress",$scope.inviteAddress);
        //     storeElem("inviteMoney",$scope.inviteMoney);
        //     storeElem("inviteUserName",$scope.inviteUserName);
        //     storeElem("inviteTime",$scope.inviteTime);
        // }else{
        //     console.log("从缓存中获取数据");
        //     $scope.userId=getElem("userId");
        //     $scope.userCid=getElem("userCid");
        //     $scope.treatStatus=getElem("treatStatus");
        //     $scope.inviteAddress=getElem("inviteAddress");
        //     $scope.inviteMoney=getElem("inviteMoney");
        //     $scope.inviteUserName=getElem("inviteUserName");
        //     $scope.inviteTime=getElem("inviteTime");
        //     $scope.treatStatus=getElem("treatStatus");
        // }

        // 清除列表页的缓存
        localStorage.setItem('pageHtml','');
        localStorage.setItem('pageY',0);

        // 初始化变量
        $scope.canInvite=true;  //去请客按钮显示
        $scope.isShow=false;    //弹窗显示
        $scope.isShow1=true;    //预定包厢按钮显示
        $scope.isShow2=false;   //取消宝箱按钮显示
        $scope.noMei=false;     //没有妹子页面显示
        $scope.hasMei=false;    //有订单信息页面显示
        $scope.beInvited=false; //被邀请页面显示
        $scope.zhuiNoMei=false; //追加妹子情况显示
        $scope.addBaby=false;   //添加宝贝按钮
        $scope.can=false;       //地址和房间号为不能填写
        $scope.tipShow=false;   //弹窗显示
        $scope.loadShow=true;   //加载图片
        $scope.sureAgainShow=false;


        $scope.invitedDetailList=[];
        $scope.babyIdList=[];
        $scope.count=0;
        $scope.totalNum=0;
        $scope.payMoney=0;
        $scope.addpriceBaby=0;
        $scope.contentTip='';
        $scope.time='';
        $scope.address='';
        $scope.number='';
        $scope.orderId='';
        $scope.addressId=0;
        $scope.inviteTotal=0  //保存删除客人后价格的中间值



        $scope.orderRoom=0;//是否预定包厢
        $scope.roomPrice=0;//预定房间的价格

        $scope.timer=$interval(function(){
            if($scope.userId){
               	$scope.loadShow=false;
                $interval.cancel($scope.timer);
                // **********************读取用户数据*********************
                // 获取用户数据
                if($scope.userId){
                    $http.post(UrlConstant.url + "/user/myInfo.do", {json:JSON.stringify({
                        "userId":$scope.userId
                    })}).success(function(data){
                        console.log(data);
                        $scope.phone=data.data.phone;
                        $scope.name=data.data.nickName;
                        storeElem("phone",$scope.phone);
                        storeElem("name",$scope.name);
                    })
                }

                // **********************包厢中对宝贝的操作*********************
                // 主请人查看当前已约宝贝
                $scope.scaleArray=[];
                $scope.hasBaby=function(num){
                    $http.post(UrlConstant.url + "/order/shopCart.do", {json:JSON.stringify({
                        "userId":$scope.userId
                    })}).success(function(data){
                        console.log(data);
                        $scope.babyList=data.data;
                        if($scope.babyList.length>0){//有妹子的情况
                            $scope.hasMei=true;
                            $scope.noMei=false;
                            $scope.beInvited=false;
                            $scope.babyShow=true;
                            $scope.totalNum+=$scope.babyList.length; //计算总件数
                            // 服务范围数组
                            console.log($scope.babyList.length);
                            for(var i=0;i< $scope.babyList.length;i++){
                                $scope.babyIdList.push($scope.babyList[i].babyId);
                                $scope.payMoney+= $scope.babyList[i].payMoney;
                                $scope.scaleArray.push($scope.babyList[i].scale.split(","));
                            }

                            // 将宝贝的价格加入总价
                            $scope.count= $scope.payMoney;
                            $scope.addpriceBaby= $scope.count;
                            // 第一次预定场地
                            if($scope.babyList.length==1) {
                                storeElem("placeName", $scope.babyList[0].place);
                            }

                            if($scope.treatStatus==3){
                                $scope.moreBaby=true;
                            }
                        }else{//没有妹子
                            if($scope.treatStatus==2){  /*被请客购物车为空时*/
                                $scope.hasMei=false;
                                $scope.noMei=false;
                                $scope.beInvited=true;
                            }else if($scope.treatStatus==3){ /*追加订单时*/
                                $scope.hasMei=true;
                                $scope.noMei=false;
                                $scope.beInvited=false;
                                $scope.babyShow=false;
                                $scope.zhuiNoMei=false;
                                $scope.addBaby=true;
                                $scope.moreBaby=false;
                                if($scope.invitedDetailList.length>0){
                                    $scope.inviteShow=true;
                                }else{
                                    $scope.inviteShow=false;
                                }
                            }else{//主请客人第一次购物车为空时
                                localStorage.removeItem("placeName");
                                $scope.hasMei=false;
                                $scope.beInvited=false;
                                $scope.noMei=true;
                                if(num==1){
                                    $scope.time='';
                                    $scope.address='';
                                    $scope.number='';
                                    localStorage.removeItem("time");
                                    localStorage.removeItem("address");
                                    localStorage.removeItem("number");
                                    localStorage.removeItem("addressId");
                                    localStorage.removeItem("roomPrice");
                                    localStorage.removeItem("orderRoom");
                                }
                            }
                        }
                    });
                };

                // 被邀请人加入妹子查询
                $scope.inviteHasBaby=function(num){
                    $http.post(UrlConstant.url + "/order/shopCart.do", {json:JSON.stringify({
                        "userId":$scope.userId
                    })}).success(function(data){
                        console.log(data);
                        $scope.babyList=data.data;
                        if($scope.babyList.length>0){
                            $scope.babyShow=true;
                            if(num==2){
                                $scope.moreBaby=true;
                            }
                            $scope.addBaby=false;
                            $scope.totalNum+=$scope.babyList.length; //计算总件数
                            // 服务范围数组
                            for(var i=0;i< $scope.babyList.length;i++){
                                $scope.babyIdList.push($scope.babyList[i].babyId);
                                $scope.payMoney+= $scope.babyList[i].payMoney;
                                $scope.scaleArray.push($scope.babyList[i].scale.split(","));
                            }
                            // 将宝贝的价格加入总价
                            $scope.count= $scope.payMoney;
                            $scope.addpriceBaby= $scope.count;
                        }else{
                            $scope.addBaby=true;
                            $scope.moreBaby=false;
                        }
                    });
                }


// **************************先判断身份是请客人还是被请客人*************************
                if( $scope.treatStatus==1){//主请客人第一次下单，主请客人追单，被请客人追单
                    // 查看当前订单详情
                    $http.post(UrlConstant.url + "/order/currentOrder.do", {json:JSON.stringify({
                        "userId":$scope.userId
                    })}).success(function(data){
                        console.log(data);
                        $scope.currentOrder=data.data.currentOrder;
                        if(data.data.treatStatus==1){//主请客人
                            $scope.canInvite=true;
                            if(data.code=="400"){ /*正常下单*/
                                console.log("第一次下单");
                                $scope.hasBaby();
                                $scope.inviteShow=false;
                                $scope.moreBaby=false;
                            }else if(data.code=="200"){//\目前已有订单，走追加
                                console.log("主请追加订单");
                                $scope.hasBaby();
                                $scope.isShow1=false;
                                $scope.isShow2=false;
                                $scope.hasOrder=true;
                                $scope.can=true;
                                $scope.treatStatus=3;
                                $scope.currentOrder=data.data.currentOrder;
                                $scope.time=$scope.currentOrder.meetTime;
                                $scope.addressArray=$scope.currentOrder.meetAddress.split("_");
                                $scope.address=$scope.addressArray[0];
                                $scope.number=$scope.addressArray[1];
                                $scope.orderId=$scope.currentOrder.id;
                                storeElem("number", $scope.number);

                            }
                        }else if(data.data.treatStatus==2){//被请客人追单
                            console.log("被请客人追单");
                            $scope.inviteHasBaby(2);
                            $scope.canInvite=false;
                            $scope.isShow2=false; //取消包厢按钮为空
                            $scope.hasMei=true;
                            $scope.isShow1=false;
                            $scope.noMei=false;
                            $scope.hasOrder=true;
                            $scope.can=true;
                            $scope.treatStatus=3;
                            storeElem("treatStatus",$scope.treatStatus);
                            $scope.time=$scope.currentOrder.meetTime;
                            $scope.addressArray=$scope.currentOrder.meetAddress.split("_");
                            $scope.address=$scope.addressArray[0];
                            $scope.number=$scope.addressArray[1];
                            $scope.orderId=$scope.currentOrder.id;
                            storeElem("number", $scope.number)
                        }
                    });
                }else if( $scope.treatStatus==2){//被请客
                    console.log("被请客正常下单");
                    $scope.canInvite=false;
                    $scope.inviteShow=false;
                    $scope.moreBaby=false;
                    $scope.isShow2=false;//取消包厢按钮为空
                    $scope.noMei=false;
                    $scope.time=$scope.inviteTime;
                    $scope.addressList=$scope.inviteAddress.split("_");
                    $scope.address=$scope.addressList[0];
                    $scope.number=$scope.addressList[1];
                    $scope.hasOrder=true;
                    $scope.can=true;
                    storeElem("number", $scope.number);
                    $http.post(UrlConstant.url + "/order/shopCart.do", {json:JSON.stringify({
                        "userId":$scope.userId
                    })}).success(function(data){
                        console.log(data);
                        $scope.nowBaby=data.data;
                        if($scope.nowBaby.length>0){
                            if($scope.nowBaby[0].place.indexOf("其他")>=0|| $scope.nowBaby[0].place.indexOf($scope.address)>=0){// 妹子的地址之前选的宝贝与现在所选地址相符合
                                // alert("地址符合条件，保留宝贝");
                                $scope.hasMei=true;
                                $scope.beInvited=false;
                                $scope.inviteHasBaby(1);
                            }else{//不符合，删除
                                // alert("地址不服，删除宝贝");
                                $scope.hasMei=false;
                                $scope.beInvited=true;
                                $scope.inviteName=$scope.inviteUserName;
                                $scope.inviteMoney=$scope.inviteMoney;
                                $http.post(UrlConstant.url + "/order/deleteBaby.do", {json:JSON.stringify({
                                    "userId":$scope.userId,
                                    "babyId":$scope.nowBaby[0].babyId
                                })}).success(function(data){
                                    console.log(data);
                                    console.log("购物车中宝贝已清空");
                                });
                            }
                        }else{
                            $scope.hasMei=false;
                            $scope.beInvited=true;
                            $scope.inviteName=$scope.inviteUserName;
                            $scope.inviteMoney=$scope.inviteMoney;
                        }
                    });
                }
            }
        },15);

        $timeout(function(){
            if($scope.treatStatus){}else{
                $scope.userId= getElem("userId");
                $scope.userCid= getElem("userCid");
                $scope.treatStatus= getElem("treatStatus");
                $scope.inviteTime= getElem("inviteTime");
                $scope.inviteAddress= getElem("inviteAddress");
                $scope.inviteMoney= getElem("inviteMoney");
                $scope.inviteName= getElem("inviteUserName");
                $scope.orderId= getElem("orderId");
            }
        },30);

        // 删除包厢中的宝贝
        $scope.deleteBaby=function(item){
            $http.post(UrlConstant.url + "/order/deleteBaby.do", {json:JSON.stringify({
                "userId":$scope.userId,
                "babyId":item.babyId
            })}).success(function(data){
                console.log(data);
                $scope.totalNum--;
                $scope.hasBabyQuery(1);
            })
        };

        // 宝贝被删除后信息查询
        $scope.hasBabyQuery=function(num){
            $http.post(UrlConstant.url + "/order/shopCart.do", {json:JSON.stringify({
                "userId":$scope.userId
            })}).success(function(data){
                $scope.payMoney=0;
                $scope.babyList=data.data;
                if($scope.babyList.length>0){//有妹子的情况
                    $scope.hasMei=true;
                    $scope.noMei=false;
                    $scope.beInvited=false;
                    $scope.babyShow=true;
                    // 服务范围数组
                    for(var i=0;i< $scope.babyList.length;i++){
                        $scope.babyIdList.push($scope.babyList[i].babyId);
                        $scope.payMoney+=parseFloat($scope.babyList[i].payMoney);
                        $scope.scaleArray.push($scope.babyList[i].scale.split(","));
                    }
                    // 将宝贝的价格加入总价
                    $scope.count= parseFloat($scope.count-$scope.addpriceBaby+$scope.payMoney).toFixed(2) ;
                    $scope.addpriceBaby= $scope.count;
                    // 第一次预定场地
                    if($scope.babyList.length==1) {
                        storeElem("placeName", $scope.babyList[0].place);
                    }
                    if($scope.treatStatus==3){
                        $scope.moreBaby=true;
                    }
                }else{//没有妹子
                    if($scope.invitedDetailList.length>0){
                        $scope.count= $scope.inviteTotal;
                    }else{
                        $scope.count=0;
                    }
                    $scope.addpriceBaby= 0 ;
                    if($scope.treatStatus==2){  /*被请客购物车为空时*/
                        $scope.hasMei=false;
                        $scope.noMei=false;
                        $scope.beInvited=true;
                    }else if($scope.treatStatus==3){ /*追加订单时*/
                        $scope.hasMei=true;
                        $scope.noMei=false;
                        $scope.beInvited=false;
                        $scope.babyShow=false;
                        $scope.zhuiNoMei=false;
                        $scope.addBaby=true;
                        $scope.moreBaby=false;
                        if($scope.invitedDetailList.length>0){
                            $scope.inviteShow=true;
                        }else{
                            $scope.inviteShow=false;
                        }
                    }else{//主请客人第一次购物车为空时
                        localStorage.removeItem("placeName");
                        $scope.hasMei=false;
                        $scope.beInvited=false;
                        $scope.noMei=true;
                        if(num==1){
                            $scope.time='';
                            $scope.address='';
                            $scope.number='';
                            localStorage.removeItem("time");
                            localStorage.removeItem("address");
                            localStorage.removeItem("number");
                            localStorage.removeItem("addressId");
                            localStorage.removeItem("roomPrice");
                            localStorage.removeItem("orderRoom");
                        }
                    }
                }
            });
        };

// **********************选择包厢*************************
        // 已有包厢号，选择包厢
        $scope.addressChoose=function(){
            if(getElem("placeName").indexOf("其他")>=0){//妹子场地不限
                storeElem("type",2);
                location.href="search.html?"+ addT();
            }else{//妹子有固定场地
                storeElem("type",2);
                location.href="searchLimit.html?"+ addT();
            }
        };

        // 存储房间号
        $scope.store=function(){
            storeElem("number",$scope.number);
        };

        // 预定包厢
        $scope.order=function(){
            localStorage.removeItem("type1");
            if(getElem("placeName").indexOf("其他")>=0){//妹子场地不限
                storeElem("type",1);
                location.href="search.html?"+ addT();
            }else{//妹子有固定场地
                storeElem("type",1);
                location.href="searchLimit.html?"+ addT();
            }
        };

        // 取消包厢
        $scope.cancel=function(){
            $scope.noMei=true;
            $scope.hasMei=false;
            $scope.isShow1=true;
            $scope.isShow2=false;
            $scope.can=false;
            $scope.time='';
            $scope.address='';
            $scope.number='';
            localStorage.removeItem("time");
            localStorage.removeItem("address");
            localStorage.removeItem("number");
            localStorage.removeItem("addressId");
            localStorage.removeItem("roomPrice");
            localStorage.removeItem("orderRoom");
            // 查询包厢中的宝贝
            $http.post(UrlConstant.url + "/order/shopCart.do", {json:JSON.stringify({
                "userId":$scope.userId
            })}).success(function(data){
                console.log(data);
                $scope.babyList=data.data;
                $http.post(UrlConstant.url + "/order/deleteBaby.do", {json:JSON.stringify({
                    "userId":$scope.userId,
                    "babyId":$scope.babyList[0].babyId
                })}).success(function(data){
                    console.log(data);
                });
            });

        };
// **********************选择时间*********************
        // 选取时间
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate();
        var nowHour=date.getHours();
        var hour = date.getHours()+2;
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var minTime=year+'-'+month+'-'+day+'- '+hour+':'+minute+':'+second;

            var calendar = new datePicker();
            calendar.init({
                'trigger': '#timeMeeting', /*按钮选择器，用于触发弹出插件*/
                'type': 'datetime',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
                'minDate':minTime,/*最小日期*/
                'maxDate':minTime,/*最大日期*/
                'onSubmit':function(){/*确认时触发事件*/
                },
                'onClose':function(){/*取消时触发事件*/
                }
            });


        var chooseTime=0;
        // 时间改变了
        $scope.changFun=function () {
            var value=document.getElementById("timeMeeting").value;
            if(nowHour>=22 || nowHour<9){
                $scope.tipShow=true;
                $scope.contentTip="平台已暂停服务，请于9:00~22:00之间下单";
                $timeout(function(){
                    $scope.tipShow=false;
                },2000);
            }else{
                chooseTime=value.split(" ")[1].split(":")[0];
                // alert(value);
                if(chooseTime-nowHour>=2){
                    var theSelectData=value;
                    storeElem("time",theSelectData);
                    $scope.time=theSelectData;
                }else{
                    $scope.tipShow=true;
                    $scope.contentTip="您只能预约两小时之后的订单";
                    document.getElementById("timeMeeting").value="";
                    localStorage.removeItem("time");
                    $scope.time="";
                    $timeout(function(){
                        $scope.tipShow=false;
                    },2000);
                }
            }
        };

// **********************读取本地缓存的数据*********************
        // 如果没有预定包厢，roomPrice和address存储设为空
        // if(getElem("orderRoom")==2){
        //     storeElem("roomPrice",'');
        //     storeElem("address",'');
        // }else{}

        if(getElem("time")){
            $scope.time=getElem("time");
        }
        if(getElem("address")){
            $scope.address=getElem("address");
        }
        if(getElem("addressId")){
            $scope.addressId=getElem("addressId");
        }else{
            $scope.addressId=0;
        }
        if(getElem("phone")){
            $scope.phone=getElem("phone");
        }
        if(getElem("name")){
            $scope.name=getElem("name");
        }
        if(getElem("number")){
            $scope.number=getElem("number");
            $scope.isShow1=false;
            if(getElem("type")==1){
                $scope.isShow2=true;
                $scope.can=true;
            }else if(getElem("type")==2){
                $scope.isShow2=false;
                $scope.can=true;
            }
        }else{
            $scope.number='';
        }
// **********************先订包厢*********************
        $scope.toYu=function(){
            location.href="search.html?"+ addT();
            storeElem('userId',$scope.userId);
            storeElem("type",1);
            storeElem("type1",1);
        };

// **********************选择宝贝*********************
        $scope.$on('RepeatFinished', function() {
            $timeout(function(){
                // 选择宝贝
                var invitars=document.getElementById("invitars");
                var liList=invitars.getElementsByTagName("li");
                if(liList.length>0){
                    var H=liList[0].offsetHeight;
                    var deleteHideList=invitars.querySelectorAll(".deleteHide");
                    for(var i=0;i<deleteHideList.length;i++){
                        deleteHideList[i].style.height=H+"px";
                        deleteHideList[i].style.lineHeight=H+"px";
                    }
                    var x, y, X, Y;
                    for(var i=0;i<liList.length;i++){
                        liList[i].addEventListener('touchstart', function(event) {
                            x = event.changedTouches[0].pageX;
                        });
                        liList[i].addEventListener('touchmove', function(event){
                            // 阻止事件冒泡
                            event.stopPropagation();
                            X = event.changedTouches[0].pageX;
                        });
                        liList[i].addEventListener('touchend', function(event){
                            if(X - x > 20){   //右滑
                                console.log("右滑");
                                this.setAttribute("class","clear") ;
                            }
                            if(X - x < -20){   //左滑
                                console.log("左滑");
                                this.setAttribute("class","left clear") ;
                            }
                        });
                    }
                }
            })
        })

// **********************去请客*********************
        $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
            $timeout(function(){
                // 请客处理
                var priceChooseList=document.querySelectorAll(".priceChoose");
                var textList=document.querySelectorAll(".text");
                var greenList=document.querySelectorAll(".green");
                var dotList=document.querySelectorAll(".dotOuter");
                if(priceChooseList.length>0){
                    $scope.inviteShow=true;
                    var startX=priceChooseList[0].offsetLeft;
                    var widthD=document.querySelectorAll(".dot")[0].offsetWidth;
                    var bList=document.getElementsByTagName("b");
                    var left0=priceChooseList[0].getElementsByTagName("span")[0].offsetLeft-widthD/2;
                    var left1=priceChooseList[0].getElementsByTagName("span")[1].offsetLeft-widthD/2;
                    var left2=priceChooseList[0].getElementsByTagName("span")[2].offsetLeft-widthD/2;
                    var left3=priceChooseList[0].getElementsByTagName("span")[3].offsetLeft-widthD/2;
                    var left4=priceChooseList[0].getElementsByTagName("span")[4].offsetLeft-widthD/2;
                    var middle1=(left0+left1)/2;
                    var middle2=(left1+left2)/2;
                    var middle3=(left2+left3)/2;
                    var middle4=(left3+left4)/2;
                    $scope.invitedPrice=[];
                    for(var i=0;i<priceChooseList.length;i++){
                        $scope.invitedPrice[i]=0;
                        dotList[i].index=i;
                        dotList[i].addEventListener("touchstart",function () {
                            index = this.index;
                            dotList[index].addEventListener("touchmove",function(e){
                                e.preventDefault();
                                dotList[index].style.left = e.touches[0].pageX-startX + 'px';
                                greenList[index].style.width=e.touches[0].pageX-startX + 'px';
                            });
                            dotList[index].addEventListener("touchend",function(){
                                if(parseFloat(dotList[index].style.left)<middle1){
                                    dotList[index].style.left = left0 + 'px';
                                    greenList[index].style.width=0+ 'px';
                                    bList[index].innerHTML=0;
                                    $scope.invitedDetailList[index].inviteMoney=0;
                                    changeClass(0);
                                }else if(parseFloat(dotList[index].style.left)>=middle1 && parseFloat(dotList[index].style.left)<middle2){
                                    dotList[index].style.left = left1 + 'px';
                                    greenList[index].style.width=left1 + 'px';
                                    bList[index].innerHTML=800;
                                    $scope.invitedDetailList[index].inviteMoney=800;
                                    changeClass(1);
                                }else if(parseFloat(dotList[index].style.left)>=middle2 &&  parseFloat(dotList[index].style.left)<middle3){
                                    dotList[index].style.left = left2 + 'px';
                                    greenList[index].style.width=left2 + 'px';
                                    bList[index].innerHTML=1000;
                                    $scope.invitedDetailList[index].inviteMoney=1000;
                                    changeClass(2);
                                }else if(parseFloat(dotList[index].style.left)>=middle3 &&  parseFloat(dotList[index].style.left)<middle4){
                                    dotList[index].style.left = left3 + 'px';
                                    greenList[index].style.width=left3 + 'px';
                                    bList[index].innerHTML=1200;
                                    $scope.invitedDetailList[index].inviteMoney=1200;
                                    changeClass(3);
                                }else if(parseFloat(dotList[index].style.left)>middle4){
                                    dotList[index].style.left = left4 + 'px';
                                    greenList[index].style.width=left4 + 'px';
                                    bList[index].innerHTML=1500;
                                    $scope.invitedDetailList[index].inviteMoney=1500;
                                    changeClass(4);
                                }
                            });

                            function changeClass(num){
                                $timeout(function(){
                                    if(num==0){
                                        $scope.invitedPrice[index]=0;
                                    }else if(num==1){
                                        $scope.invitedPrice[index]=800;
                                    }else if(num==2){
                                        $scope.invitedPrice[index]=1000;
                                    }else if(num==3){
                                        $scope.invitedPrice[index]=1200;
                                    }else if(num==4){
                                        $scope.invitedPrice[index]=1500;
                                    }
                                    $scope.total=0;
                                    for(var i=0;i<$scope.invitedPrice.length;i++){
                                        $scope.total+=$scope.invitedPrice[i];
                                    }
                                    $scope.inviteTotal=$scope.total;
                                    $scope.count=$scope.total+ $scope.addpriceBaby;
                                },100);
                                for(var i=0;i< priceChooseList[index].parentNode.querySelector(".text").getElementsByTagName("span").length;i++){
                                    priceChooseList[index].parentNode.querySelector(".text").getElementsByTagName("span")[i].setAttribute('class','');
                                }
                                priceChooseList[index].parentNode.querySelector(".text").getElementsByTagName("span")[num].setAttribute('class','active');
                            }

                        });
                    }

                    // 默认0元
                    for(var i=0;i<priceChooseList.length;i++){
                        priceChooseList[i].parentNode.querySelector(".text").getElementsByTagName("span")[0].setAttribute('class','active');
                    }
                }else{
                    $scope.inviteShow=false;
                }
            },200);
        });


        // 点击弹窗消失
        $scope.know=function () {
            $scope.isShow=false;
        };

        $scope.addressFirst=function(){
            storeElem("type",1);
            storeElem("type1",1);
            location.href="search.html?"+ addT();
        };



        // 添加宝贝
        $scope.invitedChoose=function () {
            location.href="babyList.html?inviteAddress="+$scope.address+"&userId="+$scope.userId+"&treatStatus="+$scope.treatStatus+ addT();
        };

        // $scope.invitedDetailList=[];
        // $scope.arrayList={"json":"[{\"beInvitePhone\":\"15170300335\",\"beInviteName\":\"14白钰琳1\"},{\"beInvitePhone\":\"15216024181\",\"beInviteName\":\"仇健超111\"},{\"beInvitePhone\":\"15216024181\",\"beInviteName\":\"仇健超111\"}]"};
        // $scope.invitedDetailList= JSON.parse($scope.arrayList.json);
        // for(var i=0;i<$scope.invitedDetailList.length;i++){
        //     $scope.invitedDetailList[i].inviteMoney=0;
        // }
        //
        // $scope.totalNum+=$scope.invitedDetailList.length;

// **********************与原生对接********************
        function setupWebViewJavascriptBridge(callback) {
            if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
            if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
            window.WVJBCallbacks = [callback];
            var WVJBIframe = document.createElement('iframe');
            WVJBIframe.style.display = 'none';
            WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
            document.documentElement.appendChild(WVJBIframe);
            setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
        }

        //调用上面定义的函数
        setupWebViewJavascriptBridge(function (bridge){
            //OC传值给JS 'testJavascriptHandler'为双方自定义好的统一方法名；'data'是OC传过来的值；'responseCallback'是JS接收到之后给OC的回调
            // 返回请客的值
            bridge.registerHandler('inviteInfo', function(data, responseCallback) {
                //alert("返回请客名单");
                //打印OC传过来的值
                var responseData = { 'callBack':'回调成功！' }
                //给OC的回调
                responseCallback(responseData);
                $scope.arrayList=data;
                $scope.invitedDetailList= JSON.parse($scope.arrayList.json);
                for(var i=0;i<$scope.invitedDetailList.length;i++){
                    $scope.invitedDetailList[i].inviteMoney=0;
                }

                $scope.totalNum+=$scope.invitedDetailList.length;
                console.log($scope.invitedDetailList);
                storeElem("invitedDetailList",JSON.stringify( $scope.invitedDetailList));
            });
            //点击去请客
            $scope.goInvite=function(){
                bridge.callHandler('toInvite', {}, function(response) {
                    // alert("去请客");
                });
            };
            // 删除客人
            $scope.deleteInnvited=function(index){
                if($scope.invitedDetailList.length>0){
                    $scope.totalNum--;
                    $scope.inviteTotal-=parseFloat($scope.invitedDetailList[index].inviteMoney).toFixed(2);
                    $scope.count=parseFloat($scope.count-$scope.invitedDetailList[index].inviteMoney).toFixed(2);
                    $scope.invitedDetailList.splice(index,1);
                    if($scope.invitedDetailList.length==0){
                        $scope.inviteShow=false;
                    }
                }
                bridge.callHandler('DeleteInvitation', {'index':index}, function(response) {
                });
                // 存储目前已有的数组
                // storeElem("invitedDetailList",JSON.stringify( $scope.invitedDetailList));
            };

            // 获取用户的数据
            bridge.registerHandler('getUserInfo', function(data, responseCallback) {
                // alert("收到用户信息");
                //打印OC传过来的值
                var responseData = { 'callBack':'回调成功！' }
                //给OC的回调
                responseCallback(responseData);
                $scope.data= JSON.parse(data.json);
                $scope.userId= $scope.data.userId;
                $scope.userCid= $scope.data.userCid;
                $scope.treatStatus= $scope.data.treatStatus;
                $scope.inviteTime= $scope.data.inviteTime;
                $scope.inviteAddress= $scope.data.inviteAddress;
                $scope.inviteMoney= $scope.data.inviteMoney;
                $scope.inviteUserName= $scope.data.inviteUserName;
                $scope.orderId= $scope.data.orderId;
                // alert("获取原生传回的值");
                storeElem("userId",$scope.userId);
                storeElem("userCid",$scope.userCid);
                storeElem("treatStatus",$scope.treatStatus);
                storeElem("inviteTime",$scope.inviteTime);
                storeElem("inviteAddress",$scope.inviteAddress);
                storeElem("inviteMoney",$scope.inviteMoney);
                storeElem("inviteUserName",$scope.inviteUserName);
                storeElem("orderId",$scope.orderId);
            });

            // 去结算
            $scope.goCount=function(){
                if($scope.time==''){//选择时间为空
                    $scope.tipShow=true;
                    $scope.contentTip="请选择时间";
                    $timeout(function(){
                        $scope.tipShow=false;
                    },1000);
                }else{//选择时间不为空
                    var myHour= new Date().getHours();
                    var choseHour=$scope.time.split(" ")[1].split(":")[0];
                    if(myHour>=22 || myHour<9){//不在营业时间
                        $scope.tipShow=true;
                        $scope.contentTip="平台已暂停服务，请于9:00~22:00之间下单";
                        $timeout(function(){
                            $scope.tipShow=false;
                        },1000);
                    }else{//营业时间里
                        if($scope.treatStatus==3){//如果是追加订单
                            $scope.hasTime=$scope.time;
                            if(choseHour-myHour<2){//追加时间和当前时间很接近
                                $scope.sureAgainShow=true;
                            }else{
                                $scope.sureAgainShow=false;
                                $scope.goOrder();
                            }
                        }else if($scope.treatStatus==2){//被请客人没有时间限制
                            // alert("去结算");
                                $scope.goOrder();
                        }else{//主请客人第一次下单
                            if(choseHour-myHour<2){//追加时间和当前时间很接近
                                $scope.tipShow=true;
                                $scope.contentTip="您只能预约两小时之后的订单";
                                $timeout(function(){
                                    $scope.tipShow=false;
                                },1000);
                            }else{
                                $scope.goOrder();
                            }
                        }
                    }
                }
            };
            //取消追加
            $scope.cancelOrder=function(){
                $scope.sureAgainShow=false;
            };
            // 继续追加
            $scope.continueOrder=function(){
                $scope.sureAgainShow=false;
                $scope.goOrder();
            };

            // 去下单
            $scope.goOrder=function(){
                if($scope.address==''){
                    $scope.tipShow=true;
                    $scope.contentTip="请选择地址";
                    $timeout(function(){
                        $scope.tipShow=false;
                    },1000);
                }else if($scope.number==''){
                    $scope.tipShow=true;
                    $scope.contentTip="请选择包厢规格或填写已有包厢号";
                    $timeout(function(){
                        $scope.tipShow=false;
                    },1000);
                }else if($scope.babyIdList==''&&$scope.invitedDetailList==''){
                    $scope.tipShow=true;
                    $scope.contentTip="包厢为空，无法结算";
                    $timeout(function(){
                        $scope.tipShow=false;
                    },1000);
                }else{
                    $http.post(UrlConstant.url + "/order/prePay.do", {json:JSON.stringify({
                        "userId":$scope.userId,
                        "treatStatus":$scope.treatStatus,
                        "userCid":$scope.userCid,
                        "userName":$scope.name,
                        "userPhone":$scope.phone,
                        "meetAddress":$scope.address+'_'+getElem("number"),
                        "meetTime":$scope.time+":00",
                        "payMoney":$scope.count,
                        "babyIdList":$scope.babyIdList,
                        "invitedDetail":$scope.invitedDetailList,
                        "appendOrderId":$scope.orderId,
                        "orderRoom":getElem("orderRoom"),
                        "addressId":$scope.addressId,
                        "price":getElem("roomPrice")
                    })}).success(function(data){
                        console.log(data);
                        if(data.code=="200"){
                            localStorage.clear();
                            $scope.count=0;
                            $scope.totalNum=0;
                            // alert(data.data.isOrderFinish);
                            // if(data.data.isOrderFinish==2){//当前订单已结束
                           //      $scope.hasMei=false;
                           //      $scope.beInvited=false;
                           //      $scope.noMei=true;
                           //  }
                            bridge.callHandler('toOrderList', {'orderId': data.data.orderId,'orderNo': data.data.orderNo,'payMoney':data.data.payMoney,"isOrderFinish":data.data.isOrderFinish}, function(response) {
                            });
                        }else{
                            $scope.content=data.msg;
                            $scope.isShow=true;
                        }
                    })
                }
            }

        });

    }]);

