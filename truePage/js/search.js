/**
 * Created by HuWen on 2017/5/3.
 */
angular.module("searchApp", ['config','api'])
    .controller('searchLimitCtr', [ '$scope', '$http','UrlConstant','$timeout',function( $scope, $http,UrlConstant,$timeout) {
        $scope.isShow=false;
        $scope.iconShow=true;
        $scope.addressList=getElem("placeName").split(",");
        $scope.type=getElem("type");

        // 选择具体场地
        $scope.detail=function(item){
            storeElem("address",item);
            // 获取场地id数据
            $http.post(UrlConstant.url + "/userBox/getBoxInfo.do", {json:JSON.stringify({
                "address":item
            })}).success(function(data){
                if(data.code==200){
                    storeElem("addressId",data.data.id);
                }else if(data.code==400){
                    storeElem("addressId",0);
                }
                if($scope.type==1){
                    $timeout(function(){
                        storeElem("number",'');
                        location.href="roomChoose.html?"+ addT();
                    },100)
                }else if($scope.type==2){
          			storeElem("orderRoom","2");
                    $timeout(function(){
                        storeElem("number",'');
                        location.href="order.html?"+ addT();
                    },100)
                }
            });
        };

    }])

    .controller('searchCtr', [ '$scope', '$http','UrlConstant','$timeout',function( $scope, $http,UrlConstant,$timeout) {
        $scope.isShow=true;
        $scope.type=getElem("type");
        $http.post(UrlConstant.url + "/user/free/seachPlaceName.do", {json:JSON.stringify({})}).success(function(data){
            $scope.addressList=data.data;
        });

        // 模糊搜索
        $scope.beginSearch=function(){
            $http.post(UrlConstant.url + "/user/free/seachSite.do", {json:JSON.stringify({
                "site":$scope.search
            })}).success(function(data){
                $scope.addressList=data.data;
            });

        };

        // 选择具体场地
        $scope.detail=function(item){
            storeElem("address",item.address);
            // 获取场地id数据
            storeElem("addressId",item.id);
            if($scope.type==1){
                $timeout(function(){
                    storeElem("number",'');
                    location.href="roomChoose.html?"+ addT();
                },100)
            }else if($scope.type==2){
				storeElem("orderRoom","2");
                $timeout(function(){
                    storeElem("number",'');
                    location.href="order.html?"+ addT();
                },100)
            }
        };


    }]);
