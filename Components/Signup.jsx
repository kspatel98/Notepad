import { useState } from "react";
import "../SASS/Signup.css";
import { MdAccountCircle } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import {useForm} from "react-hook-form";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";
function Signup()
{
    const [data,setData]=useState({});
    const [eye,setEye]=useState(<FaEyeSlash/>);
    const [passwordVisibility,setPasswordVisibility]=useState("password");
    const [alert, setAlert]=useState("");
    const [color,setColor]=useState("");
    const {register, handleSubmit}=useForm();
    const navigate=useNavigate();
    async function SignupUser(data1){
        await axios.post('https://notepadserver.onrender.com/signup',data1)
        .then((response)=>{
            setAlert(response.data.message);
            setColor(response.data.color);
            if(response.data.message=="User has been registered successfully.")
            {
                setTimeout(function(){
                    navigate('/Login');
                },2000);
            }
        })
    }
    function HandleEye()
    {
        if(passwordVisibility=="password")
        {
            setPasswordVisibility("text");
            setEye(<FaEye/>);
        }
        else
        {
            setPasswordVisibility("password");
            setEye(<FaEyeSlash/>);
        }
    }
    return(
        <div className="SignupPage">
            <Link to='/' className="cross"><RxCross2/></Link>
            <div className="SignupCard"> 
                <form onSubmit={handleSubmit((data)=>{setData(data); SignupUser(data);})} className="SignupForm">
                    <div className="Icon"><MdAccountCircle style={{border:"4px solid white",borderRadius:"20px"}}/></div>
                    <div><input {...register("username",{required:true})} placeholder="Username" /></div>
                    <div><input {...register("password",{required:true})} type={passwordVisibility} placeholder="Password" /></div>
                    <div><input {...register("cpassword",{required:true})} type={passwordVisibility} placeholder="Confirm Password" /><div onClick={()=>HandleEye()} style={{fontSize:"20px"}}>{eye}</div></div>
                    <div style={{color:color}}>{alert}</div>
                    <div><button type="submit">Signup</button></div>
                    {"OR"}
                    <div><Link className="Link" to="/Login"><button>Login</button></Link></div>
                </form>
            </div>
        </div>
    )
}
export default Signup