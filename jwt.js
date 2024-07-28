const jwt= require('jsonwebtoken');

function  jwtAuthMiddleware(req,res,next){
    //check for presence of token

    const authorization=req.headers.authorization;
    if(!authorization)res.status(401).json({error:'Token not found'});

    //considering as bearer token
    const token= req.headers.authorization.split(' ')[1];
    if(!token) res.status(401).json({error:'Unauthorized'})

    try{
        //verify token

        const decoded=jwt.verify(token, process.env.JWT_SECRET);

        //Attach user info to the request object
        req.user=decoded;
        next();
    }
    catch(e){
        console.error(e);
        res.status(401).json({error:'Invalid token'});
    }

}


//function to generate JWT token
function generateToken(userData){

    return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn:30000});
}

module.exports={jwtAuthMiddleware,generateToken};