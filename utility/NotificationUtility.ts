//OTP


export const GenerateOtp = () => {
    const otp = Math.floor(10000+ Math.random()*90000)
    let expiry = new Date();
    expiry.setTime(expiry.getTime() + 30*60*1000);

    return {otp, expiry}
 }


export const onRequestOTP = async (otp: number , toPhoneNumeber: string) => {
   
    const client = require('twilio')(accountSid, authToken);

    const response = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: '+18103682041',
        to: `+91${toPhoneNumeber}`,
    })

    return response;

}