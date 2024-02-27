import { useState } from "react";
import axios from "axios";
import "../SASS/Login.css";
import { googleLogout, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useSignal, signal, computed } from '@preact/signals-react';
import { MdAccountCircle } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { RxCross2 } from "react-icons/rx";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
export const user = signal("Sign In");
export const email = signal('');
export const image = signal('');
function Login() {
    const [data, setData] = useState({});
    const [eye, setEye] = useState(<FaEyeSlash />);
    const [passwordVisibility, setPasswordVisibility] = useState("password");
    const [alert, setAlert] = useState("");
    const [color, setColor] = useState("");
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();
    function SuccessHandle(response) {
        const token = response?.credential;
        const decoded = jwtDecode(token);
        console.log(decoded);
        setTimeout(function () {
            user.value = decoded.name;
            email.value = decoded.email;
            image.value = decoded.picture;
            navigate('/');
        }, 2000);
    }
    function ErrorHandle(error) {
        console.log(error);
    }
    async function LoginUser(data1) {
        await axios.post('https://notepadserver.onrender.com/login', data1)
            .then((response) => {
                console.log(response.data.message)
                setAlert(response.data.message);
                setColor(response.data.color);
                if (response.data.message == "Username " + data1.username + " has been logged in successfully.") {
                    setTimeout(function () {
                        user.value = data1.username;
                        navigate('/');
                    }, 2000);
                }
            })
    }
    function HandleEye() {
        if (passwordVisibility == "password") {
            setPasswordVisibility("text");
            setEye(<FaEye />);
        }
        else {
            setPasswordVisibility("password");
            setEye(<FaEyeSlash />);
        }
    }
    return (
        <div className="LoginPage">
            <Link to='/' className="cross"><RxCross2 /></Link>
            <div className="LoginCard">
                <form onSubmit={handleSubmit((data) => { setData(data); LoginUser(data) })} className="LoginForm">
                    <div className="Icon"><MdAccountCircle style={{ border: "4px solid white", borderRadius: "20px" }} /></div>
                    <div><input {...register("username", { required: true })} placeholder="Username" /></div>
                    <div><input {...register("password", { required: true })} type={passwordVisibility} placeholder="Password" /><div onClick={() => HandleEye()} style={{ fontSize: "20px" }}>{eye}</div></div>
                    <div style={{ color: color }}>{alert}</div>
                    <div><button type="submit">Login</button></div>
                    {"OR"}
                    <div><Link className="Link" to="/Signup"><button>Sign Up</button></Link></div>
                    <button className="google"><GoogleLogin
                        onSuccess={SuccessHandle} onError={ErrorHandle} size="small" shape="circle" type="icon" /></button>
                </form>
            </div>
        </div>
    )
}
export default Login;