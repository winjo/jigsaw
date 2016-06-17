$(function () {	
	var num = 3;
	var src;
	var pos = [];
	var timeCount;
	var count = 0;
	//测试
	var test = false;
	if (test) {
		src = "images/test.jpg";
		divide(src);
	}
	//读取本地存储
	readStorage();
	//难度选择
	$(":radio").click(function () {
		if (this.value == "easy") {
			num = 3;
		} else if (this.value == "medium") {
			num = 4;
		} else if (this.value == "hard") {
			num = 5;
		}
		divide(src, num);
	}).eq(0).click();
	//图片选择
	$("select").on("change", function(){
		var category = ".pic-" + $(this).val();
		$(category).fadeIn().siblings().fadeOut();
	}).val($("select").find(":first-child").val());

	$(".picture").on("click", "li img", function(e) {
		src = $(e.target).attr("src");
		// $(".game").css("background", "url(" + src +")");
		divide(src);
		$(e.target).parent().removeClass().addClass("choose")
			.siblings().removeClass().addClass("not-choose");
	});

	//开始
	$(".start").click(function () {
		//随机变换位置
		var arr = randomArray(num * num);
		count = 0;

		for (var i = 0; i < arr.length; i++) {
			var $div = $(".game div").eq(i);
			$div.attr({
					"id": "p" + arr[i],
					"order1": arr[i]
				}).animate({
					"left": pos[arr[i]].left + "px",
					"top": pos[arr[i]].top + "px"
				}, "fast");
			if ($div.attr("order1") == $div.attr("order0")) {
				count += 1;
			}
		}
		//计时
		var initialTime = (new Date()).getTime();
		timeCount = setInterval(function() {
			var duration = (new Date()).getTime() - initialTime;
			var seconds = Math.round(duration / 1000);
			$(".side-right .time").text(seconds);
		}, 1000);
		//把选择区域设为不可选
		$(this).addClass("btn-drop disabled");
		$(".side-left").addClass("disabled");
		$(".side-right").addClass("disabled");
		$(".game").removeClass("disabled");
	});
	//结束
	$(".end").click(function () {
		clearInterval(timeCount);

		for (var i = 0; i < pos.length; i++) {
			$(".game div").eq(i).css({
				"left" : pos[i].left + "px",
				"top" : pos[i].top + "px"
			});
		}
		//回复选择区域
		$(".start").removeClass("btn-drop disabled");
		$(".side-left").removeClass("disabled");
		$(".side-right").removeClass("disabled");
		$(".game").addClass("disabled");
		$(".side-right .time").text(0);
	});
	//游戏区
	$(".game").on("mousedown", "div", function(e) {
		var $target = $(e.target);
		var pWidth = $(this).parent().width();
		var pHeight = $(this).parent().height();
		var tWidth = $(this).width();
		var tHeight = $(this).height();
		var tarLeft = $target.position().left;
		var tarTop = $target.position().top;
		var disX = e.pageX - tarLeft;
		var disY = e.pageY - tarTop;
		var left, top;
		$(this).parent().mousemove(function(e) {
			left = e.pageX - disX;
			top = e.pageY - disY;
			if (left < 0) {
				left = 0;
			} else if (left > pWidth - tWidth) {
				left = pWidth - tWidth;
			}
			if (top < 0) {
				top = 0;
			} else if (top > pHeight - tHeight) {
				top = pHeight - tHeight;
			}
			$target.css({
				"left": left + "px",
				"top": top + "px"
			});
			$target.css("z-index", 10).siblings().css("z-index", 1);
		});
		$(document).mouseup(function() {			
			$target.parent().off("mousemove");
			$(this).off("mouseup");
			//设置距离容差
			var base = 480 / num;
			var tol = base / 4;
			var l = -1, t = -1;

			for (var i = 0; i < num; i++) {
				if (left >= (base * i - tol) && left <= (base * i + tol)) {
					l = i;
				}
				if (top >= (base * i - tol) && top <= (base * i + tol)) {
					t = i;
				}
				if ((l != -1) && (t != -1)) {
						break;
				}
			}
			//交换选择的图片和目标图片的位置
			var t0 = $target.attr("order0");
			var t1 = $target.attr("order1");
			var t2 = l + t * num;
			var $des = $("#p" + t2);
			var d0 = $des.attr("order0");
			var d1 = $des.attr("order1");
			var d2 = t1;
			
			if (l == -1 || t == -1 || t1 == d1) {
				$target.css({
					"left": tarLeft + "px",
					"top": tarTop + "px"
				});
			} else {
				$des.css({
						"left": tarLeft + "px",
						"top": tarTop + "px"
					})
					.attr({
						"order1": d2,
						"id": "p" + d2
					});
				$target.css({
						"left": (base * l) + "px",
						"top": (base * t) + "px"
					})
					.attr({
						"order1": t2,
						"id": "p" + t2
					});
				//计分，每放对一个位置得一分，放错一个位置减一分
				if (t1 == t0) {
					if (d1 == d0) {
						count -= 2;
					} else {
						count -= 1;
					}
				} else {
					if (d1 == d0) {
						count -= 1;
					} else {
						if (t2 == t0) {
							if (d2 == d0) {
								count += 2;
							} else {
								count += 1;
							}
						} else {
							if (d2 == d0) {
								count += 1;
							} else {
								count += 0;
							}
						}
					}
				}
				//分数等于分割的碎片总数则完成	
				if (count == num * num) {
					clearInterval(timeCount);
					$(".start").removeClass("btn-drop disabled");
					$(".side-left").removeClass("disabled");
					$(".side-right").removeClass("disabled");
					$(".game").addClass("disabled");

					var txt;
					var flag = false;
					var secs = $(".side-right .time").text() - 0;
					var record = JSON.parse(localStorage.record);

					if (num == 3) {
						txt = "简单（3x3）";

						if (!record.easy || secs < record.easy) {
							record.easy = secs;
							$(".best .easy").text(secs);
							flag = true;
						}

					} else if (num == 4) {
						txt = "中等（4x4）";

						if (!record.medium || secs < record.medium) {
							record.medium = secs;
							$(".best .medium").text(secs);
							flag = true;
						}

					} else if (num == 5) {
						txt = "困难（5x5）";

						if (!record.hard || secs < record.hard) {
							record.hard = secs;
							$(".best .hard").text(secs);
							flag = true;
						}
					}

					//开启弹窗
					if (flag) {
						$(".v-modal").find(".time em").text("新纪录");
						localStorage.record = JSON.stringify(record);
					}
					$(".v-modal").fadeIn(300).addClass("in").find(".difficulty span").text(txt)
						.end().find(".time span").text(secs);

				}

			}
		});
		return false;
	});
	//退出弹窗
	$(".dialog button").click(function() {
		$(this).parents(".v-modal").fadeOut(300).removeClass("in")
			.find(".time em").text('');
		$(".side-right .time").text(0);
	});

	/*作用：分割图片
	  参数：src 必须，根据图片切换背景
		    num 可选，根据难度创建div元素，若无，则不创建
	  返回值：无
	*/
	function divide(src, num) {
		if (num) {
			var imgWidth = 480 / num;
			pos = [];
			$(".game div").remove();
			for (var i = 0; i < num; i++) {
				for (var j = 0; j < num; j++) {
					var tmp = {};
					tmp.top = i * imgWidth;
					tmp.left = j * imgWidth;
					$piece = $("<div></div>");
					$piece.appendTo(".game").css({
						"background-position" : "-" + tmp.left +"px " + "-" + tmp.top +"px", 
						"border-right" : "1px dotted #ff0", 
						"border-bottom" : "1px dotted #ff0",
						"width" : imgWidth + "px", 
						"height" : imgWidth + "px",
						"left" : tmp.left + "px",
						"top" : tmp.top + "px"
					}).attr({"id": "p" + (i * num + j),
							"order1": i * num + j,
							"order0": i * num + j
						});
					pos.push(tmp);
				}		
			}
		}
	    $(".game div").css("background-image", "url(" + src +")");
	}
	
	/*作用：产生连续随机整数数组
	  参数：length 数组长度
	  返回值：生成的随机数组
	*/
	function randomArray(length) {
		var arr = [];
		var res = [];
		var index, i;
		//先新建一个1~length-1的整数数组
		for (i = 0; i < length; i++) {
			arr.push(i);
		}
		//每次随机抽取一个数放进新数组，类似抽牌
		for (i = 0; i < length; i++) {
			index = Math.floor(Math.random() * arr.length);
			res.push(arr[index]);
			arr.splice(index, 1);
		}
		return res;
	}

	/*作用：读取localStorage里的值，若无，则新建
	  参数：无
	  返回值：无
	*/
	function readStorage() {
		var record;
		if (localStorage.record) {
			record = JSON.parse(localStorage.record);
			$(".best").find(".easy").text(record.easy)
				.end().find(".medium").text(record.medium)
				.end().find(".hard").text(record.hard);
		} else {
			record = {easy: '', medium: '', hard: ''};
			localStorage.record = JSON.stringify(record);
		}	
	}

});

