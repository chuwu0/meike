/**
 * Created by HuWen on 2017/4/28.
 */
angular.module("orderApp", ['config','api','fang'])
    .controller('orderCtr', [ '$scope', '$http','UrlConstant','$timeout','$interval',function( $scope, $http,UrlConstant,$timeout,$interval) {
        
        $scope.canInvite=true;
        $scope.isShow=false;
        $scope.isShow1=false;
        $scope.isShow2=false;
        $scope.noMei=false;
        $scope.hasMei=false;
        $scope.beInvited=false;
        $scope.zhuiNoMei=false;

        $scope.can=false;
        $scope.count=0;
        $scope.orderId='';
        $scope.invitedDetailList=[];
        $scope.babyIdList=[];
        $scope.totalNum=0;
        $scope.payMoney=0;
        $scope.orderInfo="当前场所为空";
        $scope.loadShow=true;
        $scope.time='';
        $scope.address='';


        $scope.timer=$interval(function(){
            if($scope.userId){
                $interval.cancel($scope.timer);
      			 $scope.loadShow=false;

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
                $scope.hasBaby=function(){
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
                        }else{//没有妹子
                           //主请客人第一次购物车为空时
                            localStorage.removeItem("placeName");
                            $scope.hasMei=false;
                            $scope.beInvited=false;
                            $scope.orderInfo="当前场所为空";
                            $scope.noMei=true;
                        }
                    });
                };



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
                                $scope.inviteShow=false;
                                $scope.moreBaby=false;
                                $scope.isShow1=true;
                                $scope.hasBaby();
                            }else if(data.code=="200"){//\目前已有订单，走追加
                                $scope.orderInfo="订单进行中";
                                $scope.noMei=true;
                            }
                        }
                    });
                }
            }
        },15);

        // 请求响应超时，用本地缓存数据
        $timeout(function(){
            if($scope.userId){}else{
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
                localStorage.removeItem("time");
                localStorage.removeItem("address");
                $scope.time='';
                $scope.address='';
                $scope.hasBaby();
            })
        };

// **********************选择包厢*************************
        // 已有包厢号，选择包厢
        $scope.addressChoose=function(){
             location.href="search.html";
        };
        // 存储房间号
        $scope.store=function(){
            storeElem("number",$scope.number);
        };

// **********************选择时间*********************
        // 选取时间
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var day = date.getDate();
        var hour = date.getHours()+2;
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var minTime=year+'-'+month+'-'+day+'- '+hour+':'+minute+':'+second;
        var calendar = new datePicker();
        calendar.init({
            'trigger': '#timeMeeting', /*按钮选择器，用于触发弹出插件*/
            'type': 'datetime',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
            'minDate':minTime,/*最小日期*/
            'maxDate':'2100-12-31',/*最大日期*/
            'onSubmit':function(){/*确认时触发事件*/
                var theSelectData=calendar.value;
                storeElem("time",theSelectData);
                $scope.time=theSelectData;
            },
            'onClose':function(){/*取消时触发事件*/
                $scope.time='';
            }
        });

// **********************读取本地缓存的数据*********************
        if(getElem("time")){
            $scope.time=getElem("time");
        }
        if(getElem("address")){
            $scope.address=getElem("address");
        }
        if(getElem("addressId")){
            $scope.addressId=getElem("addressId");
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
            $scope.toYu=function(){
                location.href="search.html";
                storeElem('userId',$scope.userId);
                storeElem("type",1);
                storeElem("type1",1);
            };
        };
// **********************去请客*********************
           $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
               $timeout(function(){
                   // 选择宝贝
                   var invitars=document.getElementById("invitars");
                   var liList=invitars.getElementsByTagName("li");
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
                           if(X - x > 0){   //右滑
                               console.log("右滑");
                               this.setAttribute("class","clear") ;
                           }
                           if(X - x < 0){   //左滑
                               console.log("左滑");
                               this.setAttribute("class","left clear") ;
                           }
                       });
                   }
               },100);
           });


        // 点击弹窗消失
        $scope.know=function () {
            $scope.isShow=false;
        };

        $scope.addressFirst=function(){
            storeElem("type",1);
            storeElem("type1",1);
            location.href="search.html";
        };

        // 添加宝贝
// **********************与原生对接*********************
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
            // 去结算
            // 去结算
            $scope.goCount=function(){
                if($scope.time==''){
                    $scope.tipShow=true;
                    $scope.contentTip="请选择时间";
                    $timeout(function(){
                        $scope.tipShow=false;
                    },1000);
                }else if($scope.address==''){
                    $scope.tipShow=true;
                    $scope.contentTip="请选择地址";
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
						"addressId":getElem("addressId"),
						"price":getElem("roomPrice")
                        
                    })}).success(function(data){
                        console.log(data);
                        if(data.code=="200"){
                            localStorage.clear();
                            $scope.count=0;
                            $scope.totalNum=0;
                            alert("成功提交订单！");
                            console.log(data.data.orderNo);
                            bridge.callHandler('toOrderList', {'orderId': data.data.orderId,'orderNo': data.data.orderNo,'payMoney':data.data.payMoney,}, function(response) {
                            });
                        }else{
                            $scope.content=data.msg;
                            $scope.isShow=true;
                        }
                    })
                }
            };

            // 获取用户的数据
            bridge.registerHandler('getUserInfo', function(data, responseCallback) {
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
                storeElem("userId",$scope.userId);
                storeElem("userCid",$scope.userCid);
                storeElem("treatStatus",$scope.treatStatus);
                storeElem("inviteTime",$scope.inviteTime);
                storeElem("inviteAddress",$scope.inviteAddress);
                storeElem("inviteMoney",$scope.inviteMoney);
                storeElem("inviteUserName",$scope.inviteUserName);
                storeElem("orderId",$scope.orderId);
            });

        });

    }]);
