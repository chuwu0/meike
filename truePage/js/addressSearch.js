$(function(){

	var setUrl = 'http://101.37.33.119:8088/meike-mener';

	theRequest = new Object();
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

	function addT(){
		return '&t=' + new Date().getTime();
	}

	$.ajax({
		url: setUrl + '/user/free/seachPlaceName.do',
		type:'GET',
		data: {},
		dataType: 'json',
		success: function(res){
			var data = res.data,dom = '';
			for(var i = 0; i < data.length;i++){
				dom += `<li><a href="babyList.html?userId=`+ theRequest.userId + `&address=` + data[i].address + addT() +`">`+ data[i].address +`</a><li>`;
			}
			$('#adressList').append(dom);
		},
		error: function(res){
			console.log(res.msg);
		}
	})

	//获取焦点时去除样式
	$(document).on('focus','#search',function(){
		$('.icon').hide();
		$('#search').attr('placeholder','');
	})

	//模糊查询
	$(document).on('input propertychange','#search',function(e){
		if(e.type === 'input' || e.orignalEventName === 'value'){
			var value = $(this).val().toString();
			console.log(value);
			var data = JSON.stringify({'site': value});
			$('#adressList').html('');
			$.ajax({
				url: setUrl + '/user/free/seachSite.do',
				type:'GET',
				data: {'json': data},
				dataType: 'json',
				success: function(res){
					console.log(res);
					var data = res.data,dom = '';
					for(var i = 0; i < data.length;i++){
						dom += `<li><a href="babyList.html?userId=`+ theRequest.userId + `&address=` + data[i].address + addT() +`">`+ data[i].address +`</a><li>`;
					}
					$('#adressList').append(dom);
				},
				error: function(res){
					console.log(res.msg);
				}
			})
		}
	});
})
