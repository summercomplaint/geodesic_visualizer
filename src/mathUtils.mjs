import { complex, add, multiply} from 'mathjs'


export const phiA = (z,a) => {
    // defines phi_a(z)=(z-a)/(1-z\bar{a})
    // sends a to 0 and fixes the disk. pretty cool
    const oneMinusZabar=add(1,multiply(z.neg(),a.conjugate()))
    const phiAz = multiply(add(z,a.neg()),oneMinusZabar.inverse())
    return phiAz
}

export const findEndpoints = (z1,z2) => {
 // given two points in the disk, computes the endpoints of the geodesic between them
 // maps one of them to the center, 
 // computes the endpoints of the line from the center to the other, then maps them back
 // pretty cool trick huh

 const phiZ2=phiA(z2,z1)


 const normedPhiZ2=multiply(phiZ2,complex(1/phiZ2.abs(),0))
 

 const e2=phiA(normedPhiZ2,z1.neg())


 const e1=phiA(normedPhiZ2.neg(),z1.neg())

 //e1 will always be on the side z1

 return [e1,e2]
}


export const findCircle =(z1,z2) => {
 // takes two points on the boundary of the disk and draws the geodesic between them
 // will not work if theyre not on the boundary

 const sum = multiply(add(z1,z2),complex(1/2,0))
 const diff=multiply(add(z1,z2.neg()),complex(1/2,0))
 const ratio =diff.abs()/sum.abs()

 const circCenter=multiply(sum,complex(1+ratio*ratio,0))

 const radius = add(circCenter,z1.neg()).abs()

 const theta1=add(z1,circCenter.neg()).arg()
 const theta2=add(z2,circCenter.neg()).arg()


 let clockwiseAngle = theta1 - theta2;
 if (clockwiseAngle < 0) clockwiseAngle += 2 * Math.PI;
    
    // Midpoint angle (clockwise from v1)
const midAngle = theta1 - clockwiseAngle / 2;
const midpt= add(circCenter,complex({abs:radius,arg:midAngle}))



if (midpt.abs()<1) {
    const phi1=theta2
    const phi2=theta1
    return {circCenter,radius,phi1,phi2}
}
else {
    const phi1=theta1
    const phi2=theta2
    return {circCenter,radius,phi1,phi2}
}
}

export const partialCircle =(p1,p2) => {
 // takes two points draws the geodesic between them
 const [z1,z2]=findEndpoints(p1,p2)
 

 const sum = multiply(add(z1,z2),complex(1/2,0))
 const diff=multiply(add(z1,z2.neg()),complex(1/2,0))
 const ratio =diff.abs()/sum.abs()

 const circCenter=multiply(sum,complex(1+ratio*ratio,0))

 const radius = add(circCenter,z1.neg()).abs()

 const theta1=add(p1,circCenter.neg()).arg()
 const theta2=add(p2,circCenter.neg()).arg()


 let clockwiseAngle = theta1 - theta2;
 if (clockwiseAngle < 0) clockwiseAngle += 2 * Math.PI;
    
    // Midpoint angle (clockwise from v1)
const midAngle = theta1 - clockwiseAngle / 2;
const midpt= add(circCenter,complex({abs:radius,arg:midAngle}))



if (midpt.abs()<1) {
    const phi1=theta2
    const phi2=theta1
    return {circCenter,radius,phi1,phi2}
}
else {
    const phi1=theta1
    const phi2=theta2
    return {circCenter,radius,phi1,phi2}
}

}


export const slideMap = (f1,f2,m3,m4,z) => {
//fixes f1 and f2, moves m3 to m4
// wont fix the disk unless m3 and m4 are on the geodesic between f1 and f2. so be careful!

const b = multiply(f1,f2).neg() // z1*z2
const d = multiply(add(multiply(add(f2,m4.neg()),m3),multiply(add(m3,f2.neg()),f1)),add(m4,m3.neg()).inverse())
const a = add(d,add(f1,f2))
const fz = multiply(add(multiply(a,z),b),add(z,d).inverse())
return fz

}


export const genMob=(x1,x2,x3,y1,y2,y3, z)=>{
//sends x1,x2,x3, to y1,y2,y3 respectively
//maps to 0,infinity,1 respectively first, and then back, so wont work at exactly x2. whatever

const a=multiply(add(x3,x2.neg()),add(x3,x1.neg()).inverse())
const d=x2.neg()
const b=multiply(a.neg(),x1)
const phiZ=multiply(add(multiply(a,z),b),add(z,d).inverse())

const r=multiply(add(y2,y3.neg()),add(y3,y1.neg()).inverse())
const p=y2
const q=multiply(r,y1)

const psiPhiZ=multiply(add(multiply(p,phiZ),q),add(phiZ,r).inverse())

return psiPhiZ
}

export const geodToGeod=(p1,p2,q1,q2,z)=>{
    //sends the geodesic through p1,p2 to the geodesic through q1,q2
    const [b1,b2]=findEndpoints(p1,p2)
    const [d1,d2]=findEndpoints(q1,q2)
    return genMob(p1,b1,p2, q1,d1,q2,z)
}

 const x=complex(0.5,0.5)
const y=complex(0.2,-0.3)
const u=complex(-0.1,0.8)
const v=complex(-0.5,0.2)

console.log(geodToGeod(x,y,u,v,complex(0.2001,-0.3)))