import Button from 'react-bootstrap/Button';
import { getAuth, signOut, updateProfile, } from "firebase/auth";
import { useNavigate } from "react-router";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { useState,useEffect } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import { collection, query, where, getDocs,onSnapshot,orderBy } from "firebase/firestore";
import { db } from '../firebase';
import Comment from '../components/Comment';

const Profile = ()=>{
  const auth = getAuth(); // 유저정보 확인하는방법
  let navigate = useNavigate();
  const storage = getStorage();
  const user = auth.currentUser;
  console.log(user)
  //process.env.PUBLIC_URL = public 폴더 안의 파일에 접근할 때 **기본 경로(base URL)**를 나타냅니다.
  /* 리액트에서 이미지나 파일을 사용할 때 경로가 꼬이지 않게 하기 위해 씁니다. 특히 배포할 때 경로가 바뀌는 경우 유용하다. */
  const defaultProfileURL = `${process.env.PUBLIC_URL}/default_profile.svg`;
  const [profile,setProfile] = useState(defaultProfileURL);
  const [comments, setComments] = useState([]);
  const onLogout = ()=>{
    signOut(auth).then(() => {
      alert('로그아웃 되었습니다.')
      navigate('/')
    }).catch((error) => {
      // An error happened.
    });
  }
  //내가 쓴글 확인 
  const getComments = async ()=>{ // 실시간으로 받아오고 있는것
    const q = query(collection(db, "comments"), where('uid', "==",user.uid ),orderBy('date',"desc"));

    const querySnapshot = await getDocs(q);
    const commentsArray = querySnapshot.docs.map((doc)=>({
      ...doc.data(),
      id:doc.id
    }))
    setComments(commentsArray);
  }
  const updateLogo = async (e)=>{
    const file = e.target.files[0];
    const storageRef = ref(storage, `profile/${user.uid}`); // 3-1. 저장 경로 지정
    const snapshot = await uploadBytes(storageRef, file); // 3-2. 이미지 업로드 (비동기) 지정한 서버에 등록된것 그때 절대경로를 가져와야한다.
    const profileURL = await getDownloadURL(snapshot.ref); // 3-3. 업로드된 이미지의 URL 가져오기 (비동기) 그 절대경로를 알려주는것
    console.log(profileURL)
    //현재 데이터베이스에 들어간 파일을 업로드 하는 방법 새로고침하면 다시 기본값으로 돌아온다.그걸 해결하려면 updateProfile 사용해야한다. 이후 useEffect를 이용해서 firebases라는 문구가있을때 setProfile로 경로를 바꿔준다.
    setProfile(profileURL);

    updateProfile(user, {
      photoURL: profileURL
    })
    console.log(user)
  }
  useEffect(()=>{
    (user.photoURL !== null && user.photoURL.includes('firebases')) && setProfile(user.photoURL);
    getComments()
  },[])
  return(
    <>
    <h2>Profile</h2>
    <div className='profile'>
      <div className='info'>
        <img src={profile} alt=""/>
        <h3>{user.displayName}</h3>
      </div>
      <input type="file" className='hidden' accept='image/*' name="profile" id="profile" onChange={updateLogo}/>
      <label htmlFor="profile" className='btn btn-secondary btn-sm' >Update Profile</label>
      
    </div>
    <Button variant="primary" onClick={onLogout}>Logout</Button>
    <hr/>
    <h3>My Comment List</h3>
    {/*내가 쓴 글 출력*/}
    <ListGroup>
    {comments.map(c=><Comment isOwner={true}  key={c.id} commentObj={c}></Comment>)}
    </ListGroup>
    </>
  )
}

export default Profile