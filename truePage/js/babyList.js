$(function() {

    //开始页数，总页数，延迟加载时间,详情页地址,是否有订单,已有订单地址
    var page = 1,
        pageCount = 10,
        time = 400,
        detailUrl = '../views/details_first.html';

    var theRequest = new Object();
    var ios = new Object();

    //处理url函数
    (function() {
        var url = location.search; //获取url中"?"符后的字串
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
            }
        }
    })();

    /*阻止用户双击使屏幕上滑*/
    var agent = navigator.userAgent.toLowerCase();        //检测是否是ios
    var iLastTouch = null;                                //缓存上一次tap的时间
    if (agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0)
    {
        document.body.addEventListener('touchend', function(event)
        {
            var iNow = new Date().getTime();
            iLastTouch = iLastTouch || iNow + 1 /** 第一次时将iLastTouch设为当前时间+1 */ ;
            var delta = iNow - iLastTouch;
            if (delta < 500 && delta > 0)
            {
                event.preventDefault();
                return false;
            }
            iLastTouch = iNow;
        }, false);
    }

    function setupWebViewJavascriptBridge(callback) {
        if (window.WebViewJavascriptBridge) {
            return callback(WebViewJavascriptBridge);
        }
        if (window.WVJBCallbacks) {
            return window.WVJBCallbacks.push(callback);
        }
        window.WVJBCallbacks = [callback];
        var WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function() {
                document.documentElement.removeChild(WVJBIframe)
            },
            0)
    }

    //调用上面定义的函数
    setupWebViewJavascriptBridge(function(bridge) {

        //OC传值给JS 'testJavascriptHandler'为双方自定义好的统一方法名；'data'是OC传过来的值；'responseCallback'是JS接收到之后给OC的回调
        bridge.registerHandler('toIOSFun',
            function(data, responseCallback) {
                //打印OC传过来的值
                ios.inviteAddress = data.inviteAddress;
                localStorage.setItem('inviteAddress', data.inviteAddress);
                ios.treatStatus = data.treatStatus;

                var responseData = {
                    'callback': '回调成功！'
                }

                //给OC的回调
                responseCallback(responseData)
            })
    });

    //地址的处理函数
    function getAdress(data) {
        var i = 0,
            dom = '';
        if (data.length > 2) {
            var n = 2;
            for (; i < n; i++) {
                dom += '<span class="adress">' + overString(data[i]) + '</span>';
            }
            dom += '<span class="adress">更多</span>';
        } else {
            for (; i < data.length; i++) {
                dom += '<span class="adress">' + overString(data[i]) + '</span>';
            }
        }
        return dom
    }

    //字符串超出显示省略
    function overString(data) {
        if (data.length >= 6) {
            return data.substring(0, 6) + "...";
        } else {
            return data;
        }
    }

    //处理服务标签超出两个隐藏
    function dealScale(data) {
        var i = 0,
            dom = '';
        for (; i < data.length; i++) {
            dom += '<span class="range">' + overString(data[i]) + '</span>';
        }
        return dom
    }

    function isOnline(status,haveOrder) {
        if (status === 1) {
            if(haveOrder == 1){
              return 'noline'
            }else{
              return 'isOnline'
            }
        } else {
            return 'noline'
        }
    }

    function dealOnline(serviceStatus,haveOrder){
      if(serviceStatus != 1 || haveOrder == 1){
        return '&haveOrder=true'
      }else{
        return ''
      }
    }

    function isZaixian(serviceStatus,haveOrder){
      if(serviceStatus == 1){
        if (haveOrder == 1) {
          return '服务中'
        }else{
          return '在线'
        }
      }else{
        return '离线'
      }
    }

    function lazyload(event) {
      var n = 0;
      var imgNum=$('.img-container img').length;img=$('.img-container img');
      for (var i = n; i < imgNum; i++) {
        if (img.eq(i).offset().top < parseInt($(window).height()) + parseInt($(window).scrollTop())) {
          if (img.eq(i).attr("src") == "") {
            var src = img.eq(i).attr("data-src");
            img.eq(i).attr("src", src);
            n = i + 1;
          }
        }
      }
    }
    $(window).scroll(lazyload);

    //跳转搜索页面，需要将本页面的userId传入
    $('.searchUrl').attr('href',function() {
            return 'addressSearch.html?userId=' + theRequest.userId;
        });

    setTimeout(function() {
        ios.treatStatus = true;
        ios.inviteAddress = localStorage.getItem('inviteAddress');
    }, 15) ;

    var timer = setInterval(function() {
        //下拉加载函数和文档
        var inviteAddress = ios.inviteAddress || theRequest.inviteAddress;
        if (ios.treatStatus) {
            clearInterval(timer);
            function dealinvite() {
                if (inviteAddress) {
                    $('#index-search a').attr('href', 'javascript:void(0);')
                    if (theRequest.treatStatus) {
                        return '&inviteAddress=' + inviteAddress + '&hasChose=true&treatStatus=' + theRequest.treatStatus
                    } else {
                        return '&inviteAddress=' + inviteAddress + '&hasChose=true'
                    }
                } else {
                    return ''
                }
            }
            $('.content').dropload({
                scrollArea: window,
                //下拉文档
                domUp: {
                    domClass: 'dropload-up',
                    domRefresh: '<div class="dropload-refresh">↓下拉刷新</div>',
                    domUpdate: '<div class="dropload-update">↑释放更新</div>',
                    domLoad: '<div class="dropload-load"><span class="loading"></span>正在刷新...</div>'
                },
                //上拉文档
                domDown: {
                    domClass: 'dropload-down',
                    domRefresh: '<div class="dropload-refresh">↑上拉加载更多</div>',
                    domLoad: '<div class="dropload-load"><span class="loading"></span>正在刷新...</div>',
                    domNoData: '<div class="dropload-noData">已经到底了</div>'
                },
                loadDownFn: function(me) {

                    var data, linkUrl, haveAddress;
                    $.ajax({
                        url: 'http://118.178.227.195:8088/meike-mener/order/currentOrder.do',
                        type: 'GET',
                        data: {
                            'json': JSON.stringify({
                                'userId': Number(theRequest.userId)
                            })
                        },
                        dataType: 'json',
                        async: false,
                        success: function(res) {
                            if (res.code == 200 && res.data.haveOrder == 3) {
                                haveAddress = res.data.currentOrder.meetAddress.split('_')[0];
                            }
                        }
                    })

                    //判断地址搜索
                    if (theRequest.address) {
                        data = JSON.stringify({
                            'pageNumb': page,
                            'clubhouse': theRequest.address
                        });
                        linkUrl = 'http://118.178.227.195:8088/meike-mener/user/free/clubhouseSearchBaby.do';
                    } else {
                        data = JSON.stringify({
                            'pageNumb': page
                        });
                        linkUrl = 'http://118.178.227.195:8088/meike-mener/user/free/homePage.do';
                    }
                    //判断传来inviteAddress是邀请身份进行筛选
                    if (inviteAddress) {
                        data = JSON.stringify({
                            'pageNumb': page,
                            'clubhouse': inviteAddress
                        });
                        linkUrl = 'http://118.178.227.195:8088/meike-mener/user/free/clubhouseSearchBaby.do';
                    }
                    //判断当前是否有订单
                    if (haveAddress) {
                        data = JSON.stringify({
                            'pageNumb': page,
                            'clubhouse': haveAddress
                        });
                        linkUrl = 'http://118.178.227.195:8088/meike-mener/user/free/clubhouseSearchBaby.do';
                        $('#index-search a').attr('href', 'javascript:void(0);')
                    } else {
                        if (theRequest.addressId) {
                            data = JSON.stringify({
                                'pageNumb': page,
                                'clubhouse': theRequest.addressId
                            });
                            linkUrl = 'http://118.178.227.195:8088/meike-mener/user/free/clubhouseSearchBaby.do';
                            $('#index-search a').attr('href', 'javascript:void(0);')
                        }
                    }
                    $.ajax({
                        type: 'GET',
                        data: {
                            'json': data
                        },
                        url: linkUrl,
                        dataType: 'json',
                        success: function(res) {
                          console.log(res.data);
                            var data = res.data.babyList;
                            var result = '';
                            page++;
                            pageCount = res.data.pageCount;
                            if (page <= pageCount + 1) {
                                for (var i = 0; i < data.length; i++) {
                                    result += '<a href="' + detailUrl + '?userId=' + theRequest.userId + '&babyId=' + data[i].id + dealinvite() + dealOnline(data[i].serviceStatus,data[i].haveOrder) + '">' + '<div class="img-container"><img data-src=' + data[i].showIndexImg + ' src=""/><div class="img-msg">' + '<p>' + data[i].nickName + ' <span class="hasNum">（' + data[i].orderCounter + '单）</span></p>' + '<div class="' + isOnline(data[i].serviceStatus,data[i].haveOrder) + '"><p>'+ isZaixian(data[i].serviceStatus,data[i].haveOrder) +'</p></div>' + '</div>' + '</div>' + '<div id="explain">' + '<div class="left-view">' + '<p>场所：' + getAdress(data[i].placeName) + '</p>' + '<p>范围：' + dealScale(data[i].scaleName) + '</p>' + '</div>' + '<div class="right-view">￥' + data[i].gradePrice + '/场次</div>' + '</div>' + '</a>';
                                }
                            } else {
                                me.lock();
                                me.noData();
                            }
                            // 为了测试，延迟1秒加载
                            setTimeout(function() {
                                    // 插入数据到页面，放到最后面
                                    $('.lists').append(result);
                                    lazyload();
                                    // 每次数据插入，必须重置
                                    me.resetload();
                                },time);
                        },
                        error: function(xhr, type) {
                            console.log('Ajax error!');
                            // 即使加载出错，也得重置
                            me.resetload();
                        }
                    })
                },

                loadUpFn: function(me) {
                    page = 1;
                    var data, linkUrl, haveAddress;
                    $.ajax({
                        url: 'http://118.178.227.195:8088/meike-mener/order/currentOrder.do',
                        type: 'GET',
                        data: {
                            'json': JSON.stringify({
                                'userId': Number(theRequest.userId)
                            })
                        },
                        dataType: 'json',
                        async: false,
                        success: function(res) {
                            if (res.code == 200 && res.data.haveOrder == 3) {
                                haveAddress = res.data.currentOrder.meetAddress.split('_')[0];
                            }
                        }
                    })

                    //判断地址搜索
                    if (theRequest.address) {
                        data = JSON.stringify({
                            'pageNumb': page,
                            'clubhouse': theRequest.address
                        });
                        linkUrl = 'http://118.178.227.195:8088/meike-mener/user/free/clubhouseSearchBaby.do';
                    } else {
                        data = JSON.stringify({
                            'pageNumb': page
                        });
                        linkUrl = 'http://118.178.227.195:8088/meike-mener/user/free/homePage.do';
                    }
                    //判断传来inviteAddress是邀请身份进行筛选
                    if (inviteAddress) {
                        data = JSON.stringify({
                            'pageNumb': page,
                            'clubhouse': inviteAddress
                        });
                        linkUrl = 'http://118.178.227.195:8088/meike-mener/user/free/clubhouseSearchBaby.do';
                    }
                    //判断当前是否有订单
                    if (haveAddress) {
                        data = JSON.stringify({
                            'pageNumb': page,
                            'clubhouse': haveAddress
                        });
                        linkUrl = 'http://118.178.227.195:8088/meike-mener/user/free/clubhouseSearchBaby.do';
                        $('#index-search a').attr('href', 'javascript:void(0);')
                    } else {
                        if (theRequest.addressId) {
                            data = JSON.stringify({
                                'pageNumb': page,
                                'clubhouse': theRequest.addressId
                            });
                            linkUrl = 'http://118.178.227.195:8088/meike-mener/user/free/clubhouseSearchBaby.do';
                            $('#index-search a').attr('href', 'javascript:void(0);')
                        }
                    }
                    $.ajax({
                        type: 'GET',
                        data: {
                            'json': data
                        },
                        url: linkUrl,
                        dataType: 'json',
                        success: function(res) {
                            var data = res.data.babyList;
                            pageCount = res.data.pageCount;
                            var result = '';
                            page++;
                            if (page <= pageCount + 1) {
                                for (var i = 0; i < data.length; i++) {
                                    result += '<a href="' + detailUrl + '?userId=' + theRequest.userId + '&babyId=' + data[i].id + dealinvite() + dealOnline(data[i].serviceStatus,data[i].haveOrder) + '">' + '<div class="img-container" style="background-image: url(' + data[i].showIndexImg + ')">' + '<div class="img-msg">' + '<p>' + data[i].nickName + ' <span class="hasNum">（' + data[i].orderCounter + '单）</span></p>' + '<div class="' + isOnline(data[i].serviceStatus) + '"><p>'+ isZaixian(data[i].serviceStatus,data[i].haveOrder) +'</p></div>' + '</div>' + '</div>' + '<div id="explain">' + '<div class="left-view">' + '<p>场所：' + getAdress(data[i].placeName) + '</p>' + '<p>范围：' + dealScale(data[i].scaleName) + '</p>' + '</div>' + '<div class="right-view">￥' + data[i].gradePrice + '/场次</div>' + '</div>' + '</a>';
                                }
                            } else {
                                me.lock();
                                me.noData();
                            }
                            // 为了测试，延迟1秒加载
                            setTimeout(function() {
                                    // 插入数据到页面，放到最后面
                                    $('.lists').html('').append(result);
                                    lazyload();
                                    // 每次数据插入，必须重置
                                    me.resetload();
                                },
                                time);
                        },
                        error: function(xhr, type) {
                            console.log('Ajax error!');
                            // 即使加载出错，也得重置
                            me.resetload();
                        }
                    });
                }
            })
        }
    },
    10);
})
