var ctx;
var fig1;
var fig2;
var rotation=0;
var drot=1;
var started=0;
var tmr=0;
var figures=[];
var figs=[];
var vrx1=[];
var vrx2=[];
var c1={x:100,y:100};
var c2={};
var radius=100;
var axrad=30;
var dr=0;
var pstart=-1;
var pstop=50;
var magnifier=1;

function clip(f,c){
	var ff=[];	
	for (var i=0;i<f.length;i++){
		var point=[];
		var x0=f[i][0]-c.x;
		var y0=f[i][1]-c.y;
		var rad=Math.sqrt(x0*x0+y0*y0);
		if(rad>(radius-dr)){
		  var cos0=x0/rad;
		  var sin0=y0/rad;
		  point[0]=(radius-dr)*cos0+c.x;
		  point[1]=(radius-dr)*sin0+c.y;
		}else{
			point[0]=f[i][0];
			point[1]=f[i][1];
		}
		  if(point[1] >= c.y)
		    ff.push(point);
	}
	return ff;
}

function rotp(p,c,a){
var ang=a*Math.PI/180;	
var point=[];
var x0 = Math.cos(ang) * (p[0] - c.x) - Math.sin(ang) * (p[1]-c.y) + c.x;
var y0 = Math.sin(ang) * (p[0] - c.x) + Math.cos(ang) * (p[1] - c.y) + c.y;
point.push(x0);
point.push(y0);
return point;
}

function rotatevrx(f,c,ang){
var vrx=[];
 for ( var i=0; i<f.length;i++){
	 vrx.push(rotp(f[i],c,ang));
 }
 return vrx;
}

function rotatefigure(f,ang){
var vrx=[];
 for ( var i=0; i<f.vrx.length;i++){
	 vrx.push(rotp(f.vrx[i],f.center,ang));
 }
 f.vrx=vrx;
 return f;
}

function gd(a){
var delta=(a/180)*(radius)*(1-(axrad));
var d=radius-(delta);
return d;
} 
function getPoint0(c1,c2,r,a1,a2){
var point=[];
var ang1=(a1)*Math.PI/180;
var ang2=(180-a1)*Math.PI/180;
var dx=Math.cos(ang2)*(r-dr);
var dy=Math.sin(ang2)*(r-dr);
var x=c2.x+dx;
var y=c2.y+dy;
point.push(x);
point.push(y);
return rotp(point,c1,-a1);
;
}

function getPoint(fig,an){
var point=[];
var ang=(an+fig.rot)*Math.PI/180;
var dd=gd(an);
var dx=Math.cos(ang)*dd;
var dy=Math.sin(ang)*dd;
var x=fig.center.x+dx;
var y=fig.center.y+dy;
point.push(x);
point.push(y);
return point;
}

function fillPair(f1,f2){
var pair=[];
var point;

for (var i=pstart;i<pstop;i++){
point=getPoint0(f1.center,f2.center,radius+1,i,360-i);
f1.vrx.push(point);
}

for (var i=0;i<170;i+=1){
point=getPoint(f1,i);
f1.vrx.push(point);
}
f1.vrx.push(f1.vrx[0]);
f1.vrx=clip(f1.vrx,f1.center);

var tmpf=rotatevrx(f1.vrx,f1.center,180);
var dist=f2.center.x-f1.center.x;
for(var i=0;i<tmpf.length;i++)
  f2.vrx.push([tmpf[i][0]+dist,tmpf[i][1]]); 

var ftmp1=f1;
var ftmp2=f2;
ftmp1.vrx=rotatevrx(f1.vrx,c1,180);
var amfrom=-10;
var amto=80;
for(var i=amfrom;i<amto;i++){	
  ftmp1.vrx=rotatevrx(ftmp1.vrx,c1,1);
  ftmp2.vrx=rotatevrx(ftmp2.vrx,c2,-1); 
  ftmp1.vrx=amend(ftmp1.vrx,ftmp2.vrx,1);
}

tmpf=rotatevrx(ftmp1.vrx,c1,-amto+amfrom);
f1.vrx=[];
for (var i=0; i<tmpf.length-2;i++)
  f1.vrx.push(tmpf[i]);
tmpf=rotatevrx(f1.vrx,c1,180);
for (var i in tmpf)
  f1.vrx.push(tmpf[i]);
f2.vrx=[];
var tmpf=rotatevrx(f1.vrx,f1.center,180);
for(var i=0;i<tmpf.length;i++)
  f2.vrx.push([tmpf[i][0]+dist,tmpf[i][1]]); 
 
pair.push(f1);
pair.push(f2);
log("Fig1",f1);
/*log("Fig2",f2);*/
return pair;
}

