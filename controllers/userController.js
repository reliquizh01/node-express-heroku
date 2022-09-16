const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATEBASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const hasEmptyFields = (body, error_list) =>{

    for(let field in body)
    {
        if(!body[field]){
            error_list[field] = `${field} is required`;
        }
    }
    
    if(Object.keys(error_list).length > 0 )
    {
        return true;
    }
    return false;
}

exports.login = (req, res) =>{
    const {email, password} = req.body;

    db.query(
        `SELECT * FROM users WHERE email = ?`,
        email,
        async(err, result) =>{
            console.log("UserController Results: " + result);
            
            if(!result.length || !(await bcrypt.compare(password, result[0].password))){
                console.log("Attempting to Login:" + result);
                return res.status(401).json({message: "Email or password is incorrect"});   
            }
            return res.status(200).json(result[0]);

        }
    )
}



exports.register = async(req, res) => {
    const {first_name, last_name, email, password, confirm_password} = req.body;

    let error_list = {};
    //error_list.first_name = first_name ? "" : "First name is required";

    if(hasEmptyFields(req.body, error_list)){
        return res.status(400).json(error_list);
    }

    if(password !== confirm_password)
    {
        error_list.confirm_password = "Password does not match";
        return res.status(400).json(error_list);
    }

    const hashpassword = await(bcrypt.hash(password, 10));

    db.query(
        `INSERT INTO users SET ?`,
        {
            first_name : first_name,
            last_name : last_name,
            email : email,
            password : hashpassword
        },
        (err) =>{
            if(err){
                return console.log(err.message);
            }
            console.log('Registration Successful');
            res.send('success');
        }
    );
};

exports.fetch = (req, res) =>{
    db.query(
        'SELECT * FROM users',
        (err, result) =>{
            if(err){
                return console.log(err.message);
            }
            return res.status(200).json(result);
        }
    )
}

exports.updateUser = (req, res) =>{
    db.query(
        `UPDATE users
         SET first_name = ?, last_name = ?, email = ?
         WHERE user_id = ?`,
         [req.body.first_name, req.body.last_name, req.body.email, req.body.user_id],
         async(err, result) =>{
            if(err)
            {
                return console.log(err.message);
            }
            console.log('Update Successful');
            return res.status(200).json(result);
         }
    )
}

exports.getUser = (req, res) =>{
    const id = req.params.id
    db.query(
        `SELECT * FROM users
        WHERE user_id = ?`, id,
        (err, result) =>{
            if(err){
                return console.log(err.message);
            }
            return res.status(200).json(result);
        }
    )
}

exports.deleteUser = (req, res) =>{
    const id = req.params.id
    db.query(
        `DELETE FROM users WHERE user_id = ?`, id,
        (err, result) =>{
            if(err){
                return console.log(err.message);
            }
            return res.status(200).json({message: "Deleted Successfully"});
        }
    )
    
}