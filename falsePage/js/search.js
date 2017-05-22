/**
 * Created by HuWen on 2017/5/3.
 */
angular.module("searchApp", ['config','api'])
    .controller('searchCtr', [ '$scope', '$http','UrlConstant','$timeout',function( $scope, $http,UrlConstant,$timeout) {
        $scope.isShow=true;
        $scope.addressArr = ['爱搏体育(击剑馆)','杭州绿园游泳池','陈经纶游泳馆 ','华莱茶楼','忆满堂茶空间','觀芷隐轩','景上书院','香芙茗茶楼','浙江拳击健身俱乐部','杭州甲子摄影棚','江滨一号体育健身中心','萧山体育中心','杭州定安游泳馆','江南体育中心','冰纷万象滑冰场','杭州西湖国际高尔夫乡村俱乐部','金都网球中心','易骏马术俱乐部','中国美院象山校区篮球场','天歆文体中心','醉瑜伽(银泰城店)','云上瑜伽(九堡店)','去野艺术舞蹈中心','758舞蹈艺术中心','中国滑翔伞训练基地','干区体育中心武道馆','立祥跆拳道形象馆'];

        // 选择具体场地
        $scope.detail=function(item){
            $timeout(function(){
                storeElem("address",item);
                location.href="order.html";
            },100)
        };

    }]);
