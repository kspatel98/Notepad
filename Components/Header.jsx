/**
 * Author: Kartik Patel
 * File name: Header.jsx
 * Purpose: Header of the application includes different functionalities of application separated by its category or type of functionality.
 */

import React, { useEffect } from 'react';
import { useState, useRef } from 'react';
import { RxHamburgerMenu } from "react-icons/rx";
import "../SASS/Header.css"; // Importing css file
import File from './File';  // Importing File component
function Header(props) {
    const [displayVisible, setDisplayVisible] = useState("none"); // Display style value of File component
    const bullets = props.bullets;
    const previousRef = useRef(0);
    useEffect(()=>{
        previousRef.current=0;
    },[]);
    console.log("render with ref 0");
    ///<summary>
    /// Toggle function to toggle display visibility of File component. 
    ///</summary>
    function Toggle() {
        if (displayVisible == "none") {
            setDisplayVisible("block");
        }
        else if (displayVisible == "block") {
            setDisplayVisible("none");
        }
    }
    function handleSearch(e) {
        let searchKeyword = e.target.value;
        let searchResult = [];
        props.reference.current[previousRef.current].style.background = 'none';
        bullets.map((item, index) => {
            let text = item.text;
            if (text.includes(searchKeyword)) {
                searchResult.push(index);
                console.log("index:" + index + " text:" + item.text);
            }
        })
        if (searchKeyword != "") {
            if (searchResult.length > 0) {
                var top = props.reference.current[searchResult[0]].getBoundingClientRect().top - 140;
                window.scrollTo({ behavior: 'smooth', top: top })
                props.reference.current[searchResult[0]].style.background = 'bisque';
                previousRef.current = searchResult[0];
            }
        }
        else {
            var top = props.reference.current[searchResult[0]].getBoundingClientRect().top - 140;
            window.scrollTo({ behavior: 'smooth', top: top })
        }
    }
    function Extendmenu()
    {
        const el=document.querySelector('.header');
        if(el.style.display=="none")
        {
            el.style.display="grid";
        }
        else
        {
            el.style.display="none";
        }
    }
    return (
        <div>
            <div className='menuoverlay' onClick={()=>Extendmenu()}><RxHamburgerMenu/></div>
            <div className='header'>
                <button onClick={Toggle}>File</button>
                <button >Home</button>
                <button onClick={() => { props.sidebarDisplay('shortcut') }}>Shortcuts</button>
                <button onClick={() => { props.sidebarDisplay('about') }}>About</button>
                <div className='search'>
                    <input type='text' onChange={(e) => { handleSearch(e) }} placeholder='&#x1F50D; Search' />
                </div>
            </div>
            <File currentFile={props.currentFile} keys={props.keys} popupToggle={props.popupToggle} toggle={Toggle} newFile={props.newFile} save={props.save} open={props.open} export={props.export} display={displayVisible} />
        </div>
    )
}
export default Header;
