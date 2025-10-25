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
 

 const e1=phiA(normedPhiZ2,z1.neg())


 const e2=phiA(normedPhiZ2.neg(),z1.neg())

 return [e1,e2]
}

export const makepos = (theta) => {

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
    console.log("midpt outside")
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

export const deckMap = (f1,f2,m3,m4,z) => {
//fixes f1 and f2, moves m3 to m4
// wont fix the disk unless m3 and m4 are on the geodesic between f1 and f2. so be careful!

const b = multiply(f1,f2).neg() // z1*z2
console.log("b",b)

const d = multiply(add(multiply(add(f2,m4.neg()),m3),multiply(add(m3,f2.neg()),f1)),add(m4,m3.neg()).inverse())
console.log("d",d)
const a = add(d,add(f1,f2))
console.log("a",a)

const fz = multiply(add(multiply(a,z),b),add(z,d).inverse())
return fz

}


console.log(complex(0,-1).arg())