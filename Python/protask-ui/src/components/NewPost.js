import React, {useState, useRef} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';

function NewPost({user}) {
    // Component to create new public posts to find
    // connections


    const [details, setDetails] = useState({description: '', skills: []})
    const [skillName, setSkillName] = useState('');
    const formRef = useRef(null);

    // Adds skills to post
    const addSkill = (skill) => {
        if (!details.skills.includes(skill)) {
            details.skills.push(skill);
        }
    }
    
    // Adds new post
    const addPost = async () => {
        await fetch('/create-post?token=' + user.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        }).then(response => response.json().then(data => {

            if (response.ok) {
                console.log('new post added'); 
                
                
                
            }    

        })) 
    }



    const handleReset = () => {
        formRef.current.reset();
      };
    
    const submitHandler = e => {
        e.preventDefault();

        addPost();
        
        setDetails({description: "", skills: []});
        handleReset();
    }
  
    return (
    <div className='newPostBox'>
        <Form className='newPostForm' onSubmit={submitHandler} ref={formRef}>
                <Form.Group className="newPostForm__inner" controlId="formDesc">
                    <Form.Label>Description</Form.Label>
                    <Form.Control type="text" name="desc" id="desc" onChange={e => setDetails({...details, description: e.target.value})} value={details.description}/>
                </Form.Group>

                <Form.Group className="newPostForm__inner" controlId="formSkills">
                    <Form.Label>Skills</Form.Label>
                    <Form.Control type="skills" name="skills" id="skills" onChange={e => setSkillName(e.target.value)} value={skillName}/>
                    <p style={{color: '#d2d8da'}}> 
                        Add each skill separately using the 'add skill' button
                    </p>
                    <Button type='button' onClick={e => {addSkill(skillName); e.preventDefault();}} value={details.skills}>Add Skill</Button>
                    <ListGroup>
                        {details.skills.map((skill, i) => {
                            return (
                                <ListGroup.Item key={i}>
                                    {skill}
                                </ListGroup.Item>
                            )
                        })}    
                    </ListGroup>
                </Form.Group>

                <Button type="submit" className="newPostForm__button">
                    CREATE POST
                </Button>


            </Form>
    
    </div>
  )
}

export default NewPost