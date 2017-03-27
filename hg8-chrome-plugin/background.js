function checkNewOrders(tabId, changeInfo, tab) {
  if (tab.url.toLowerCase() == "https://www.youdians.com/console/order/#/order/list" && changeInfo.status == 'complete') {
    chrome.pageAction.show(tabId);
    var interval_handler = action();
  }
};

function action() {
  var timeout = random(1, 5)*1000*60;
  console.log(timeout);
  return setInterval(function(){
      $.ajax({
        url: "https://www.youdians.com/order/getOrderList?method=&orderSearch=orderNum&orderStatus=payed&order_type=&page=1&pagesize=25&searchKey=",
        cache: false,
        type: "GET",
        dataType: "json"
      }).done(function (msg) {
        if(msg && msg.totalCounts >= 0){
          show();
        }
        clearInterval(interval_handler);
        interval_handler = action();
      }).fail(function (jqXHR, textStatus) {
        console.log(textStatus);
        clearInterval(interval_handler);
        interval_handler = action();
      });
    }, timeout);
}

function random(m, n){
  return Math.random()*(n-m)+m;
}

function show() {
  var time = /(..)(:..)/.exec(new Date());     // The prettyprinted time.
  var hour = time[1] % 12 || 12;               // The prettyprinted hour.
  var period = time[1] < 12 ? 'a.m.' : 'p.m.'; // The period of the day.
  new Notification(hour + time[2] + ' ' + period, {
    icon: '48.png',
    body: '您有新订单，请及时处理！！！'
  });
  audio.play();
}

chrome.tabs.onUpdated.addListener(checkNewOrders);

var base_url = 'http://www.haigo8.top/';
var ding_file = 'ding.mp3';
var audio = new Audio();
audio.id = 'ding';
audio.src = base_url + ding_file;
audio.load();
var interval_handler;

var articleData = {};
articleData.error = "加载中...";
chrome.runtime.onMessage.addListener(function (request, sender, sendRequest) {
  if (request.type !== "cnblog-article-information")
    return;
  articleData = request;
  articleData.firstAccess = "获取中...";
  if (!articleData.error) {
    $.ajax({
      url: "http://localhost/first_access.php",
      cache: false,
      type: "POST",
      data: JSON.stringify({ url: articleData.url }),
      dataType: "json"
    }).done(function (msg) {
      if (msg.error) {
        articleData.firstAccess = msg.error;
      } else {
        articleData.firstAccess = msg.firstAccess;
      }
    }).fail(function (jqXHR, textStatus) {
      articleData.firstAccess = textStatus;
    });
  }
});
