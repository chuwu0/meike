/**
 * Created by HuWen on 2017/5/3.
 */
angular.module('config',['api'])
    .config(['$httpProvider', function ($httpProvider) {
        // 修改angularjs默认post提交为form表单形式
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function(obj) {
            var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
            for(name in obj) {
                value = obj[name];
                if(value instanceof Array) {
                    for(i=0; i<value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for(subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }
            return query.length ? query.substr(0, query.length - 1) : query;
        };
        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function(data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];
    }]);

    angular.module('api', [])
        .value('UrlConstant',{
        url:"http://118.178.227.195:8088/meike-mener"           /*测试地址*/
        // url:"http://101.37.33.119:8088/meike-mener"          /*线上地址*/
    });

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return null;
}

function storeElem(name,elem) {
    localStorage.setItem(name,elem);
}
function getElem(name) {
    return localStorage.getItem(name);
}

angular.module('fang', [])
    .directive('onFinish', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }
            }
        }})

    .directive('repeatDone', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('RepeatFinished');
                    });
                }
            }
        }});



// 添加时间戳
function addT(){
    return '&t=' + new Date().getTime();
}