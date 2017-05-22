/**
 * Created by HuWen on 2017/4/28.
 */
angular.module("roomChooseApp", ['config','api'])
    .controller('roomChooseCtr', [ '$scope', '$http','UrlConstant','$timeout',function( $scope, $http,UrlConstant,$timeout) {
        $scope.addressId=getElem("addressId");
        $scope.address=getElem("address");
        $scope.roomStandard='';
        $scope.price='';
        $scope.time='';

        $http.post(UrlConstant.url + "/order/rooms.do", {json:JSON.stringify({
            "addressId":$scope.addressId
        })}).success(function(data){
            console.log(data);
            $scope.roomList=data.data;
        });
        $scope.type1=getElem("type1");


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
            'trigger': '#time', /*按钮选择器，用于触发弹出插件*/
            'type': 'datetime',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
            'minDate':minTime,/*最小日期*/
            'maxDate':'2100-12-31',/*最大日期*/
            'onSubmit':function(){/*确认时触发事件*/
                var theSelectData=calendar.value;
                $scope.time=theSelectData;
                storeElem("time", $scope.time);
            },
            'onClose':function(){/*取消时触发事件*/
            }
        });

        // 选择具体的包厢
        $scope.roomInfo=function(item){
            console.log(item);
            $scope.roomStandard=item.spec;
            $scope.price=item.price;
            $scope.number=item.spec+" "+item.price+"RMB"+" "+"包厢";
            storeElem("number",$scope.number)
        };

        // 确定包厢
        $scope.sure=function(){
            if($scope.type1==1){
                // 包厢确认
                $http.post(UrlConstant.url + "/order/rooms.do", {json:JSON.stringify({
                    "addressId":$scope.addressId,
                    "adress":$scope.adress,
                    "roomStandard":$scope.roomStandard,
                    "price":$scope.price,
                    "userId":$scope.userId,
                    "userPhone":$scope.phone,
                    "userName":$scope.name,
                    "bookTime":$scope.time
                })}).success(function(data){
                    console.log(data);
                })
                $timeout(function(){
                    location.href='order_orderFirst.html';
                },10);

            }else{
                location.href='order.html';
            }
        };

        if(getElem("phone")){
            $scope.phone=getElem("phone");
        }
        if(getElem("name")){
            $scope.name=getElem("name");
        }
        if(getElem("userId")){
            $scope.userId=getElem("userId");
        }


    }]);
