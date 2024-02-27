/**
 * Author: Kartik Patel
 * File name: File.jsx
 * Purpose: File component of the application includes different functionalities of particular page or file.
 */
import React, { useEffect } from "react";
import { useState } from "react";
import { user } from "./Login";
import { CiFileOn } from "react-icons/ci";  //  Importing icons from react-icons library
import { IoSaveOutline } from "react-icons/io5";
import { FaRegFolderOpen } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { AiOutlineDelete } from "react-icons/ai";
import axios from "axios";
import "../SASS/File.css";  //  Importing css file for this component
function File(props) {
    const disp = props.display;
    console.log("File disp", disp)
    const [keyName1, setKeyName1] = useState([]);
    const [display, setDisplay] = useState("none");

    ///<summary>
    /// This useEffect hook will call UpdateKeys() function on first render of this component.
    ///</summary>
    useEffect(() => {
        UpdateKeys();
    }, []);

    ///<summary>
    /// This function toggle the display visibility of saved files.
    /// When user clicks on Open button, it displays saved files.
    /// When user clicks again, it collapse all the saved files. 
    ///</summary>
    const Display = () => {
        if (display == "none") {
            UpdateKeys();
            setDisplay("flex");
        }
        else {
            UpdateKeys();
            setDisplay("none");
        }
    }

    async function GetFiles() {
        await axios.post('https://notepadserver.onrender.com/getFiles')
            .then((response) => {
                console.log(response);
                let keys = [];
                response.data.map((item) => (
                    keys.push(item.key)
                ))
                setKeyName1(keys);
            })
    }

    ///<summary>
    /// UpdateKeys() function will get all the keys from localStorage and push it into array.
    ///</summary>
    const UpdateKeys = () => {
        if (user.value == "Sign In") {
            var keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                keys.push(localStorage.key(i));
            }
            setKeyName1(keys);
        }
        else {
            GetFiles();
        }
    }

    ///<summary>
    /// This function will delete the specific key from localStorage
    ///</summary>
    ///<param name="item">  Name of a key to delete from localStorage. </param>
    async function DeleteFile(item) {
        if (props.currentFile == item) {
            alert("Can not be deleted because the file is open! Close the file first to delete.");
        }
        else {
            const deleteConfirmation = confirm("Do you really want to delete " + item + "?");
            if (deleteConfirmation) {
                if(user.value=="Sign In")
                {
                    localStorage.removeItem(item);
                    UpdateKeys();
                }
               else
               {
                console.log("Going for delete")
                    await axios.post('https://notepadserver.onrender.com/delete',{filename:item,user:user.value})
                    .then((response)=>{
                        if(response.data.message=="File has been deleted successfully")
                        {
                            UpdateKeys();
                        }
                    })
               }
            }
        }
    }
    return (
        <div className="file" style={{ display: disp }}>
            <div className="parent" onClick={() => {
                props.newFile();
                props.toggle();
            }}>
                <CiFileOn /> New File
            </div>
            <div className="parent" onClick={() => { props.popupToggle(); props.toggle(); }}>
                <IoSaveOutline /> Save
            </div>
            <div className="parent" onClick={Display}><FaRegFolderOpen /> Open</div>

            {keyName1.map((item, i) => (
                <div className="openchild" style={{ display: display }}><div key={i} onClick={() => { props.open(item); props.toggle(); Display(); }}>{item}</div><div className="delete" onClick={() => { DeleteFile(item); }}><AiOutlineDelete /></div></div>
            ))}
            <div className="parent">
                <div onClick={props.export} ><IoMdDownload /> Download as .doc</div>
            </div>
        </div>)
}

export default File;