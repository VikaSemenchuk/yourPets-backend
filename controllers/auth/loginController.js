const bcrypt = require('bcryptjs');
const signToken = require('../../helpers/signToken');
const User = require('../../models/users/users');
// const {  loginValiadation } = require('../../valiadators/joiValiadator');


const login = async (req, res) => {
    
    try {
        // const { error, value } = loginValiadation(req.body);
        // if (error) {
        //     const fieldName = error.details[0].path[0];
        //     return res.status(400).json({
        //         message: `missing required ${fieldName} field`
        //     })
        // }
        const { email, password } = req.body;
        // console.log('password :>> ', password);
        const userI = await User.findOne({ email });
        // console.log('userI :>> ', userI);
        if (!userI) {
            return res.status(401).json({
                message: "Email or password is wrong"
            });
        }
        const passwordIsValid = await bcrypt.compare(password, userI.password);
        // console.log('passwordIsValid :>> ', passwordIsValid);
        
        if (!passwordIsValid) {
            return res.status(401).json({
                message: "Email or password is wrong"
            });
        }
        const payload = {
            id: userI._id
        }
        
        // console.log('payload :>> ', payload);

        const token = await signToken(payload);
// console.log('token :>> ', token);

     await User.findByIdAndUpdate(userI._id, { token });
// console.log('await :>> ', await User.findByIdAndUpdate(userI._id, { token }));

        return res.status(200).json({ token: token, user: { email: userI.email, subscription: userI.subscription } });
    } catch (err) {
        console.log('err :>> ', err);
        return res.status(500).json({ message: 'Ooops... Something wrong in DB'});
    }
}

module.exports = {
    login
}