function amend(v1,v2,ror){
	var res=[];
	for (var i=0;i<v1.length;i++){
		var pp=v1[i];
        var	pp1=[];
        var pp2=[];		
	    for (var j=1;j<v2.length-1;j++){
		   var p=intsect([0,v1[i][1]],v1[i],v2[j-1],v2[j]);
		   if (p[0]!=-1 && p[0]!=-1){
			  pp=p;	
			  if (v2[j-1][0]<pp[0]){
				  pp1.push(v2[j-1][0]);
				  pp1.push(v2[j-1][1]);
			  }
			  if (v2[j][0]<pp[0]){
				  pp2.push(v2[j][0]);
				  pp2.push(v2[j][1]);
			  }
			  break;
		   }
		}
		if(pp1.length>0){
			res.push(pp1);
//			i++;
		}else{
		   res.push(pp);
		}
		/*if(pp2.length>0){
			res.push(pp2);
//			i++;
		}*/
	}
	return res;	
}

function intsect(p1,p2,p3,p4){
	var point=[-1,-1];
	var dx1=(p2[0]-p1[0]);
	var dy1=(p2[1]-p1[1]);
	var dx2=(p4[0]-p3[0]);
	var dy2=(p4[1]-p3[1]);
	if(dx1 == 0 || dx2 == 0) return point;
	var a=dy1/dx1;
	var b=dy2/dx2;
	var c=p1[1]-p1[0]*a;
	var d=p3[1]-p3[0]*b;
	
	if(a-b ==0) return point;
	  
    point[0]=(d-c)/(a-b);
	point[1]=(a*d-b*c)/(a-b);

	if (  
	      (point[0]>p1[0] && point[0]>p2[0]) || (point[0]>p3[0] && point[0]>p4[0]) 
		||(point[0]<p1[0] && point[0]<p2[0]) || (point[0]<p3[0] && point[0]<p4[0])
		||(point[1]>p3[1] && point[1]>p4[1]) || (point[1]<p3[1] && point[1]<p4[1])
		)
		return [-1,-1];
	else
		return point;
}

function cleardraw(){
var canvas = document.getElementById("myCanvas");
ctx = canvas.getContext("2d");
ctx.strokeStyle = "#F00000";
ctx.fillastyle  = "#FFFFFF";
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.globalCompositeOperation = "xor";
}

function drawFigure(figure,fillStyle,strokeStyle){
ctx.fillStyle = fillStyle;
ctx.strokeStyle = strokeStyle;

ctx.lineWidth=1;
ctx.beginPath();
ctx.moveTo(figure.vrx[0][0],figure.vrx[0][1]);
for (var i=1;i<figure.vrx.length; i++){
ctx.lineTo(figure.vrx[i][0],figure.vrx[i][1]);
}
ctx.closePath();
var clp=document.getElementById("chbox3");
if(clp.checked)
ctx.fill();
ctx.stroke();
var elm=document.getElementById("chbox1");
 if(elm.checked){
	showPoints(figure);
 }
}

function log(a,b){
var cb=document.getElementById("chbox1");
if(cb.checked){
  document.getElementById(a).innerHTML+='<a>G21</a><br>';
  document.getElementById(a).innerHTML+='<a>G90</a><br>';
  document.getElementById(a).innerHTML+='<a>G0 X'+b.vrx[0][0]+' Y'+b.vrx[0][1]+"</a><br>";
  for (var i=1; i<b.vrx.length; i++)
    document.getElementById(a).innerHTML+='<a>G1 X'+b.vrx[i][0]+' Y'+b.vrx[i][1]+"</a><br>";
}
}

function clearLog(){
document.getElementById("Fig1").innerHTML="";
document.getElementById("Fig2").innerHTML="";
}

