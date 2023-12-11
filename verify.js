import admin from "./configuration.js";
	 const  decodeToken = async(req,res,next) =>{
		const token = req.headers.token;
		console.log
		try {
			const decodedToken = await admin.auth().verifyIdToken(token);
			req.userdetails = decodedToken;
			next();
		  } catch (error) {
			console.error("Error verifying ID token:", error);
			res.status(401).json("Invalid Access Token May be Expired");
		  }
	}

export default decodeToken;	