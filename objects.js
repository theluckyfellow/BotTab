class something
{
   constructor(what, x1, y1, x2, y2, cf)
   {
     this.what = what;
     this.x1 = x1;
     this.y1 = y1;
     this.x2 = x2;
     this.y2 = y2;
     this.cf = cf;
     this.dist = 0;
     this.sustain = 0.1
     this.calcDist();
   }
   
   getDist()
   {
     return this.dist;
     
   }
   
   getWhat()
   {
     return this.what;
   }
   
   getX()
   {
     return this.x1;
   }
   
   getY()
   {
     return this.y1;
   }
   
   getCF()
   {
     return this.cf;
   }
   
   calcDist()
   {
     return pow(abs(this.x2-this.x1),-1.154)*29;
   }
   
   next(x1, y1, x2, y2, cf)
   {
     this.x1 = this.x1*0.7+x1*0.3;
     this.y1 = this.y1*0.7+y1*0.3;
     this.x2 = this.x2*0.7+x2*0.3;
     this.y2 = this.y2*0.7+y2*0.3;
     this.cf = this.cf*0.7+cf*0.3;
     this.sustain = this.sustain*0.7+0.3; 
   }
   drain()
   {
     this.sustain = this.sustain*0.9; 
   }
   
  
}
