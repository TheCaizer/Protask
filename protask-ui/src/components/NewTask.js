import React, {useRef, useState} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';

function NewTask(props) {
    // Component to create a new task, dynamic based on 
    // whether the task is being created in a project
    // or not
    
    const [details, setDetails] = useState({name: "", description: "", dueDate: '', skills: [], assignees: [], public: false});
    const formRef = useRef(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [show, setShow] = useState(false);
    const [skillName, setSkillName] = useState('');

    const creator = props.creator;
    const projID = props.projID;


    // Sends new task information to backend if normal task
    const postTask = async () => {
        await fetch('/create-task?token=' + creator.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        }).then(response => response.json().then(data => {

            if (data.task_id !== '') {
                console.log('task created'); 
                
                
                
            }    

        })) 
    }

    // Sends task information to backend if project task
    const postProjectTask = async () => {
        console.log(details);
        await fetch('/project-createTask?token=' + creator.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        }).then(response => response.json().then(data => {

            if (data.hasOwnProperty('error')) {
                console.log(data);
                setErrorMsg(data.error);
                setShow(true);
            }
            if (data.task_id !== '') {
                console.log(data.task_id);
                console.log('task created in project'); 
                
                
                
            }    

        })) 
    }
    
    const handleReset = () => {
        formRef.current.reset();
        details.skills = [];
        details.public = false;
        details.assignees = [];
      };
    
    const submitHandler = e => {
        e.preventDefault();
        if (projID === null) {
            postTask();
        } else {
            details.projectID = projID;
            console.log(details);
            postProjectTask();
        }
        
        setDetails({name: "", description: "", dueDate: '', assignees: []});
        handleReset();
    }

    const addSkill = (skill) => {
        if (!details.skills.includes(skill)) {
            details.skills.push(skill);
        }
    }
    
    const [result, setResult] = useState([]);

    // Search bar to search through connections to assign
    // the task to
    const changeHandler = e => {
        e.preventDefault();
        const query = e.target.value;
        
        const searchConnections = async () => {
            if (projID === null) {
                await fetch('/search-connections?token=' + creator.token, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({query: query})
                }).then(response => response.json().then(data => {
    
                    if (response.ok) {
                        setResult(data.result);    
                        
                    }    
    
                })) 
            } else {
            
                await fetch('/project-search?token=' + creator.token, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({query: query, projectID: projID})
                }).then(response => response.json().then(data => {
    
                    if (response.ok) {
                        setResult(data.result);     
                    }    
    
                })) 
            }
        }
        
        searchConnections();
    }

    const addAssignee = (email) => {
        if (!details.assignees.includes(email)) {    
            details.assignees.push(email);
        }
    }

    return (
        <div className='taskFormBox'>
            <div className='errorBox' style={{zIndex: '3'}}>
                {show 
                    ? <Alert variant="danger" onClose={() => setShow(false)} dismissible style={{zIndex: '3'}}>
                            <Alert.Heading>{errorMsg}</Alert.Heading>
                    </Alert>
                  : <div />
                }
            </div>
            <Form className='taskForm' onSubmit={submitHandler} ref={formRef}>
                <Form.Check 
                    type="switch"
                    id="public-switch"
                    label="Make Public"
                    onChange={e => {details.public = !details.public; e.preventDefault();}}
                    />
                <p style={{color: '#d2d8da'}}> 
                    Making a task public allows others to see it and request assignment
                </p>
                <Form.Group className="taskForm__inner" controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" name="name" id="name" onChange={e => setDetails({...details, name: e.target.value})} value={details.name}/>
                </Form.Group>

                <Form.Group className="taskForm__inner" controlId="formDesc">
                    <Form.Label>Description</Form.Label>
                    <Form.Control type="text" name="desc" id="desc" onChange={e => setDetails({...details, description: e.target.value})} value={details.description}/>
                </Form.Group>

                <Form.Group className="taskForm__inner" controlId="formDate">
                    <Form.Label>Due Date</Form.Label>
                    <Form.Control type="date" name="dueDate" id="dueDate" onChange={e => setDetails({...details, dueDate: e.target.value})} value={details.dueDate}/>
                </Form.Group>
                <Form.Group className="taskForm__inner" controlId="formSkills">
                    <Form.Label>Skills</Form.Label>
                    <Form.Control type="skills" name="skills" id="skills" onChange={e => setSkillName(e.target.value)} value={skillName}/>
                    <p style={{color: '#d2d8da'}}> 
                        Add each skill separately using the 'add skill' button
                    </p>
                    <Button type='button' onClick={e => {addSkill(skillName); e.preventDefault();}} value={details.skills}>Add Skill</Button>
                    {details.skills 
                    ?    <ListGroup>
                            {details.skills.map((skill, i) => {
                                return (
                                    <ListGroup.Item key={i}>
                                        {skill}
                                    </ListGroup.Item>
                                )
                            })}    
                        </ListGroup>
                    : <div/>
                    }
                </Form.Group>
                <Form.Group className="taskForm__inner">
                    <Form.Label>Assignees</Form.Label>
                    
                    
                    <ListGroup>
                        {details.assignees.map((assgn, i) => {
                            return (
                                <ListGroup.Item key={i}>
                                    {assgn}
                                </ListGroup.Item>
                            )
                        })}    
                    </ListGroup>
                </Form.Group>
                

                <div className='connectionSearch'>
                    <div className='connectionSearchBar'>
                        <input type='text' onChange={changeHandler} placeholder='Search Taskmasters'/>
                    </div>
                    <div className='connectionSearchResult'>
                        <ListGroup>
                            {result.map((conxion, i) => {
                                return (
                                <ListGroup.Item action onClick={e => {addAssignee(conxion.email); e.preventDefault();}} key={conxion.email}>
                                    {conxion.email} | {conxion.firstName} {conxion.lastName} 
                                </ListGroup.Item>
                                )
                            })}
                        </ListGroup>
                    </div>
                </div>

                <Button type="submit" className="taskForm__button">
                    CREATE TASK 
                </Button>


            </Form>


        </div>
    )
}

export default NewTask