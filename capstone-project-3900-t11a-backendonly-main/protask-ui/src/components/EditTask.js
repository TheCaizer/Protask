import React, {useState} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';

function EditTask(props) {
    // Component to allow users to edit tasks they have created
    
    const task = props.task;
    const currUser = props.currUser;
    const [details, setDetails] = useState({name: "", description: "", dueDate: "", assignees: [], skills: [], public: task.public});
    const [skillName, setSkillName] = useState('');

    // Send edit task request
    const editHandler = async () => {
        await fetch('/edit-task?token=' + currUser.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        }).then(response => response.json().then(data => {
            if (data.task_id !== '') {
                console.log('edited task');
            }  

        }))
        

    }

    // Send delete task request
    const delTask = async () => {
        await fetch('/delete-task?token=' + currUser.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        }).then(response => response.json().then(data => {
            if (data.result === 1) {
                console.log('deleted task');
            }  

        }))    
    }

    const delHandler = e => {
        e.preventDefault();
        delTask();

    }

    const addSkill = (skill) => {
        if (!details.skills.includes(skill)) {
            details.skills.push(skill);
        }
    }

    const [searchQ, setSearchQ] = useState({query: ''});
    const [result, setResult] = useState([]);

    const searchConnections = async () => {
        await fetch('/search-connections?token=' + currUser.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchQ)
        }).then(response => response.json().then(data => {

            if (response.ok) {
                setResult(data.result); 
                
                
                
            }    

        })) 
    }

    const submitHandler = e => {
        e.preventDefault();
        //setDetails({...details, id: task.id});
        details.id = task.id;
        console.log(details);
        editHandler();
    }

    const addAssignee = (email) => {
        if (!details.assignees.includes(email) && !task.assignees.includes(email)) {    
            details.assignees.push(email);
        }
    }

    const queryHandler = e => {
        e.preventDefault();
        setSearchQ({...searchQ, query: e.target.value});
        console.log(searchQ);
        searchConnections();
    }

    return (
        <div className='editTask'>
            <Button variant='danger' onClick={delHandler}>DELETE TASK</Button>
            
            <Form className='taskEditForm' onSubmit={submitHandler}>
            <Form.Check 
                    defaultChecked={details.public}
                    type="switch"
                    id="public-switch"
                    label="Make Public"
                    onChange={e=>{details.public = !details.public; e.preventDefault();}}
                    />
                <Form.Group className="editTaskForm__inner" controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" name="name" id="name" placeholder={task.title} onChange={e => setDetails({...details, name: e.target.value})} value={details.name}/>
                </Form.Group>

                <Form.Group className="editTaskForm__inner" controlId="formDesc">
                    <Form.Label>Description</Form.Label>
                    <Form.Control type="text" name="desc" id="desc" placeholder={task.description} onChange={e => setDetails({...details, description: e.target.value})} value={details.description}/>
                </Form.Group>

                <Form.Group className="editTaskForm__inner" controlId="formDueDate">
                    <Form.Label>Due Date</Form.Label>
                    <Form.Control type="date" name="dueDate" id="dueDate" placeholder={task.dueDate} onChange={e => setDetails({...details, dueDate: e.target.value})} value={details.dueDate}/>
                </Form.Group>

                <Form.Group className="taskForm__inner" controlId="formSkills">
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
                        <input type='text' onChange={queryHandler} placeholder='Add Assignees'/>
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

                <Button type="submit" className="editTaskForm__button">
                    SAVE 
                </Button>


            </Form>


        </div>
    )
}

export default EditTask