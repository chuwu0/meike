$(function(){

    //tab下标，详情页地址,接口地址，包厢地址
    var itemIndex = 0,detailUrl = '../views/details_first.html',dataUrl = 'http://118.178.227.195:8088/meike-mener';

    var theRequest = new Object(),ios = new Object();
    //处理url函数
    (function() {
	  var url = location.search; //获取url中"?"符后的字串
	   if (url.indexOf("?") != -1) {
	      var str = url.substr(1);
	      strs = str.split("&");
	      for(var i = 0; i < strs.length; i ++) {
	         theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]);
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
        bridge.registerHandler('toIOSFun', function(data, responseCallback) {
            //打印OC传过来的值
            ios.inviteAddress = data.inviteAddress;
            localStorage.setItem('inviteAddress',data.inviteAddress);
            ios.treatStatus = data.treatStatus;

            var responseData = { 'callback' :'回调成功！' }

            //给OC的回调
            responseCallback(responseData)

        })
        $(document).on('touchend', '.yue div',function() {
          var _thisId = Number($(this).parent().attr('babyId'));
          var inviteAddress = theRequest.inviteAddress || ios.inviteAddress;
          var postData = JSON.stringify({
            'userId': Number(theRequest.userId),
            'babyId': _thisId
          });
          var placeArr = [],falg=false,goList=false;
          $.ajax({
            url: dataUrl + '/user/free/babyDetail.do',
            data:{ 'json': JSON.stringify({'babyId':_thisId})},
            type: 'GET',
            dataType: 'json',
            async:false,
            success:function(res){
              if(res.code == 200){
                placeArr = res.data.baby.placeName.split(',');
              }
            }
          });
          if (!theRequest.userId) {
            bridge.callHandler('NotLogin', {},function(response) {})
          }
          if(inviteAddress){
            for(var i = 0;i < placeArr.length;i++){
              if(placeArr[i] == '其他' || placeArr[i] == inviteAddress || inviteAddress == '其他'){
                goList = true;break;
              }else{
                if(i >= placeArr.length-1){
                  falg = !falg;
                }
              }
            }
            if(goList){
              $.ajax({
                url: dataUrl + '/order/invite.do',
                data: {'json': postData},
                type: 'POST',
                dataType: 'json',
                success: function(res){
                  if(res.code == 200){
                    bridge.callHandler('commonFun',{},function(response){});
                  }else{
                    var _html = document.createElement('div');
                    _html.className = 'layer-msg';
                    _html.innerHTML = res.msg;
                    $('body').append(_html);
                    setTimeout(function() {
                      _html.remove();
                    },
                    2000);
                  }
                }
              })
            }
            if(falg){
              var _html = document.createElement('div');
              _html.className = 'layer-msg';
              _html.innerHTML = '宝贝服务地址与当前包厢地址不符';
              $('body').append(_html);
              setTimeout(function() {
                _html.remove();
              },
              2000);
            }
          }else{
            $.ajax({
              url: dataUrl + '/order/invite.do',
              data: {'json': postData},
              type: 'POST',
              dataType: 'json',
              success: function(res){
                if(res.code == 200){
                  bridge.callHandler('commonFun',{},function(response){});
                }else{
                  var _html = document.createElement('div');
                  _html.className = 'layer-msg';
                  _html.innerHTML = res.msg;
                  $('body').append(_html);
                  setTimeout(function() {
                    _html.remove();
                  },
                  2000);
                }
              }
            });
          }
        })
    });

    setTimeout(function(){
        ios.treatStatus = true;
        ios.inviteAddress = localStorage.getItem('inviteAddress');
    },15)

    var timer =  setInterval(function () {
      if(ios.treatStatus){

        clearInterval(timer);

        //头部list
        $('#top-nav a').on('touchend',function(){
          var $this = $(this);
          itemIndex = $this.index();
          $this.addClass('hascheck').siblings('a').removeClass('hascheck');
          $('.lists').eq(itemIndex).show().siblings('.lists').hide();
          $('.lists').eq(itemIndex).html('');
          if(itemIndex == '0'){
            // 如果数据没有加载完
            tab1Page = 0;
                  dropload.unlock();
                  dropload.noData(false);
          }else if(itemIndex == '1'){
            // 如果数据没有加载完
            tab2Page = 0;
                  dropload.unlock();
                  dropload.noData(false);
          }

          dropload.resetload();
        });

        //妹子状态判断
        function isHaveOrder(haveOrder,status){
          if(status == 1){
            if(haveOrder == 1){
              return 'have-yue'
            }else{
              return 'yue'
            }
          }else{
            return 'have-yue'
          }
        };

        //妹子状态内容
        function haveString(haveOrder,status){
          if(status == 1){
            if(haveOrder == 1){
              return '服务中'
            }else{
              return '立即约她'
            }
          }else{
            return '休息中'
          }
        }

        function starWidth(star){
          if(star === 0){
            return 'display:none;'
          }else{
            return 'width:'+ (star/5 * 3.5) + 'rem;'
          }
        };

        function dealOnline(serviceStatus,haveOrder){
          if(serviceStatus != 1 || haveOrder == 1){
            return '&haveOrder=true'
          }else{
            return ''
          }
        }

        //处理是否有inviteAddress参数
        function isHaveAddress(){
    			if(ios.inviteAddress || theRequest.inviteAddress){
    				var testAddress = ios.inviteAddress || theRequest.inviteAddress;
    	        	$('#index-search a').attr('href','javascript:void(0);')
    				return '&inviteAddress=' + testAddress + '&hasChose=true'
    			}else{
    				return ''
    			}
        }


        function lazyload(event) {
          var n = 0;
          var imgNum=$('.rank img').length;img=$('.rank img');
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

        //当前页数，总页数
        var tab1Page = 0,tab2Page = 0,pageCount = 10,downTime = 400;
        var dropload = $('.content').dropload({
          scrollArea : window,
          //下拉文档
          domUp : {
                  domClass   : 'dropload-up',
                  domRefresh : '<div class="dropload-refresh">↓下拉刷新</div>',
                  domUpdate  : '<div class="dropload-update">↑释放更新</div>',
                  domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>'
              },
              //上拉文档
              domDown : {
                  domClass   : 'dropload-down',
                  domRefresh : '<div class="dropload-refresh">↑上拉加载更多</div>',
                  domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
                  domNoData  : '<div class="dropload-noData">已经到底了</div>'
              },

          //下拉加载更多
          loadDownFn : function(me){
            //加载菜单一的数据
            var result = '';
            if(itemIndex == '0'){
              tab1Page++;
              var data = JSON.stringify({'pageNumb': tab1Page});
              $.ajax({
                type: 'GET',
                data: {'json' : data},
                url: dataUrl + '/user/free/creditList.do',
                dataType: 'json',
                success: function(res){
                  console.log(res.data);
                  pageCount = res.data.pageCount;
                  var data = res.data.creditList;
                  if(tab1Page <= pageCount+1){
                    for(var i = 0; i < data.length;i++){
                      result += '<li>'+
                                '<a href="'+ detailUrl +'?userId=' + theRequest.userId +'&babyId='+ data[i].id + isHaveAddress() + dealOnline(data[i].serviceStatus,data[i].haveOrder) +'">'+
                                    '<div class="top-num">'+ (i+((tab1Page-1)*10) +1) +'</div>'+
                                    '<div class="baby-top">'+
                                       '<div class="top-pic">'+
                                           '<div class="rank">'+
                                              '<div class="bg-view"></div>'+
                                                '<img src="" data-src="'+ data[i].photo +'" alt="">'+
                                           '</div>'+
                                       '</div>'+
                                       '<div class="baby-message">'+
                                           '<p class="baby-name"><strong>' + data[i].nickName + '</strong><span>' + data[i].age + '岁</span></p>'+
                                           '<p class="message-height"><em>' + data[i].height + 'cm</em><span>' + data[i].weight + 'kg</span></p>'+
                                           '<div class="baby-star">'+
                                               '<div class="star-view"><div class="guly-star"></div><div class="guly-star"></div><div class="guly-star"></div><div class="guly-star"></div><div class="guly-star"></div><div class="has-star" style="'+ starWidth(data[i].rateAvg) +'"><div class="yellow-view"><div class="yellow-star"></div><div class="yellow-star"></div><div class="yellow-star"></div><div class="yellow-star"></div><div class="yellow-star"></div></div></div></div>'+
                                               '<span>' + data[i].rateAvg + '</span>'+
                                           '</div>'+
                                       '</div>'+
                                   '</div> '+
                                '</a>'+
                                '<div babyId="'+ data[i].id +'" class="'+ isHaveOrder(data[i].haveOrder,data[i].serviceStatus) +'"><div>'+ haveString(data[i].haveOrder,data[i].serviceStatus) +'</div></div>'+
                            '</li>';
                    }
                    if(tab1Page >= pageCount){
                      // 数据加载完
                      me.lock();
                      me.noData();
                    }
                    //设置延迟一秒
                    setTimeout(function(){
                      $('.lists').eq(0).append(result);
                      lazyload();
                      me.resetload();
                    },downTime);
                  }
                },
                error: function(xhr, type){
                  console.log('ajax error!');
                  me.resetload();
                }
              });
            }else if(itemIndex == '1'){
              tab2Page++;
              var data = JSON.stringify({'pageNumb': tab2Page});
              $.ajax({
                type: 'GET',
                data: {'json' : data},
                url: dataUrl +  '/user/free/popularList.do',
                dataType: 'json',
                success: function(res){
             	  pageCount = res.data.pageCount;
                  var data = res.data.popularList;
                  if(tab2Page <= pageCount){
                    for(var i = 0; i < data.length;i++){
                      result += '<li>'+
                                '<a href="'+ detailUrl +'?userId=' + theRequest.userId +'&babyId='+ data[i].id + isHaveAddress() + dealOnline(data[i].serviceStatus,data[i].haveOrder) +'">'+
                                    '<div class="top-num">'+ (i+((tab2Page-1)*10) +1) +'</div>'+
                                    '<div class="baby-top">'+
                                       '<div class="top-pic">'+
                                           '<div class="rank">'+
                                              '<div class="bg-view"></div>'+
                                                '<img src="" data-src="'+ data[i].photo +'" alt="">'+
                                           '</div>'+
                                       '</div>'+
                                       '<div class="baby-message">'+
                                           '<p class="baby-name"><strong>' + data[i].nickName + '</strong><span>' + data[i].age + '岁</span></p>'+
                                           '<p class="message-height"><em>' + data[i].height + 'cm</em><span>' + data[i].weight + 'kg</span></p>'+
                                           '<div class="baby-list">已约'+ data[i].orderCounter +'单</div>'+
                                       '</div>'+
                                   '</div>'+
                                '</a>'+
                                '<div babyId="'+ data[i].id +'" class="'+ isHaveOrder(data[i].haveOrder,data[i].serviceStatus) +'"><div>'+ haveString(data[i].haveOrder,data[i].serviceStatus) +'</div></div>'+
                            '</li>';
                    }
                    if(tab2Page >= pageCount){
                      me.lock();
                      me.noData();
                    }
                    //设置延迟一秒
                    setTimeout(function(){
                      $('.lists').eq(1).append(result);
                      lazyload();
                      me.resetload();
                    },downTime);
                  }
                },
                error: function(xhr, type){
                  me.resetload();
                }
              });
            }
          },

          //上拉刷新
          loadUpFn: function(me){
            tab1Page = 1;tab2Page = 1;
            if(itemIndex == '0'){
              var data = JSON.stringify({'pageNumb': tab1Page});
              $.ajax({
                type: 'GET',
                data: {'json' : data},
                url: dataUrl +  '/user/free/creditList.do',
                dataType: 'json',
                success: function(res){
                  var data = res.data.creditList;
                  var result = '';
                  if(tab1Page <= pageCount){
                    for(var i = 0; i < data.length;i++){
                      result += '<li>'+
                                '<a href="'+ detailUrl +'?userId=' + theRequest.userId +'&babyId='+ data[i].id + isHaveAddress() + dealOnline(data[i].serviceStatus,data[i].haveOrder) +'">'+
                                    '<div class="top-num">'+ (i+((tab1Page-1)*10) +1) +'</div>'+
                                    '<div class="baby-top">'+
                                       '<div class="top-pic">'+
                                           '<div class="rank">'+
                                              '<div class="bg-view"></div>'+
                                                '<img src="" data-src="'+ data[i].photo +'" alt="">'+
                                           '</div>'+
                                       '</div>'+
                                       '<div class="baby-message">'+
                                           '<p class="baby-name"><strong>' + data[i].nickName + '</strong><span>' + data[i].age + '岁</span></p>'+
                                           '<p class="message-height"><em>' + data[i].height + 'cm</em><span>' + data[i].weight + 'kg</span></p>'+
                                           '<div class="baby-star">'+
                                               '<div class="star-view"><div class="guly-star"></div><div class="guly-star"></div><div class="guly-star"></div><div class="guly-star"></div><div class="guly-star"></div><div class="has-star" style="'+ starWidth(data[i].rateAvg) +'"><div class="yellow-view"><div class="yellow-star"></div><div class="yellow-star"></div><div class="yellow-star"></div><div class="yellow-star"></div><div class="yellow-star"></div></div></div></div>'+
                                               '<span>' + data[i].rateAvg + '</span>'+
                                           '</div>'+
                                       '</div>'+
                                   '</div> '+
                                '</a>'+
                                '<div babyId="'+ data[i].id +'" class="'+ isHaveOrder(data[i].haveOrder,data[i].serviceStatus) +'"><div>'+ haveString(data[i].haveOrder,data[i].serviceStatus) +'</div></div>'+
                            '</li>';
                    }
                    if((tab1Page-1) >= pageCount){
                      me.lock();
                      me.noData();
                    }
                    //设置延迟一秒
                    setTimeout(function(){
                      $('.lists').eq(0).html(result);
                      lazyload();
                      me.resetload();
                      me.unlock();
                      me.noData(false);
                    },downTime);
                  }
                },
                error: function(xhr, type){
                  me.resetload();
                }
              });
            }else if(itemIndex == '1'){
              var data = JSON.stringify({'pageNumb': tab2Page});
              $.ajax({
                type: 'GET',
                data: {'json' : data},
                url: dataUrl +  '/user/free/popularList.do',
                dataType: 'json',
                success: function(res){
                  var data = res.data.popularList;
                  var result = '';
                  if(tab2Page <= data.length){
                    for(var i = 0; i < data.length;i++){
                      result += '<li>'+
                                '<a href="'+ detailUrl +'?userId=' + theRequest.userId +'&babyId='+ data[i].id + isHaveAddress() + dealOnline(data[i].serviceStatus,data[i].haveOrder) +'">'+
                                    '<div class="top-num">'+ (i+((tab2Page-1)*10) +1) +'</div>'+
                                    '<div class="baby-top">'+
                                       '<div class="top-pic">'+
                                           '<div class="rank">'+
                                              '<div class="bg-view"></div>'+
                                                '<img src="" data-src="'+ data[i].photo +'" alt="">'+
                                           '</div>'+
                                       '</div>'+
                                       '<div class="baby-message">'+
                                           '<p class="baby-name"><strong>' + data[i].nickName + '</strong><span>' + data[i].age + '岁</span></p>'+
                                           '<p class="message-height"><em>' + data[i].height + 'cm</em><span>' + data[i].weight + 'kg</span></p>'+
                                           '<div class="baby-list">已约'+ data[i].orderCounter +'单</div>'+
                                       '</div>'+
                                   '</div>'+
                                '</a>'+
                                '<div babyId="'+ data[i].id +'" class="'+ isHaveOrder(data[i].haveOrder,data[i].serviceStatus) +'"><div>'+ haveString(data[i].haveOrder,data[i].serviceStatus) +'</div></div>'+
                            '</li>';
                    }
                    if((tab2Page-1) >= pageCount){
                      me.lock();
                      me.noData();
                    }
                    //设置延迟一秒
                    setTimeout(function(){
                      $('.lists').eq(1).html(result);
                      lazyload();
                      me.resetload();
                      me.unlock();
                      me.noData(false);
                    },downTime);
                  }
                },
                error: function(xhr, type){
                  me.resetload();
                }
              });
            }
          }
        })
      }
    }, 10);
})
