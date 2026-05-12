const generateOTP = () =>{
    const otp = Math.floor(Math.random()*900000 + 100000);

    const otpExpiry = new Date(Date.now() + 10*60*1000); //10Min

    return {otp,otpExpiry};
}

export default generateOTP;