import { complex, add, multiply} from 'mathjs'

 const l = 2**(-1/4)
  const octVertices= Array.from({length: 8}, (_, i) =>
    complex({abs: l, arg:  i * 2 * Math.PI / 8}))
  

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
    const [b1, ]=findEndpoints(p1,p2)
    const [d1, ]=findEndpoints(q1,q2)
    return genMob(p1,b1,p2, q1,d1,q2,z)
}

export const getTranslates=(coords)=>{
    // given a pair of coordinates, gives the coordinates for the mapped version in the neighboring octagons
    // note that this maps v1 to q2 and v2 to q1. whatever.
      const indices=[0,1,4,5]
      const newCoords=[]
      for (const coord of coords){
        const [p1,p2]=coord

        for (let k=0; k<4;k++) {
          
          let i=indices[k]
          
          const v1=octVertices[i]
          const v2=octVertices[(i+1)%8]
          const q1=octVertices[(i+2)%8]
          const q2=octVertices[(i+3)%8]
          
          newCoords.push([geodToGeod(v1,v2,q2,q1,p1),geodToGeod(v1,v2,q2,q1,p2)])
          newCoords.push([geodToGeod(q2,q1,v1,v2,p1),geodToGeod(q2,q1,v1,v2,p2)])

        }
      }
      return newCoords
  }

export const moveInside=(p1,p2)=>{
    // find the octant and applies the appropaite map
    // NOTE im using a backwards standard from the function above. it makes more sense in that context.
    // also i loooove conflicting standards
    const [e1,]=findEndpoints(p1,p2)
    const theta=e1.arg()

    let vset=[0,0,0,0]
    if (theta>=0 && theta<Math.PI/4){ 
        vset=[0,1,3,2]
    }
    if (theta>=Math.PI/4 && theta<Math.PI/2){
        vset=[1,2,4,3]
    }
    if (theta>=Math.PI/2 && theta<3*Math.PI/4){
        vset=[2,3,1,0]
    }
    if (theta>3*Math.PI/4){
        vset=[3,4,2,1]
    }
    if (theta<-3*Math.PI/4){
        vset=[4,5,7,6]
    }
    if (theta<-Math.PI/2 && theta>=-3*Math.PI/4){
        vset=[5,6,0,7]
    }
    if (theta<-Math.PI/4 && theta>=-Math.PI/2){
        vset=[6,7,5,4]
    }
    if (theta<0 && theta>=-Math.PI/4){
        vset=[0,7,5,6]
    }

    const u1=octVertices[vset[0]]
    const u2=octVertices[vset[1]]
    const v1=octVertices[vset[2]]
    const v2=octVertices[vset[3]]
    return [geodToGeod(u1,u2,v1,v2,p1),geodToGeod(u1,u2,v1,v2,p2)]
}

export const extendPath=(p1,p2, steps)=>{
    let coords=[]
    console.log("start extend")

    for (let k=0;k<steps;k++){
        console.log("extending")
        let [q1,q2]=moveInside(p1,p2)
        coords.push([q1,q2])
        p1=q1
        p2=q2
    }
    return coords
}
