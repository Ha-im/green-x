import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';
import { collection, addDoc,serverTimestamp, onSnapshot, query,orderBy,limit } from "firebase/firestore"; 
import { db } from '../firebase';
import ListGroup from 'react-bootstrap/ListGroup'
import Comment from '../components/Comment';
import { getStorage, ref,uploadString,getDownloadURL} from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';


const Home = ({userObj})=>{
  const [comment,setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [attachment,setAttachment] = useState(''); 
  const storage = getStorage();

  const getComments = async ()=>{ // 실시간으로 받아오고 있는것
    const q = query(collection(db, "comments"),orderBy('date',"desc"),limit(10)); //쿼리실행
    onSnapshot(q, (querySnapshot) => {
      const commentsArray = querySnapshot.docs.map((doc)=>({
        ...doc.data(),
        id:doc.id
      }))
      setComments(commentsArray);
    });
    /*
    querySnapshot.forEach((doc) => {
      console.log(doc.data());
    });
    */
  }
  const onChange = (e) =>{
    //입력한 내용을 comment에 반영한다.
    setComment(e.target.value)
  }
  const onSubmit = async (e) => {
    e.preventDefault(); // 1. 폼 전송 기본 동작 방지
 
    let imageURL = ''; // 2. 이미지 URL 초기값 설정 // 다중으로 들어가려면 배열 
 
    // 3. 첨부파일이 있는 경우에만 Firebase Storage에 이미지 업로드
    if (attachment !== '') { //얘가 반복문 안으로 들어가야한다. /다중 
      const storageRef = ref(storage, `${userObj}/${uuidv4()}`); // 3-1. 저장 경로 지정
      const snapshot = await uploadString(storageRef, attachment, 'data_url'); // 3-2. 이미지 업로드 (비동기)
      imageURL = await getDownloadURL(snapshot.ref); // 3-3. 업로드된 이미지의 URL 가져오기 (비동기)
    }
 
    // 4. Firestore에 등록할 데이터 객체 구성
    const data = {
      comment: comment,
      date: serverTimestamp(),
      uid: userObj,
      image: imageURL, // 4-1. 첨부파일이 없으면 빈 문자열, 있으면 URL // 여기도 배열로들어가야함
    };
 
    // 5. Firestore에 댓글 문서 추가 (비동기)
    const docRef = await addDoc(collection(db, "comments"), data);
    console.log("새글의 아이디: ", docRef.id);
 
    // 6. 입력 필드와 첨부파일 상태 초기화
    setComment('');
    setAttachment('');
    document.querySelector('#attachment').value = '';
  };


  useEffect(() => {
    getComments();
  }, [comments]);
  const onFileChange = (e)=>{
    // console.log(e.target.files[0]);
    // const {target:{files}} = e; // 구조분해할당 변수명은 files
    const theFile = e.target.files[0];
    //파일 FileReader.readAsDataURL()
    const reader = new FileReader();
    //리더에 온로드 이벤트가 일어나면 할일
    reader.onloadend = (e)=>{ // 그 읽기가 완료되면 결과를 e에서 확인한다
      setAttachment(e.target.result);
    }
    reader.readAsDataURL(theFile); // 파일 정보를 읽고 dataURL형태로 읽는다.
  }
  const onClearFile = (e)=>{
    //누르면 삭제되게 해달라고 한다.
    setAttachment('');
    document.querySelector('#attachment').value = '';
  }

  return(
    <>
      <h2>Home</h2>
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="Comment">
          <Form.Label>Comment</Form.Label>
          <Form.Control as="textarea" rows={3} value={comment} onChange={onChange}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="attachment">
          <Form.Label>Image</Form.Label>
          <Form.Control type="file" multiple accept="image/*" onChange={onFileChange}/>
        </Form.Group>
        <div>
          {
          attachment &&
          <div className="d-flex gap-1 p-1 align-items-center">
            <img src={attachment} wudth="50px" height="50px" alt=""/>
            <Button size="sm" variant="secondary" onClick={onClearFile}>삭제</Button>
          </div>
          }
        </div>
        <Button type='submit' variant="primary">입력</Button>
      </Form>
      <hr/>
    
    <ListGroup>
    {comments.map(c=><Comment isOwner={c.uid === userObj}  key={c.id} commentObj={c}></Comment>)}
    </ListGroup>
    </>
  )
}

export default Home