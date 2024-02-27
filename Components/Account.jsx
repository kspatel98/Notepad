/**
 * Author: Kartik Patel
 * File name: Account.jsx
 * Purpose: This component displays username and contains a logout button.
 */

import React from 'react'
import "../SASS/Account.css";
import { user,email,image } from './Login';
import { googleLogout } from "@react-oauth/google";
import { AccountDisplay } from './Pad';
import { useNavigate } from 'react-router';
function Account(props)
{
    const navigate=useNavigate();
    function Logout()
    {
        const logout=confirm("Do you really want to logout "+user.value+"?");
        if(logout)
        {
            googleLogout();
            user.value="Sign In";
            email.value='';
            image.value='';
            props.newFile();
            AccountDisplay.value="none";
            navigate('/');
        }
    }
    return(
        <div>
            <div style={{display:AccountDisplay.value}} className='accountCard'>
                <div>{email.value}</div>
                <div className='image'><img src={image.value} /></div>
                <div className='name'>{user.value}</div>
                <div onClick={()=>Logout()} className='logout'>Logout</div>
            </div>
        </div>
    )
}

export default Account;