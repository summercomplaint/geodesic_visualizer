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

 const phiZ2=phiA(z2,z1)


 const normedPhiZ2=multiply(phiZ2,complex(1/phiZ2.abs(),0))
 console.log("normedPhiZ2",normedPhiZ2)

 const e1=phiA(normedPhiZ2,z1.neg())


 const e2=phiA(normedPhiZ2.neg(),z1.neg())

 return [e1,e2]
}


const x = complex(0.5,0.75)
const y = complex(0.1,0.9)

console.log("findEndpoints",findEndpoints(x,y))