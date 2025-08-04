import Router from './Router';
import { useState } from "react";
import { authService } from '../firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import { getAuth, onAuthStateChanged } from "firebase/auth";

//console.log(authService.currentUser); // 유저정보 확인하는방법

function App() {
  const auth = getAuth();
  const [isLoggedIn,setIsLoggedIn] = useState(false)
  const [init,setInit] = useState(false); // 회원정보, 로그인 정보 확인 전 // false면 아직 초기화중
  const [userObj,setUserObj] = useState(null); // 회원정보

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      setIsLoggedIn(true);
      setUserObj(uid);
    } else {
      //User is signed out
      setIsLoggedIn(false);
    }
    setInit(true)
  });

  return (
    <div className="container">
      <h1>Green - X</h1>
      {init ? <Router isLoggedIn={isLoggedIn} userObj={userObj}/> : "초기화중..."}
      <hr/>
      <p>copyright alikerock All rights reserved.</p>
    </div>
  );
}

export default App;
