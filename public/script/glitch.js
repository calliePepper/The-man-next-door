function glitchThis(targetImage) {
        //$('body').prepend('<audio id="whispers" src="sounds/whispers.mp3" volume="0.2"></audio>');
        //$('#whispers').prop('volume',0.06);
       // var audioEl = document.getElementById('whispers');
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
                    jpgHeaderLength = i + 2; return;
                }
            }
        }
        
        // base64 is 2^6, byte is 2^8, every 4 base64 values create three bytes
        function base64ToByteArray(str) {
            var result = [], digitNum, cur, prev;
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
        
        function byteArrayToBase64(arr) {
           var result = ["data:image/jpeg;base64,"], byteNum, cur, prev;
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
        
        function glitchJpegBytes(strArr) {
            var rnd = Math.floor(jpgHeaderLength + Math.random() * (strArr.length - jpgHeaderLength - 4));
            strArr[rnd] = Math.floor(Math.random() * 256);
        }
        
        var glitchCounter = 0;
        var replaceGlitch = 10;
        
        function glitchJpeg() {
            if (glitchCounter >= 40) {
                var img = ctx.createImageData(400, 400);
                for (var i = img.data.length; --i >= 0; )
                    img.data[i] = 0;
                ctx.putImageData(img, 0, 0);
            } else {
                glitchCounter++;
                if (targetImage == "backyard") {
                    var w = window.innerWidth;
                    var h = window.innerHeight;
                    var cw = 400, ch = 400, th = 0, tw = 0;
                    if (h > w) {
                        console.log(w + ' vs ' + h)
                        cw = ((h / 0.707) / w) * 400;
                        console.log(cw);
                    } else {
                        ch = ((w * 0.707) / h) * 400;
                        console.log(ch);
                    }
                    if (Math.floor(Math.random() * 2) + 1 == 2 || replaceGlitch == 0) {
                        ctx.drawImage(initialImage,200 - cw / 2, 200 - ch / 2,cw,ch);
                        replaceGlitch = 10;
                    } else {
                        ctx.drawImage(initialImage2,200 - cw / 2, 200 - ch / 2,cw,ch);
                        replaceGlitch--;
                    }
                    var imgData = canvas.toDataURL("image/jpeg");
                    imgDataArr = base64ToByteArray(imgData);
                    detectJpegHeaderSize(imgDataArr);
                }
                var glitchCopy = imgDataArr.slice();
                for (var i = 0; i < 10; i++) {
                    glitchJpegBytes(glitchCopy);
                }
                var img = new Image();
                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                    setTimeout(glitchJpeg, 50);
                }
                img.onerror = function() {
                    var img = ctx.createImageData(400, 400);
                    for (var i = img.data.length; --i >= 0; )
                        img.data[i] = 0;
                    ctx.putImageData(img, 0, 0);
                }
                img.src = byteArrayToBase64(glitchCopy);
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
                cw = ((h / 0.707) / w) * 400;
                console.log(cw);
            } else {
                ch = ((w * 0.707) / h) * 400;
                console.log(ch);
            }
            ctx.drawImage(initialImage,200 - cw / 2, 200 - ch / 2,cw,ch);
            var imgData = canvas.toDataURL("image/jpeg");
            imgDataArr = base64ToByteArray(imgData);
            detectJpegHeaderSize(imgDataArr);
            glitchJpeg();
            
            /*audioEl.play();
            $('#glitched').fadeIn('fast',function() {
                setTimeout(function() {
                    $('#glitched').fadeOut('fast',function() {
                        $('#glitched').remove();
                        audioEl.pause();
                        $('#whispers').remove();
                    });
                }, 800);
            });*/
            // console.log(imgData.substring(0,30));
            // console.log(imgDataArr.slice(0, 30));
            // console.log (img.src.substring(0,30));
        };
        if (targetImage == "marcel") {
            initialImage.src = "../img/marcelAvatar.jpg";
        } else if (targetImage == "backyard") {
            initialImage.src = "../img/backyard.jpg";
            initialImage2.src = "../img/backyard_w_hound.jpg";
        } else {
            initialImage.src = "../img/code.jpg";
        }
}