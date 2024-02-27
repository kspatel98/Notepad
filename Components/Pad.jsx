/**
 * Author: Kartik Patel
 * File name: Pad.jsx
 * Purpose: Pad is the main component which presents the main notepad page with other components imported within it. 
 */
import { useEffect, useRef, useState } from "react";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { user } from './Login'; //imported preact signal named user from Login component which shows current user's name 
import { RxCross2 } from "react-icons/rx";
import { VscAccount } from "react-icons/vsc";
import "../SASS/Pad.css";
import { useForm } from "react-hook-form";
import { parse, stringify, toJSON, fromJSON } from 'flatted';   //importing npm package called flatted which is used to serialize and deserialize circular data
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import Account from "./Account";
import Shortcuts from "./Shortcuts";
import About from "./About";
import { signal } from "@preact/signals-react"; //importing signal from @preact/signals-react
import axios from "axios";
export const AccountDisplay = signal("none");   //creating and exporting a signal named AccountDisplay
function Pad() {
    const [keyName, setKeyName] = useState([]);
    const [currentFile, setCurrentFile] = useState("Untitled")  //Name of current opened file
    const [popupDisplay, setPopupDisplay] = useState("none");   //Display visibility value for savefile box
    const [TextOfSource, setTextOfSource] = useState("");   //Text of source bullet point while rearranging the data with Drag and Drop
    const [sidebarDisplay, setSidebarDisplay] = useState("pad");    //To toggle between components(Abount,Pad and Shortcut) on user actions
    const [source, setSource] = useState(0);    //Index of source bullet point while rearranging the data with Drag and Drop
    const [destination, setDestination] = useState(0);  //Index of destination bullet point while rearranging the data with Drag and Drop
    const navigate = useNavigate(); //Declare a function using useNavigate() function of react-router-dom to navigate between router links 
    const inputref = useRef([]);    //Created array of references for bullet points to access particular bullet point on user actions 
    const contentRef = useRef(null);    //Created reference for content of bullet points for the purpose of exporting to doc
    const [currentindex, setCurrentindex] = useState(0);    //Current index of a bullet point where the cursor is on. Used to handle enter, indent, backspace, etc. on user actions
    const { register, handleSubmit } = useForm();   //Getting parameters from custom hook called useForm() to manage the whole form
    const [bullets, setBullets] = useState([{ category: 1, indent: 0, parent: "none", index: "1", text: "", breadcrumbText: "", isExpanded: true, icon: "▽", display: "flex" }]);
    inputref.current = [];  //Assigning an empty array to reference of bullet points

    ///<summary>
    /// This function will be triggered on onDragStart to store the index and text of source bullet point
    ///</summary>
    ///<param name="e">  Event </param>
    const start = (e) => {
        setSource(e.target.id);
        console.log("source", source);
        setTextOfSource(e.target.childNodes[1].value);
    }

    ///<summary>
    /// This function will be triggered on onDragEnter to store the index of destination bullet point and set the currentIndex with source bullet index
    ///</summary>
    ///<param name="e">  Event </param>
    const enter = (e) => {
        console.log("enter", e)
        setDestination(e.target.id);
        console.log("dest", destination)
        setCurrentindex(source)
    }

    ///<summary>
    /// This function will be triggered on onDragOver to prevent its default behaviour and make it allow drop here.
    ///</summary>
    ///<param name="e">  Event </param>
    const allowDrop = (e) => {
        e.preventDefault();
    }

    ///<summary>
    /// This function will be triggered on onDrop.
    /// This will delete the source bullet point by using currentIndex which we already set onDragEnter with index of source bullet point.
    /// Lastly, it set the currentIndex to the index of destination bullet point.
    ///</summary>
    const end = () => {
        if (bullets.length > 1) {
            if (bullets[currentindex].indent == 0) {
                HandleBackspace();
            }
            else {
                console.log("indent>0 backspace");
                const list = [...bullets];
                let childrenBelowIndexArray = [];
                let sameBelowIndexArray = [];
                const below = list.filter((i) => (i.parent == list[currentindex].parent && list.findIndex((index) => (index.index == i.index)) > currentindex));
                const children = list.filter((i) => (i.indent > list[currentindex].indent && i.parent == list[currentindex].index));
                children.map((item) => (childrenBelowIndexArray.push(list.findIndex((i) => (i.index == item.index)))));
                below.map((item) => (sameBelowIndexArray.push(list.findIndex((i) => (i.index == item.index)))));
                childrenBelowIndexArray.map((child, i) => {
                    const childrenOfChild = list.filter((i) => (i.indent > list[child].indent && i.index.toString().startsWith(list[child].index)));
                    let childrenOfChildIndexArray = [];
                    childrenOfChild.map((index) => (childrenOfChildIndexArray.push(list.findIndex((i) => (i.index == index.index)))));
                    list[child].indent--;
                    list[child].parent = list[currentindex].parent;
                    list[child].category = i + list[currentindex].category;
                    list[child].index = list[child].parent + "." + list[child].category;
                    childrenOfChildIndexArray.map((item) => {
                        list[item].indent--;
                        const indentDifference = list[item].indent - list[child].indent;
                        list[item].index = list[item].index.replace(list[item].index.slice(0, list[child].index.length), list[child].index);
                        list[item].index = list[item].index.replace(list[item].index.slice(-1 - (indentDifference * 2), 1 - (indentDifference * 2)), "");
                        list[item].parent = list[item].index.slice(0, -2);
                    })
                })
                if (below.length > 0) {
                    sameBelowIndexArray.map((i, count) => {
                        let belowchildrenBelowIndexArray = [];
                        let childrenOfBelow = list.filter((temp) => (temp.indent > list[i].indent && (temp.parent).toString().startsWith(list[i].index) && list.findIndex((ind) => ind.index == temp.index) > i));
                        childrenOfBelow.map((itemval) => {
                            belowchildrenBelowIndexArray.push(list.findIndex((i) => i.index == itemval.index));
                        });
                        if (childrenBelowIndexArray.length > 0) {
                            list[i].category = list[childrenBelowIndexArray.length - 1].category + count + 1;
                        }
                        else {
                            list[i].category = list[currentindex].category + count;
                        }
                        list[i].index = list[i].parent + "." + list[i].category;
                        belowchildrenBelowIndexArray.map((item) => {
                            list[item].parent = list[i].index;
                            list[item].index = list[item].parent + "." + list[item].category;
                        });
                    });
                }
                list.splice(currentindex, 1);
                setBullets(list);

            }
            console.log("destination increment done")
            if (destination > source) {
                setCurrentindex(destination - 1);
            }
            else {
                setCurrentindex(destination);
            }
        }

    }

    ///<summary>
    /// This function will be triggered on onDragEnd.
    /// It will insert new bullet point by calling HandleEnter() method with argument of text of source bullet point. 
    ///</summary>
    const drop = () => {
        if (bullets.length > 0) {
            console.log("destupdated", currentindex)
            HandleEnter(TextOfSource);
        }
    }
    useEffect(() => {
        inputref.current[currentindex].focus();
    }, [currentindex]);

    useEffect(() => {
        console.log("useeffect-pad")
        if (user.value == "Sign In") {
            var keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                keys.push(localStorage.key(i));
            }
            setKeyName(keys);
        }
        else {
            GetFiles();
        }
    }, [])
    async function PopupToggle() {
        if (popupDisplay == "none") {
            if (currentFile == "Untitled") {
                setPopupDisplay("block");
            }
            else {
                if (user.value == "Sign In") {
                    localStorage.setItem(currentFile, stringify(bullets));
                }
                else {
                    console.log("Going for update file...");
                    await axios.post("https://notepadserver.onrender.com/update", { filename: currentFile, content: stringify(bullets), user: user.value })
                        .then((response) => {
                            if (response.data.message == "File has been saved successfully") {
                                console.log("update success..");
                                GetFiles();
                                setCurrentFile(currentFile);
                            }
                        })
                }
            }
        }
        else if (popupDisplay == "block") {
            setPopupDisplay("none");
        }
    }
    function SidebarDisplay(sidebarComponent) {
        if (sidebarDisplay == sidebarComponent) {
            setSidebarDisplay('pad');
        }
        else {
            setSidebarDisplay(sidebarComponent);
        }
    }
    function LoginAccount() {
        if (user.value == "Sign In") {
            navigate('/Login');
        }
        else if (AccountDisplay.value == "none") {
            AccountDisplay.value = "block";
        }
        else if (AccountDisplay.value == "block") {
            AccountDisplay.value = "none";
        }

    }
    function NewFile() {
        inputref.current = [];
        setCurrentFile("Untitled");
        setCurrentindex(0);
        setBullets([{ category: 1, indent: 0, parent: "none", index: "1", text: "", breadcrumbText: "", isExpanded: true, icon: "▽", display: "flex" }]);
    }
    async function GetFiles() {
        await axios.post("https://notepadserver.onrender.com/getFiles")
            .then((response) => {
                console.log(response);
                let keys = [];
                response.data.map((item) => (
                    keys.push(item.key)
                ))
                setKeyName(keys);
            })
    }
    async function Save(filename) {
        if (user.value == "Sign In") {
            localStorage.setItem(filename, stringify(bullets));
            var keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                keys.push(localStorage.key(i));
            }
            setCurrentFile(filename);
            setKeyName(keys);
        }
        else {

            console.log("Going for create file...");
            await axios.post("https://notepadserver.onrender.com/save", { filename: filename, content: stringify(bullets), user: user.value })
                .then((response) => {
                    if (response.data.message == "New file created successful") {
                        GetFiles();
                        setCurrentFile(filename);
                    }
                })
        }
        PopupToggle();

    }
    async function Open(filename) {
        if (user.value == "Sign In") {
            inputref.current = [];
            const result = localStorage.getItem(filename);
            const final = parse(result);
            setCurrentFile(filename);
            setCurrentindex(0);
            setBullets(final);
        }
        else {
            inputref.current = [];
            await axios.post('https://notepadserver.onrender.com/open', { filename: filename, user: user.value })
                .then((response) => {
                    inputref.current = [];
                    const result = response.data[0].value;
                    const final = parse(result);
                    setCurrentFile(filename);
                    setCurrentindex(0);
                    setBullets(final);
                });
        }
    }
    function Export2Word() {
        var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
        var postHtml = "</body></html>";

        if (contentRef.current != null) {
            var html = preHtml + contentRef.current.innerHTML + postHtml;
        }
        var blob = new Blob(['\ufeff', html], {
            type: 'application/msword'
        });

        // Specify link url
        var url = window.URL.createObjectURL(blob);
        //var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

        // Specify file name
        var filename = 'document.doc';

        // Create download link element
        var downloadLink = document.createElement("a");

        document.body.appendChild(downloadLink);
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            // Create a link to the file
            downloadLink.href = url;

            // Setting the file name
            downloadLink.download = filename;

            //triggering the function
            downloadLink.click();
        }
        document.body.removeChild(downloadLink);
    }
    const handleTextboxvalue = (e) => {
        const list = [...bullets];
        list[currentindex].text = e.target.value;
        list[currentindex].breadcrumbText = e.target.value;
        setBullets(list);
    }
    const handleExpand = (p,originalPIndex) => {
        const list = [...bullets];
        //const originalPIndex = list.findIndex((temp) => temp.index == p.index);
        if (p.isExpanded) {
            const data = list.filter((e) => { return (e.indent > p.indent && e.index.startsWith(p.index)) });
            data.map((Item) => {
                const originalIndex = list.findIndex((e) => e.index == Item.index);
                list[originalIndex].display = "none";
            })
            list[originalPIndex].breadcrumbText = list[originalPIndex].text.slice(0, 25);
            list[originalPIndex].isExpanded = false;
            list[originalPIndex].icon = "▶";
            setBullets(list);
        }
        else {
            const data = list.filter((e) => { return e.parent == p.index });
            list[originalPIndex].breadcrumbText = list[originalPIndex].text;
            list[originalPIndex].icon = "▽";
            list[originalPIndex].isExpanded = true;
            data.map((Item) => {
                const originalIndex = list.findIndex((e) => e.index == Item.index);
                list[originalIndex].display = "flex";
                const parentWithChildren = list.filter((temp) => { return (temp.indent == (Item.indent + 1) && temp.parent == Item.index) });
                if (parentWithChildren.length > 0) {
                    list[originalIndex].icon = "▶";
                    list[originalIndex].breadcrumbText = list[originalIndex].text.slice(0, 25);
                }
                else {
                    list[originalIndex].breadcrumbText = list[originalIndex].text;
                }
            })
            setBullets(list);
        }
    }
    const HandleEnter = (textData) => {
        let sameBelowIndexArray = [];
        let sameBelowNoneIndex = 0;
        let childrenBelowIndexArray;
        const list = [...bullets];
        const below = list.filter((item) => { return(item.parent == list[currentindex].parent && (list.findIndex((i) => i.index == item.index) > currentindex))});
        if (below.length == 0) {
            const temp = list.filter((item) => (item.parent.toString().startsWith(list[currentindex].index) && item.indent > list[currentindex].indent));
            if (temp.length > 0) {
                sameBelowNoneIndex = list.findIndex((item) => item.index == temp[temp.length - 1].index) + 1;
            }
        }
        else {
            below.map((itemval) => {
                sameBelowIndexArray.push(list.findIndex((i) => i.index == itemval.index));
            })
        }
        if (list[currentindex].parent == "none") {

            //list.push({ category:list[currentindex].category+1, indent:list[currentindex].indent, parent:list[currentindex].parent, index:String(list[currentindex].category+1),text:"" });

            sameBelowIndexArray.map((i) => {
                childrenBelowIndexArray = [];
                let childrenOfBelow = list.filter((temp) => (temp.indent > list[i].indent && (temp.parent).toString().startsWith(list[i].index) && list.findIndex((ind) => ind.index == temp.index) > i));
                childrenOfBelow.map((itemval) => {
                    childrenBelowIndexArray.push(list.findIndex((i) => i.index == itemval.index));
                });
                list[i].category = list[i].category + 1;
                list[i].index = String(list[i].category);
                childrenBelowIndexArray.map((item) => {
                    list[item].parent = (parseInt((list[item].index)[0]) + 1) + list[item].index.slice(1, -2);
                    list[item].index = list[item].parent + "." + list[item].category;
                });
            });
            list.splice(sameBelowIndexArray[0] || sameBelowNoneIndex || currentindex + 1, 0, { category: list[currentindex].category + 1, indent: list[currentindex].indent, parent: list[currentindex].parent, index: String(list[currentindex].category + 1), text: textData, breadcrumbText: textData, isExpanded: true, icon: "▽", display: "flex" });
        }
        else {
            sameBelowIndexArray.map((i) => {
                childrenBelowIndexArray = [];
                let childrenOfBelow = list.filter((temp) => (temp.indent > list[i].indent && (temp.parent).toString().startsWith(list[i].index) && list.findIndex((ind) => ind.index == temp.index) > i));
                childrenOfBelow.map((itemval) => {
                    childrenBelowIndexArray.push(list.findIndex((i) => i.index == itemval.index));
                });
                list[i].category = list[i].category + 1;
                list[i].index = list[i].parent + "." + String(list[i].category);
                childrenBelowIndexArray.map((item) => {
                    //list[item].parent=list[i].index;
                    list[item].index = list[i].index + (list[item].index).slice(list[i].index.length);
                    list[item].parent = list[item].index.slice(0, -2);
                    // list[item].parent=(parseInt((list[item].parent)[0])+1)+list[item].parent.slice(1);
                    // list[item].index=list[item].parent+"."+list[item].category;
                });
            })
            list.splice(sameBelowIndexArray[0] || sameBelowNoneIndex || currentindex + 1, 0, { category: list[currentindex].category + 1, indent: list[currentindex].indent, parent: list[currentindex].parent, index: list[currentindex].parent + "." + (list[currentindex].category + 1), text: textData, breadcrumbText: textData, isExpanded: true, icon: "▽", display: "flex" });
            //list.push({ category:list[currentindex].category+1, indent:list[currentindex].indent, parent:list[currentindex].parent, index:list[currentindex].parent+"."+(list[currentindex].category+1),text:"" });
        }
        setBullets(list);
        setCurrentindex((prevIndex)=>(sameBelowIndexArray[0] || sameBelowNoneIndex || prevIndex + 1));
    }
    function HandleBackspace() {
        console.log("index in handlebackspace:", currentindex)
        let sameBelowIndexArray = [];
        let sameBelowNoneIndex = 0;
        let childrenBelowIndexArray;
        let previousBelowIndexArray = [];
        const list = [...bullets];
        if (list[currentindex].parent != "none") {

            const arr = (list[currentindex].parent).toString().split(".");
            if (arr.length > 1) {
                const parent = arr.slice(0, -1);
                const category = arr.slice(-1);
                //const tempArray=list.filter((i)=>{i.parent==parent && list.findIndex((p)=>p.index==i.index)>currentindex});
                let parentNew = "" + parent[0];
                for (let i = 1; i < parent.length; i++) {
                    parentNew += "." + parent[i];
                }
                const currentChildren = list.filter((k) => (list.findIndex((temp) => (temp.index == k.index)) > currentindex && k.indent > list[currentindex].indent && k.parent == list[currentindex].index))
                const currentChildrenIndex = [];
                currentChildren.map((i) => (
                    currentChildrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                ));
                list[currentindex].indent--;
                list[currentindex].category = parseInt(category[0]) + 1;
                list[currentindex].parent = parentNew;
                const sameLineBelow = list.filter((item) => (item.parent == list[currentindex].parent && (list.findIndex((i) => i.index == item.index) > currentindex)));
                const previousLineBelow = list.filter((item) => (item.parent == (list[currentindex].parent + "." + (list[currentindex].category - 1)) && (list.findIndex((i) => i.index == item.index) > currentindex)));
                console.log(sameLineBelow);
                sameLineBelow.map((itemval) => {
                    sameBelowIndexArray.push(list.findIndex((i) => i.index == itemval.index));
                })
                console.log(previousLineBelow);
                previousLineBelow.map((itemval) => {
                    previousBelowIndexArray.push(list.findIndex((i) => i.index == itemval.index));
                })
                list[currentindex].index = list[currentindex].parent + "." + list[currentindex].category;
                currentChildrenIndex.map((item, i) => {
                    const children = list.filter((k) => (list.findIndex((temp) => (temp.index == k.index)) > item && k.index.toString().startsWith(list[item].index)))
                    const childrenIndex = [];
                    children.map((i) => (
                        childrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                    ));
                    list[item].indent--;
                    list[item].category = i + 1;
                    list[item].parent = list[currentindex].index;
                    list[item].index = list[item].parent + "." + list[item].category;
                    childrenIndex.map((chInd) => {
                        list[chInd].indent--;
                        const indentDifference = list[chInd].indent - list[item].indent;
                        list[chInd].index = list[chInd].index.replace(list[chInd].index.slice(0, list[item].index.length), list[item].index);
                        list[chInd].index = list[chInd].index.replace(list[chInd].index.slice(-1 - (indentDifference * 2), 1 - (indentDifference * 2)), "");
                        list[chInd].parent = list[chInd].index.slice(0, -2);
                    })
                })
                sameBelowIndexArray.map((item, index) => {
                    const children = list.filter((k) => (list.findIndex((temp) => (temp.index == k.index)) > item && k.index.toString().startsWith(list[item].index)))
                    const childrenIndex = [];
                    children.map((i) => (
                        childrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                    ));
                    list[item].category = list[currentindex].category + index + 1;
                    list[item].index = list[item].parent + "." + list[item].category;
                    childrenIndex.map((chInd) => {
                        list[chInd].index = list[chInd].index.replace(list[chInd].index.slice(0, list[item].index.length), list[item].index);
                        list[chInd].parent = list[chInd].index.slice(0, -2);
                    })
                })

                previousBelowIndexArray.map((itemval, index) => {

                    const children = list.filter((k) => (list.findIndex((temp) => (temp.index == k.index)) > itemval && k.index.toString().startsWith(list[itemval].index)))
                    const childrenIndex = [];
                    children.map((i) => (
                        childrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                    ));
                    list[itemval].parent = list[currentindex].index;
                    list[itemval].category = currentChildrenIndex.length + index + 1;
                    list[itemval].index = list[itemval].parent + "." + list[itemval].category;
                    childrenIndex.map((chInd) => {
                        list[chInd].index = list[chInd].index.replace((list[chInd].index).slice(0, list[itemval].index.length), list[itemval].index);
                        list[chInd].parent = list[chInd].index.slice(0, -2);
                    })
                })
                // tempArray.map((p,indexI)=>{
                //     list[list.findIndex((o)=>{o.index==p.index})].parent=list[currentindex].index;
                //     list[list.findIndex((o)=>{o.index==p.index})].category=indexI+1;
                //     list[list.findIndex((o)=>{o.index==p.index})].index= list[list.findIndex((o)=>{o.index==p.index})].parent+"."+list[list.findIndex((o)=>{o.index==p.index})].category;

                // })
            }
            else if (arr.length == 1) {
                const currentChildren = list.filter((k) => (list.findIndex((temp) => (temp.index == k.index)) > currentindex && k.indent > list[currentindex].indent && k.parent == (list[currentindex].index)))
                const currentChildrenIndex = [];
                currentChildren.map((i) => (
                    currentChildrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                ));
                list[currentindex].indent--;
                list[currentindex].category = parseInt(list[currentindex].parent) + 1;
                list[currentindex].parent = "none";

                const sameLineBelow = list.filter((item) => (item.parent == list[currentindex].parent && (list.findIndex((i) => i.index == item.index) > list.findIndex((i) => i.index == list[currentindex].index))));
                const previousLineBelow = list.filter((item) => (item.parent == (list[currentindex].category - 1) && (list.findIndex((i) => i.index == item.index) > list.findIndex((i) => i.index == list[currentindex].index))));
                console.log(sameLineBelow);
                sameLineBelow.map((itemval) => {
                    sameBelowIndexArray.push(list.findIndex((i) => i.index == itemval.index));
                })
                console.log(previousLineBelow);
                previousLineBelow.map((itemval) => {
                    previousBelowIndexArray.push(list.findIndex((i) => i.index == itemval.index));
                })
                list[currentindex].index = list[currentindex].category;
                currentChildrenIndex.map((item, i) => {
                    const children = list.filter((k) => (list.findIndex((temp) => (temp.index == k.index)) > item && k.index.toString().startsWith(list[item].index)))
                    const childrenIndex = [];
                    children.map((i) => (
                        childrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                    ));
                    list[item].indent--;
                    list[item].category = i + 1;
                    list[item].parent = list[currentindex].index;
                    list[item].index = list[item].parent + "." + list[item].category;
                    childrenIndex.map((chInd) => {
                        list[chInd].indent--;
                        const indentDifference = list[chInd].indent - list[item].indent;
                        list[chInd].index = list[chInd].index.replace(list[chInd].index.slice(0, list[item].index.length), list[item].index);
                        list[chInd].index = list[chInd].index.replace(list[chInd].index.slice(-1 - (indentDifference * 2), 1 - (indentDifference * 2)), "");
                        list[chInd].parent = list[chInd].index.slice(0, -2);
                    })
                })
                sameBelowIndexArray.map((item) => {
                    const children = list.filter((k) => (list.findIndex((temp) => (temp.index == k.index)) > item && k.index.toString().startsWith(list[item].index)))
                    const childrenIndex = [];
                    children.map((i) => (
                        childrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                    ));
                    if (list[currentindex].parent == "none") {
                        list[item].category = list[item].category + 1;
                        list[item].index = String(list[item].category);
                    }
                    else {
                        list[item].category = list[item].category + 1;
                        list[item].index = list[item].parent + "." + String(list[item].category);
                    }
                    childrenIndex.map((chInd) => {
                        list[chInd].index = list[chInd].index.replace(list[chInd].index.slice(0, list[item].index.length), list[item].index);
                        list[chInd].parent = list[chInd].index.slice(0, -2);
                    })
                })

                previousBelowIndexArray.map((itemval, index) => {
                    const children = list.filter((k) => (list.findIndex((temp) => (temp.index == k.index)) > itemval && k.index.toString().startsWith(list[itemval].index)))
                    const childrenIndex = [];
                    children.map((i) => (
                        childrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                    ));
                    list[itemval].parent = list[currentindex].index;
                    list[itemval].category = currentChildrenIndex.length + index + 1;
                    list[itemval].index = list[itemval].parent + "." + list[itemval].category;
                    childrenIndex.map((chInd) => {
                        list[chInd].index = list[chInd].index.replace((list[chInd].index).slice(0, list[itemval].index.length), list[itemval].index);
                        list[chInd].parent = list[chInd].index.slice(0, -2);
                    })
                })

                // const below = list.filter((item) => (item.indent == list[currentindex].indent && (list.findIndex((i) => i.index == item.index) > list.findIndex((i) => i.index == list[currentindex].index))));
                // console.log(below);
                // below.map((itemval) => {
                //     sameBelowIndexArray.push(list.findIndex((i) => i.index == itemval.index));
                // })
                // list[currentindex].index = list[currentindex].category;
                // sameBelowIndexArray.map((i) => {
                //     if (list[currentindex].parent == "none") {
                //         list[i].category = list[i].category + 1;
                //         list[i].index = String(list[i].category);
                //     }
                //     else {
                //         list[i].category = list[i].category + 1;
                //         list[i].index = list[i].parent + "." + String(list[i].category);
                //     }
                // })
            }

        }
        else if (currentindex > 0) {
            if (currentindex == list.length - 1) {
                list.pop();
                setCurrentindex((prevIndex)=>(prevIndex - 1));
            }
            else {
                const currentChildren = list.filter((k) => (list.findIndex((temp) => (temp.index == k.index)) > currentindex && k.indent > list[currentindex].indent && k.parent == (list[currentindex].index)))
                const currentChildrenIndex = [];
                currentChildren.map((i) => (
                    currentChildrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                ));
                const numberBehindsChildren = list.filter((k) => (k.indent == 1 && k.parent == list[currentindex].category - 1));
                list.splice(currentindex, 1);
                setCurrentindex((prevIndex)=>(prevIndex - 1));
                const below = list.filter((item) => (item.indent == 0 && (list.findIndex((i) => i.index == item.index) >= list.findIndex((i) => i.index == list[currentindex].index))));
                console.log(below);
                below.map((itemval) => {
                    sameBelowIndexArray.push(list.findIndex((i) => i.index == itemval.index));
                })
                currentChildrenIndex.map((item, i) => {
                    item = item - 1;
                    const previousIndex = list[item].index;
                    const children = list.filter((k) => (list.findIndex((temp) => (temp.index == k.index)) > item && k.index.toString().startsWith(list[item].index)))
                    const childrenIndex = [];
                    children.map((i) => (
                        childrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                    ));
                    list[item].parent = (parseInt(list[item].parent) - 1).toString();
                    if (numberBehindsChildren.length == 0) {
                        list[item].index = list[item].parent + "." + list[item].category;
                    }
                    else {
                        list[item].category = numberBehindsChildren[numberBehindsChildren.length - 1].category + 1 + i;
                        list[item].index = list[item].parent + "." + list[item].category;
                    }
                    childrenIndex.map((chInd) => {
                        const indentDifference = list[chInd].indent - list[item].indent;
                        list[chInd].index = list[chInd].index.replace(list[chInd].index.slice(0, previousIndex.length), list[item].index);
                        list[chInd].parent = list[chInd].index.slice(0, -2);
                    })
                })
                sameBelowIndexArray.map((item) => {
                    const previousIndex = list[item].index;
                    const children = list.filter((k) => (list.findIndex((temp) => (temp.index == k.index)) > item && k.index.toString().startsWith(list[item].index)))
                    const childrenIndex = [];
                    children.map((i) => (
                        childrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                    ));
                    list[item].category = list[item].category - 1;
                    list[item].index = String(list[item].category);
                    childrenIndex.map((chInd) => {
                        list[chInd].index = list[chInd].index.replace(list[chInd].index.slice(0, previousIndex.length), list[item].index);
                        list[chInd].parent = list[chInd].index.slice(0, -2);
                    })
                })
            }
        }
        else if (currentindex == 0 && list.length > 1) {
            childrenBelowIndexArray = [];
            const below = list.filter((i) => (i.parent == "none" && list.findIndex((index) => (index.index == i.index)) > currentindex));
            const children = list.filter((i) => (i.indent > list[currentindex].indent && i.parent == list[currentindex].index));
            children.map((item) => (childrenBelowIndexArray.push(list.findIndex((i) => (i.index == item.index)))));
            below.map((item) => (sameBelowIndexArray.push(list.findIndex((i) => (i.index == item.index)))));
            childrenBelowIndexArray.map((child, i) => {
                const childrenOfChild = list.filter((i) => (i.indent > list[child].indent && i.index.toString().startsWith(list[child].index)));
                let childrenOfChildIndexArray = [];
                childrenOfChild.map((index) => (childrenOfChildIndexArray.push(list.findIndex((i) => (i.index == index.index)))));
                list[child].indent--;
                list[child].index = i + 1;
                list[child].parent = "none";
                list[child].category = i + 1;
                childrenOfChildIndexArray.map((item) => {
                    list[item].indent--;
                    list[item].parent = list[item].parent.slice(2);
                    list[item].index = list[item].index.slice(2);
                })
            })
            if (below.length > 0) {
                sameBelowIndexArray.map((i, count) => {
                    let belowchildrenBelowIndexArray = [];
                    let childrenOfBelow = list.filter((temp) => (temp.indent > list[i].indent && (temp.parent).toString().startsWith(list[i].index) && list.findIndex((ind) => ind.index == temp.index) > i));
                    childrenOfBelow.map((itemval) => {
                        belowchildrenBelowIndexArray.push(list.findIndex((i) => i.index == itemval.index));
                    });
                    list[i].category = childrenBelowIndexArray.length + 1 + count;
                    list[i].index = String(list[i].category);
                    belowchildrenBelowIndexArray.map((item) => {
                        list[item].parent = (list[item].parent).replace((list[item].parent)[0], list[i].index);
                        list[item].index = (list[item].index).replace((list[item].index)[0], list[i].index);
                    });
                });
            }
            list.splice(0, 1);
        }
        setBullets(list);
    }
    const handleKeyDown = (e) => {
        console.log("event")
        console.log(e)
        let sameBelowIndexArray = [];
        let sameBelowNoneIndex = 0;
        let childrenBelowIndexArray;
        let previousBelowIndexArray = [];
        const list = [...bullets];
        if (e.altKey == true && e.nativeEvent.key == "ArrowDown") {
            let text = "";
            text = list[currentindex].text;
            list[currentindex].text = list[currentindex + 1].text;
            list[currentindex].breadcrumbText = list[currentindex + 1].text;
            list[currentindex + 1].text = text;
            list[currentindex + 1].breadcrumbText = text;
            setBullets(list);
            setCurrentindex((prevIndex)=>(prevIndex + 1));
        }
        else if (e.altKey == true && e.nativeEvent.key == "ArrowUp") {
            let text = "";
            text = list[currentindex].text;
            list[currentindex].text = list[currentindex - 1].text;
            list[currentindex].breadcrumbText = list[currentindex - 1].text;
            list[currentindex - 1].text = text;
            list[currentindex - 1].breadcrumbText = text;
            setBullets(list);
            setCurrentindex((prevIndex)=>(prevIndex - 1));
        }
        else if (e.ctrlKey == true && e.nativeEvent.key == "s") {
            e.preventDefault();
            PopupToggle();
        }
        else if (e.ctrlKey == true && e.altKey == true && e.nativeEvent.key == "n") {
            e.preventDefault();
            NewFile(e);
        }
        else if (e.nativeEvent.key == "Enter" || e.code == "Enter") {
            e.preventDefault();
            HandleEnter("");
        }
        else if (e.nativeEvent.key == "Tab") {
            e.preventDefault();
            const tempParent = list[currentindex].parent;
            if (currentindex > 0 && list[currentindex].indent == list[currentindex - 1].indent) {
                const tempIndex = list[currentindex].index;
                list[currentindex].indent++;
                list[currentindex].category = 1;
                list[currentindex].parent = list[currentindex - 1].index;
                list[currentindex].index = list[currentindex - 1].index + "." + String(list[currentindex].category);
                const previousLineBelow = list.filter((item) => (item.indent == list[currentindex].indent - 1 && item.parent == tempParent && list.findIndex((i) => i.index == item.index) > currentindex));
                const sameLineBelow = list.filter((item) => (item.indent == list[currentindex].indent && item.parent == tempIndex && list.findIndex((i) => i.index == item.index) > currentindex));

                sameLineBelow.map((item) => {
                    sameBelowIndexArray.push(list.findIndex((ind) => (ind.index == item.index)))
                })
                previousLineBelow.map((item) => {
                    previousBelowIndexArray.push(list.findIndex((ind) => (ind.index == item.index)))
                })

                sameBelowIndexArray.map((item) => {
                    const children = list.filter((i) => (list.findIndex((temp) => (temp.index == i.index)) > item && i.index.toString().startsWith(list[item].index)))
                    const childrenIndex = [];
                    children.map((i) => (
                        childrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                    ));
                    list[item].parent = list[currentindex].parent;
                    ++list[item].category;
                    list[item].index = list[item].parent + "." + list[item].category;
                    childrenIndex.map((chInd) => {
                        list[chInd].index = list[chInd].index.replace(list[chInd].index.slice(0, list[item].index.length), list[item].index);
                        list[chInd].parent = list[chInd].index.slice(0, -2);
                    })
                })
                previousBelowIndexArray.map((itemval) => {
                    const children = list.filter((i) => (list.findIndex((temp) => (temp.index == i.index)) > itemval && i.index.toString().startsWith(list[itemval].index)))
                    const childrenIndex = [];
                    children.map((i) => (
                        childrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                    ));
                    list[itemval].category = list[itemval].category - 1;
                    if (list[itemval].parent != "none") {
                        list[itemval].index = list[itemval].parent + "." + String(list[itemval].category);
                    }
                    else {
                        list[itemval].index = String(list[itemval].category);
                    }
                    childrenIndex.map((chInd) => {
                        list[chInd].index = list[chInd].index.replace((list[chInd].index).slice(0, list[itemval].index.length), list[itemval].index);
                        list[chInd].parent = list[chInd].index.slice(0, -2);
                    })
                })

            }
            else if (currentindex > 0 && list[currentindex].indent < list[currentindex - 1].indent) {
                list[currentindex].indent++;
                const prev = list[currentindex].index;
                const above = list.filter((item) => (item.indent == list[currentindex].indent && list.findIndex((i) => i.index == item.index) < list.findIndex((i) => i.index == list[currentindex].index)));
                list[currentindex].category = above[above.length - 1].category + 1;
                list[currentindex].parent = above[above.length - 1].parent;
                list[currentindex].index = list[currentindex].parent + "." + String(list[currentindex].category);
                const sameLineBelow = list.filter((item) => (item.parent == prev && list.findIndex((i) => i.index == item.index) > currentindex));
                const previousLineBelow = list.filter((item) => (item.indent == list[currentindex].indent - 1 && item.parent == tempParent && list.findIndex((i) => i.index == item.index) > currentindex));
                sameLineBelow.map((item) => {
                    sameBelowIndexArray.push(list.findIndex((ind) => (ind.index == item.index)))
                })
                previousLineBelow.map((item) => {
                    previousBelowIndexArray.push(list.findIndex((ind) => (ind.index == item.index)))
                })
                sameBelowIndexArray.map((itemval, ind) => {
                    const children = list.filter((i) => (list.findIndex((temp) => (temp.index == i.index)) > itemval && i.index.toString().startsWith(list[itemval].index)))
                    const childrenIndex = [];
                    children.map((i) => (
                        childrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                    ));
                    list[itemval].category = list[currentindex].category + ind + 1;
                    list[itemval].index = list[currentindex].parent + "." + String(list[itemval].category);
                    childrenIndex.map((chInd) => {
                        list[chInd].index = list[chInd].index.replace((list[chInd].index).slice(0, list[itemval].index.length), list[itemval].index);
                        list[chInd].parent = list[chInd].index.slice(0, -2);
                    })
                });

                previousBelowIndexArray.map((itemval) => {
                    const children = list.filter((i) => (list.findIndex((temp) => (temp.index == i.index)) > itemval && i.index.toString().startsWith(list[itemval].index)))
                    const childrenIndex = [];
                    children.map((i) => (
                        childrenIndex.push(list.findIndex((ind) => (ind.index == i.index)))
                    ));
                    list[itemval].category = list[itemval].category - 1;
                    if (list[itemval].parent != "none") {
                        list[itemval].index = list[itemval].parent + "." + String(list[itemval].category);
                    }
                    else {
                        list[itemval].index = String(list[itemval].category);
                    }
                    childrenIndex.map((chInd) => {
                        list[chInd].index = list[chInd].index.replace((list[chInd].index).slice(0, list[itemval].index.length), list[itemval].index);
                        list[chInd].parent = list[chInd].index.slice(0, -2);
                    })
                })
            }

            setBullets(list);
            console.log(bullets);
        }
        else if (e.nativeEvent.key == "Backspace") {
            if (e.target.selectionStart == 0) {
                e.preventDefault();
                HandleBackspace();
            }
        }
        else if (e.altKey == false && e.nativeEvent.key == "ArrowUp") {
            if (currentindex > 0) {
                setCurrentindex((prevIndex)=>(prevIndex - 1));
                setBullets(list);
                console.log(bullets);
            }

        }
        else if (e.altKey == false && e.nativeEvent.key == "ArrowDown") {
            if (currentindex < list.length - 1) {
                setCurrentindex((prevIndex)=>(prevIndex + 1));
                setBullets(list);
                console.log(bullets);
            }

        }
    }
    return (
        <div className="outline">
            <div className="savepopup" style={{ display: popupDisplay }}>
                <div className="saveFileHeader">
                    <div>Save</div>
                    <div className="cross" onClick={PopupToggle}><RxCross2 /></div>
                </div>
                <div className="saveFileContainer">
                    {keyName.map((keyVal) => (
                        <div className="savedFiles">{keyVal}</div>
                    ))}
                </div>
                <form onSubmit={handleSubmit((data) => { Save(data.name) })}>
                    <input {...register("name", { required: true })} type="text" placeholder="Name of file without extension" />
                    <div>
                        <button type="submit" >Save</button>
                        <button onClick={PopupToggle} type="button">Cancel</button>
                    </div>
                </form>
            </div>
            <div className="headerDiv">
                <div className="title"><div>{currentFile}</div><div className="loginOverHeader" onClick={() => { LoginAccount() }}><VscAccount /><div>{user.value}</div></div></div>
                <Account newFile={NewFile} />
                <Header popupToggle={PopupToggle} bullets={bullets} reference={inputref} sidebarDisplay={SidebarDisplay} newFile={NewFile} currentFile={currentFile} keys={GetFiles()} save={Save} open={Open} export={Export2Word} />
            </div>
            <div style={{ display: "flex" }}>

                {
                    sidebarDisplay == 'about' ? <About /> :
                        <div ref={contentRef} id="screen" className="screen">
                            {bullets.map((point, i) => (
                                <div>
                                    <div key={i} id={i} onDragStart={(e) => start(e)} onDragEnter={(e) => enter(e)} onDrop={end} onDragOver={(e) => allowDrop(e)} onDragEnd={drop} draggable style={{ marginLeft: ((point.indent) * 20), display: point.display }} className="line">
                                        <div onClick={() => {
                                            inputref.current[i].focus();
                                            setCurrentindex(i);
                                            handleExpand(point,i);
                                        }} className="bullet">{point.icon}{point.index}</div><TextareaAutosize id={i} onClick={() => {
                                            inputref.current[i].focus();
                                            setCurrentindex(i);
                                        }} onKeyDown={handleKeyDown} ref={(reference) => { inputref.current[i] = reference }} value={point.breadcrumbText} onChange={handleTextboxvalue} className="textbox" />
                                    </div>
                                </div>
                            ))}
                        </div>
                }
                {
                    sidebarDisplay == 'shortcut' ? <Shortcuts /> : ''
                }
            </div>
        </div>
    )
}
export default Pad;