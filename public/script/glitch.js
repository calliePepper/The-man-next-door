function glitchThis(targetImage) {
    console.log(' SON OF A GLITCH ');
    $('body').prepend('<audio id="whispers" src="sounds/whispers.mp3" volume="0.2"></audio>');
    $('#whispers').prop('volume',0.06);
    var audioEl = document.getElementById('whispers');
    var canvas = document.getElementById('canvasFront');

    var ctx = canvas.getContext('2d');
    var jpgHeaderLength;
    var base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var base64Map = base64Chars.split("");
    var reverseBase64Map = {}; base64Map.forEach(function(val, key) { reverseBase64Map[val] = key} );
    
    function detectJpegHeaderSize(data) {
        jpgHeaderLength = 417;
        for (var i = 0, l = data.length; i < l; i++) {
            if (data[i] == 0xFF && data[i+1] == 0xDA) {
                //console.log("xxxxxxx<<<<", data[i], data[i+1], i, l);
                jpgHeaderLength = i+10; return;
            }
        }
    }
    
    // base64 is 2^6, byte is 2^8, every 4 base64 values create three bytes
    function base64ToByteArray(str) {
        result = []
        var digitNum, cur, prev;
        for (var i = 23, l = str.length; i < l; i++) {
            cur = reverseBase64Map[str.charAt(i)];
            digitNum = (i-23) % 4;
            switch(digitNum){
                //case 0: first digit - do nothing, not enough info to work with
                case 1: //second digit
                    result.push(prev << 2 | cur >> 4);
                    break;
                case 2: //third digit
                    result.push((prev & 0x0f) << 4 | cur >> 2);
                    break;
                case 3: //fourth digit
                    result.push((prev & 3) << 6 | cur);
                    break;
            }
            prev = cur;
        }
        return result;
    }
    
    var result
    var byteNum, cur, prev;
    
    function byteArrayToBase64(arr) {
       result = ["data:image/jpeg;base64,"]
       
        for (var i = 0, l = arr.length; i < l; i++) {
            cur = arr[i];
            byteNum = i % 3;
            switch (byteNum) {
                case 0: //first byte
                    result.push(base64Map[cur >> 2]);
                    break;
                case 1: //second byte
                    result.push(base64Map[(prev & 3) << 4 | (cur >> 4)]);
                    break;
                case 2: //third byte
                    result.push(base64Map[(prev & 0x0f) << 2 | (cur >> 6)]);
                    result.push(base64Map[cur & 0x3f]);
                    break;
            }
            prev = cur;
        }
        if (byteNum == 0) {
            result.push(base64Map[(prev & 3) << 4]);
            result.push("==");
        } else if (byteNum == 1) {
            result.push(base64Map[(prev & 0x0f) << 2]);
            result.push("=");
        }
        return result.join("");
    }
    
    var stringChange;
    var changeData;
    
    function glitchJpegBytes(strArr) {
        stringChange = Math.floor(jpgHeaderLength + Math.random() * (strArr.length - jpgHeaderLength));
        originalData = strArr[stringChange];
        changeData = Math.floor(Math.random() * 254)
        strArr[stringChange] = changeData;
    }
    
    var glitchCounter = 0;
    var replaceGlitch = 10;
    
    var glitchCopy
    var glitchImg = new Image();
    
    glitchImg.onload = function() {
        freeData(glitchImg, glitch);
    }
    
    glitchImg.onerror = function(evt) {
        ctx.clearRect(0, 0, 400,400);
        $('#canvasFront').remove();
        $('body').prepend('<canvas id="canvasFront" width="400px" height="400px"></canvas>');
    }
    
    function glitchJpeg() {
        var header;
        if (glitchCounter > 20) {
            ctx.clearRect(0, 0, 400,400);
            $('#canvasFront').remove();
            $('body').prepend('<canvas id="canvasFront" width="400px" height="400px"></canvas>');
        } else {
            glitchCounter++;
            glitchCopy = imgDataArr.slice();
            for (var i = 0; i < 7; i++) {
                glitchJpegBytes(glitchCopy);
            }
            glitchImg.src = byteArrayToBase64(glitchCopy);
        }
    }
    
    function freeData(img, glitch) {
        ctx.drawImage(img, 0, 0);
        if (Math.floor(Math.random() * 8) == 0) {
            var timer = Math.floor(Math.random() * 200) + 100;
            console.log(glitchCounter + ' - ' + timer);
            setTimeout(glitchJpeg, timer);
        } else {
            var timer = Math.floor(Math.random() * 50) + 10;
            console.log(glitchCounter + ' - ' + timer);
            setTimeout(glitchJpeg, timer);
        }
    }
    
    var initialImage = new Image();
    var initialImage2 = new Image();
    var imgDataArr;
    initialImage.onload = function() {
        var w = window.innerWidth;
        var h = window.innerHeight;
        var cw = 400, ch = 400, th = 0, tw = 0;
        if (h > w) {
            console.log(w + ' vs ' + h)
            cw = (h / w) * 400;
            console.log(cw);
        } else {
            ch = (w / h) * 400;
            console.log(ch);
        }
        ctx.drawImage(initialImage,200 - cw / 2, 200 - ch / 2,cw,ch);
        var imgData = canvas.toDataURL("image/jpeg");
        imgDataArr = base64ToByteArray(imgData);
        detectJpegHeaderSize(imgDataArr);
        glitchJpeg();
        
        audioEl.play();
            setTimeout(function() {
                    audioEl.pause();
                    $('#whispers').remove();
            }, 800);
    };
    
    var pathMachine = '../img/'
    
    if (mobNotifications == 1) {
        var pathMachine = '../www/img/';
    }
    
    if (targetImage == "marcel") {
        initialImage.src = pathMachine + "marcelAvatarGlitch.jpg";
    } else if (targetImage == "backyard") {
        //initialImage.src = pathMachine + "backyard.jpg";
        //initialImage2.src = pathMachine + "backyard_w_hound.jpg";
        initialImage.src = pathMachine + "backyard_w_hound.jpg";
    } else {
        initialImage.src = pathMachine + "code.jpg";
    }
}