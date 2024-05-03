import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import NewPost from './NewPost';
import { ListSubheader } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

function MyPosts({currUser}) {
    // Components to list all the posts created by the user


    const [posts, setPosts] = useState([]);  
    const [target, setTarget] = useState(-1); 

    // Retrieves user's created posts every 700ms
    useEffect(() => {
        const interval = setInterval(() => {
            fetch('/myPosts?token=' + currUser.token).then(response => 
                response.json().then(data => {
                  setPosts(data.posts);
                  console.log(data.posts);
                })
              );
            }, 700);
          return () => clearInterval(interval);
      }, [posts, currUser.token])

    // Sends request to delete a post
    const delPost = async () => {
      await fetch('/delete-post?token=' + currUser.token, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({id: target})
      }).then(response => response.json().then(data => {
          if (data.result === 1) {
              console.log('deleted post');
          }  

      }))    
  }
    
    const delHandler = (id) => {
      setTarget(id);
      console.log(target);
      delPost();

    }

    
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    //console.log(currUser);
    return (
        <div className='taskList'>
            <h2>Your Created Posts</h2>
            {posts.length === 0 ? <h3>You have no current active posts.</h3> : <div/>}
              <Row>
                  <Col>
                  <ListGroup>
                  {posts.map(p => {
                      return (
                      <ListGroup.Item action key={p.postID} >
                          {p.description}
                          <List dense sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper', overflow: 'auto', position: 'relative', maxHeight: 240, padding: 4}}>
                            <ListSubheader>Skills: </ListSubheader>
                            {p.skills.map((s, i) => {
                            return (
                                <ListItem
                                    key={i}
                                    disablePadding
                                >
                                    <ListItemText primary={s} />
                                </ListItem>
                                );
                            })}
                          </List>
                          <Button variant='danger' onClick={e => {delHandler(p.postID); e.preventDefault();}}>DELETE POST</Button>
                      </ListGroup.Item>
                      )
                  })}
                  </ListGroup>
                  </Col>
              </Row>



            <Button onClick={handleShow}>
                Create New Post
            </Button>

            <Modal show={show} onHide={handleClose} width='5em'>
                <Modal.Header closeButton>
                <Modal.Title>Create a new post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NewPost user={currUser}/>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default MyPosts