function showPoints(f){
	var ps=pstop-pstart;
	for (var i=0; i<f.vrx.length;i+=10){
			ctx.strokeText(''+i,f.vrx[i][0],f.vrx[i][1]);
	}		
}

function chnls(){
var ac=Math.acos(((c2.x-c1.x)/2)/radius);
ctx.lineWidth=4;
ctx.strokeStyle="black";
var p1=[];
p1[0]=c1.x+axrad*radius+dr;
p1[1]=c1.y+dr*2;
ctx.moveTo(p1[0],p1[1]); 
var p2=[];
p2[0]=c1.x+Math.cos(ac)*(radius-dr)+dr*5;
p2[1]=c1.y+Math.sin(ac)*(radius-dr)-dr*2;
ctx.lineTo(p1[0],p2[1]);
ctx.lineTo(p2[0],p2[1]);
ctx.stroke();
ctx.lineWidth=1;
ctx.stroke();
}

function drawFigures(a,b){
cleardraw();
var canvas = document.getElementById("myCanvas");
canvas.width=radius*(3+axrad);
canvas.height=radius*2+10;
//chnls();
var elm;
fig1={center:{x:c1.x,y:c1.y},rad:radius,rot:0,vrx:[]};
fig2={center:{x:c2.x,y:c2.y},rad:radius,rot:180,vrx:[]};
figs=[];
if( a || rotation==0){
  figures=[];
  clearLog();
  elm=document.getElementById("axrad");
  axrad=new Number(elm.value)/100;
  elm=document.getElementById("clip1");
  dr=new Number(elm.value)*radius/100;
  elm=document.getElementById("ang");
  elm.value=rotation%360;
  elm=document.getElementById("pstart");
  pstart=new Number(elm.value);
  elm=document.getElementById("pstop");
  pstop=new Number(elm.value);
  c2.y=c1.y;
  c2.x=c1.x+radius+axrad*radius;
  fig1={center:{x:c1.x,y:c1.y},rad:radius,rot:0,vrx:[]};
  fig2={center:{x:c2.x,y:c2.y},rad:radius,rot:180,vrx:[]};
  figs=fillPair(fig1,fig2);
  figures.push(figs[0]);
  figures.push(figs[1]);
}else{
	figs[0]=fig1;
	figs[1]=fig2;
	for(var i=0;i<figures[0].vrx.length;i++){ 
      figs[0].vrx.push(rotp(figures[0].vrx[i],figs[0].center,rotation));
      figs[1].vrx.push(rotp(figures[1].vrx[i],figs[1].center,180-rotation));
	}
}
if(b){
	var etc="I'm here";
}else{	
elm=document.getElementById("ang");
elm.value=rotation%360;
drawFigure(figs[0],"#0000F0","#0000F0");
drawFigure(figs[1],"#00F000","#00F000");
}
drawarc();
}

function rotate(){
rotation++;
if(rotation>360)
	rotatio=rotation-360;
drawFigures();
}

function magnify(n){
	magnifier*=n;
	var mag = document.getElementById("mag");
	mag.value=''+magnifier+':1';
	c1.x=c1.x*n;
	c1.y=c1.y*n;
	radius=radius*n;
	dr=dr*n;
	drawFigures(true,true);
	drawFigures();
}

function radia(grad){
	return grad*Math.PI/180;
}

function drawarc(){
var canvas = document.getElementById("myCanvas");
ctx = canvas.getContext("2d");
ctx.lineWidth=2;
ctx.beginPath();
var ac=Math.acos(((c2.x-c1.x)/2)/radius);
ctx.arc(c1.x,c1.y,radius-dr,ac, -ac);
ctx.arc(c2.x,c2.y,radius-dr,ac-Math.PI, Math.PI-ac);
ctx.strokeStyle="blue";
ctx.closePath();
ctx.stroke();
ctx.strokeStyle="black";
ctx.beginPath();
ctx.arc(c1.x,c1.y,axrad*radius-dr,0, radia(360));
ctx.closePath();
ctx.stroke();
ctx.beginPath();
ctx.arc(c2.x,c2.y,axrad*radius-dr,0, radia(360));
ctx.closePath();
ctx.stroke();
}

