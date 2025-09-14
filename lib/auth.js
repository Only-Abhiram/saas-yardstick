import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ; // use env in production

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
}

export function verifyToken(token) {
  
  try {
    console.log("verifying token")
    console.log(token)
    console.log(SECRET)
    return jwt.verify(token, SECRET)
    
  } catch(e) {
    console.log(e);
    return null;
  }
}