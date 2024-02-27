import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Pad from "../Components/Pad";
import Login from "../Components/Login";
import Signup from '../Components/Signup';
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
            <Route path='/' Component={Pad}/>
            <Route path='/Login' Component={Login}/>
            <Route path='/Signup' Component={Signup}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
