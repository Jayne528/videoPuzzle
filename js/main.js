

// <!-- canvas 影像拼圖 -->
window.addEventListener('load',eventWindowLoaded, false);

var videoElement;
var videoDiv;

//建立 標籤<video><div>
function eventWindowLoaded(){

    //變數 videoElement = <video>
    videoElement = document.createElement("video");

    //變數 videoDiv = <div>
    videoDiv = document.createElement("div");

    //在文件上建立<div>
    document.body.appendChild(videoDiv);

    //在<div>內建立 <video>
    videoDiv.appendChild(videoElement);

    //在<div> 標籤裡建立一個屬性 style
    videoDiv.setAttribute("style", "display:none");

    //建立一個變數videoType 來保存  function supportedVideoFormat(video) 函式內所產生結果 
    var videoType = supportedVideoFormat(videoElement);    
    if (videoType == "") {  // 如果回傳空字串  就會顯示no video support
        alert("no video support");
        return;
    }
    // 從function supportedVideoFormat(video) 得到 video 的檔案格式
    videoElement.setAttribute("src", "video/videoplayback" + videoType);  // 中間式影片檔名
    videoElement.addEventListener("canplaythrough",videoLoaded, false);    // 影片下載完成後 會去呼叫videoLoaded

    }

    //這個函式會回傳瀏覽器支援的影像格式，如沒支援就會回傳""(空字串)
    // canPlayType 只能接受MIME(MIME 是描述消息內容類型的 internet 標準)類型的參數，他會回傳"maybe"(無法確定)、"probably"(知道類型可呈現)"跟 "空白"(空字串)(知道類型但無法呈現)這三種任一而已
    function supportedVideoFormat(video) {
        var returnExtension = "";
        if(video.canPlayType("video/mp4") == "probably" || video.canPlayType("video/mp4") == "maybe") {
            returnExtension = ".mp4";
        } else if(video.canPlayType("video/webm") == "probably" || video.canPlayType("video/webm") == "maybe") {
            returnExtension = ".webm";
        } else if(video.canPlayType("video/ogg") == "probably" || video.canPlayType("video/ogg") == "maybe") {
            returnExtension = ".ogg";
        }
        return returnExtension;
    }


    function canvasSupport () {
        return Modernizr.canvas;
    }

    //videoLoaded 事件觸發後 去呼叫canvasApp();
    function videoLoaded (event) {
        canvasApp();
    }

    function canvasApp(){
        if (!canvasSupport()) {
            return;
        }

        // 1.在canvas上載入影像，但不顯示他
        // 2.決定在拼圖上想要分成幾個部分
        // 3.建立一個棋盤式的拼圖陣列容納所有的拼圖圖片
        // 4.這些圖片會被顯示在4*4 的格子裡
        // 5.將板子的圖片任意排列，使拼圖看起來混亂
        // 6.為滑鼠左鑑建立一個監聽
        // 7.設定一個時間間格去呼叫drawScreen()
        // 8.等待使用者去點擊拼圖圖片
        // 9.在等待的同時，影片上的各個部分撥放出來，就像是單一影像
        // 10.當使用者去點擊一個拼圖圖片，會顯示黃色去強調他
        // 11.當使用者選擇兩個圖片 會交換彼此位置
        // 12.拜回原本樣子就可以顯示所建立起的影像了


        // 把從randomizeBoard(board)得到亂數位置拼圖畫出
        function drawScreen() {
         
            // //背景
            cx.fillStyle = "#303030";
            cx.fillRect(0, 0, canvas.width, canvas.height);

            // 方形
            cx.strokeStyle = "#FFFFFF";
            cx.strokeRect(5, 5, canvas.width-10, canvas.height-10);

            // cx.clearRect(0, 0, 1000, 600);  // 清除畫布

            for (var c = 0; c < cols; c++){
                for (var r = 0; r < rows; r++){

                    var tempPiece = board[c][r];
                    var imageX = tempPiece.finalCol*partWidth;    //影像寬  tempPiece = board[0][0]; => 0*320
                    var imageY = tempPiece.finalRow*partHeight;  //影像高 tempPiece = board[0][0]; => 0*240
                    var placeX = c*partWidth + c*xPad + startXOffset;  // canvas 位置  c=0  0*影像寬 + 0*列與列的空格 + startXOffset 從canvas 的頂點到我們開始畫拼圖格子這個位置，這之間所佔的像素值
                    var placeY = r*partHeight + r*yPad + startYOffset; //如上

                    cx.drawImage(videoElement, imageX, imageY, partWidth, partHeight, placeX, placeY, partWidth, partHeight);

                    // 如果拼圖被標記選取(選取的布林值為 true)，在圖片周圍繪製一個黃色框框
                    if(tempPiece.selected){

                        cx.strokeStyle = "#FFFF00";
                        cx.strokeRect(placeX, placeY, partWidth, partHeight);
                    }
                }
            }            

        }

        // 從剛剛位置 來幫每塊拼圖得到新的亂數位置
        function randomizeBoard(board) {
            var newBoard = new Array();   //平行矩陣，來容納任意排列拼圖的圖片
            var cols = board.length;
            var rows = board[0].length;
            for (var i = 0; i < cols; i++) {
                newBoard[i] = new Array();
                for (var j = 0; j < rows; j++) {
                    var found = false;
                    var rndCol = 0;
                    var rndRow = 0;
                    while (!found) {
                        var rndCol = Math.floor(Math.random() * cols);
                        var rndRow = Math.floor(Math.random() * rows);
                        if ( board[rndCol][rndRow] != false ) {
                            found = true;
                        }
                    }
                    newBoard[i][j] = board[rndCol][rndRow];
                    board[rndCol][rndRow] = false;
                }
            }
            return newBoard;
        }

        //MouseUp (使用者放開滑鼠鍵)

        // 當按下滑鼠時，找出滑鼠的游標的x軸及y軸  有些支援(layerX/layerY)，有些支援(offsetX/offsetY) 
        function eventMouseUp(event) {
            var mouseX;
            var mouseY;
            var pieceX;  //片狀圖片的X
            var pieceY;  //片狀圖片的Y

            if( event.layerX || event.layerX == 0) {
                mouseX = event.layerX;
                mouseY = event.layerY;
            } else if( event.offsetX || event.offsetX == 0) {
                mouseX = event.offersetX;
                mouseY = event.offersetY;
            }

            // 進行碰撞檢測
            var selectedList = new Array();  // 兩拼圖交換時會用到

            for (var c = 0 ; c < cols; c++) {   //來讀取每一片拼圖。

                for (var r = 0; r < rows; r++) {
                    pieceX = c*partWidth + c*xPad + startXOffset;   //找出每片的X、Y 放入 pieceX、Y
                    pieceY = r*partHeight + r*yPad + startYOffset;


                    //mouseY >= pieceY 滑鼠游標位在低於或等於片狀圖片的頂端位置
                    //ouseY <= pieceY+partHeight  滑鼠游標位在高於或等於片狀圖片的底部位置
                    //mouseX >= pieceX 滑鼠游標位在片狀圖片的左邊界其右邊的位置 或等於左邊界
                    //ouseX <= pieceX+partWidth 滑鼠游標位在片狀圖片的右邊界其右邊的位置 或等於右邊界

                    if((mouseY >= pieceY) && (mouseY <= pieceY+partHeight) && (mouseX >= pieceX) && (mouseX <= pieceX+partWidth)) {

                        if( board[c][r].selected) {
                            board[c][r].selected = false;   //已經選取的拼圖取消

                        }else {
                            board[c][r].selected = true;   //未選取的拼圖選取
                        }
                    }
                    if(board[c][r].selected) {
                        selectedList.push({col:c,row:r})
                    }
                }
            }

            //在二維元素上交換兩個元素 (三方交換的程式架構)
            if (selectedList.length == 2) {
                var selected1 = selectedList[0];   // selected1 等於selectedList 陣列的第一個
                var selected2 = selectedList[1];  // selected2 等於selectedList 陣列的第二個
                var tempPiece1 = board[selected1.col][selected1.row];

                board[selected1.col][selected1.row] = board[selected2.col][selected2.row];  //第一次交換  把1換成2

                board[selected2.col][selected2.row] = tempPiece1;    //第二次交換 2換成1

                board[selected1.col][selected1.row].selected = false;   //再把兩片的屬性 改為false
                board[selected2.col][selected2.row].selected = false;
            }
        }



        var canvas = document.getElementById("canvas");
        var cx =canvas.getContext("2d");
        window.onclick = function() {
            videoElement.play();
        }



        //拼圖設定

        var rows = 4;  //列
        var cols = 4;  //行
        var xPad = 10;  //列與列之間，空格所佔的像素
        var yPad = 10;  //行與行之間，空格所佔的像素
        var startXOffset = 10;  //從canvas 的左邊到我們開始畫拼圖格子這個位置，這之間所佔的像素值
        var startYOffset = 10;  //從canvas 的頂點到我們開始畫拼圖格子這個位置，這之間所佔的像素值

        var partWidth = videoElement.width/cols;  //每個拼圖的寬度
        var partHeight = videoElement.height/rows;  //每個拼圖的高度
        //320*240
        var partWidth = 210;
        var partHeight = 120;
        var board = new Array();  //用來容納拼圖的 二維矩陣(4*4表格式))
        
        //初始化拼圖板 board[0][0] board[0][1] board[0][2] board[0][3]~ board[3][3] board[3][1] board[3][2] board[3][3]
        //finalCol:i  當拼圖完成每塊拼圖最終停放在行的位置
        //finalRow:j 當拼圖完成每塊拼圖最終停放在列的位置
        //selected  一個布林值，初始為false ，當使用者點擊時式強調或將兩片位置交換

        for(var i = 0; i < cols; i++) {
            board[i] =  new Array();
            for(var j = 0; j < rows; j++) {
                board[i][j] = { finalCol:i,finalRow:j,selected:false };
            }
        }
        board = randomizeBoard(board);

        canvas.addEventListener("mouseup",eventMouseUp, false);

        setInterval(drawScreen, 33);  // 因為是以圖像顯示，所以要連續呼叫draw()， 每隔33秒呼叫一次 影像就會被更新及播放
}


