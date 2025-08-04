import ListGroup from 'react-bootstrap/ListGroup'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { doc, deleteDoc,updateDoc  } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { db } from '../firebase';
import { useState } from 'react';

const Comment = ({commentObj,isOwner})=>{
  const [edit,setEdit] =useState(false);
  const [comment,setComment] = useState(commentObj.comment);
  

  const deleteComment = async ()=>{
    const storage = getStorage();

    const deleteConfirm = window.confirm('정말 삭제할까요?')
    if(deleteConfirm){
      await deleteDoc(doc(db, "comments", commentObj.id)); // 마지막은 이 글을 조회할 수 있는 키가 들어와야함
      
      // Create a reference to the file to delete
      if(commentObj.image !== ''){
        const desertRef = ref(storage, commentObj.image);
        // Delete the file
        deleteObject(desertRef).then(() => {
          //alert('첨부파일이 삭제 되었습니다.')
        }).catch((error) => {
          // Uh-oh, an error occurred!
        });
      }
    }
  }

  const toggleEditMode = ()=>{
    setEdit(prev=>!prev)
  }
  const onSubmit = async (e)=>{
    e.preventDefault();
    const commentRef = doc(db, "comments", commentObj.id);

    await updateDoc(commentRef, {
      comment: comment
    });
    setEdit(false);
  }
  const onChange = (e) =>{
    //입력한 내용을 comment에 반영한다.
    setComment(e.target.value);
  }

  return(
    <ListGroup.Item >
      <div className='d-flex justify-content-between align-items-center'>
        {edit ? 
          <Form className="w-100"onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="Comment">
              <Form.Label>수정</Form.Label>
              <Form.Control as="textarea" rows={3} value={comment} onChange={onChange}/>
            </Form.Group>
              <Button size="sm" className="me-1" variant="secondary" onClick={toggleEditMode}>취소</Button>
              <Button type='submit' size="sm" variant="primary">입력</Button>
          </Form>
        :
        <>
          {commentObj.comment}
          {commentObj.image !== '' && <div><img src={commentObj.image} width="50px" alt=""/></div>}
          {isOwner &&           
            <div className='d-flex gap-1'>
              <Button size="sm" variant="secondary" onClick={toggleEditMode}>수정</Button>
              <Button size="sm" variant="danger" onClick={deleteComment}>삭제</Button>
            </div>
          }
        </>
      }
        
      </div>
    </ListGroup.Item>
  )
}
export default Comment