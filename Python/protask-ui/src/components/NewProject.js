import React, {useRef, useState} from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';

function NewProject({creator}) {
    // Component to create a new project
    
    const [details, setDetails] = useState({title: "", description: "", members: []});
    const formRef = useRef(null);

    // Sends project details to backend
    const postProject = async () => {
        await fetch('/create-project?token=' + creator.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        }).then(response => response.json().then(data => {

            if (data.project_id !== '') {
                console.log('project created'); 
                
                
                
            }    

        })) 
    }
    
    const handleReset = () => {
        formRef.current.reset();
      };
    
    const submitHandler = e => {
        e.preventDefault();
        postProject();
        setDetails({name: "", description: "", members: []});
        handleReset();
    }
    


    const [searchQ, setSearchQ] = useState({query: ''});
    const [result, setResult] = useState([]);

    // Search bar to search through connections to 
    // add them to project
    const searchConnections = async () => {
        await fetch('/search-connections?token=' + creator.token, {
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

    const changeHandler = e => {
        e.preventDefault();
        setSearchQ({...searchQ, query: e.target.value});
        console.log(searchQ);
        searchConnections();
    }

    const addAssignee = (email) => {
        if (!details.members.includes(email)) {    
            details.members.push(email);
        }
    }



    return (
        <div className='projectFormBox'>
            <Form className='projectForm' onSubmit={submitHandler} ref={formRef}>
                <Form.Group className="projectForm__inner" controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" name="name" id="name" onChange={e => setDetails({...details, title: e.target.value})} value={details.title}/>
                </Form.Group>

                <Form.Group className="projectForm__inner" controlId="formDesc">
                    <Form.Label>Description</Form.Label>
                    <Form.Control type="text" name="desc" id="desc" onChange={e => setDetails({...details, description: e.target.value})} value={details.description}/>
                </Form.Group>

                <Form.Group className="projectForm__inner">
                    <Form.Label>Members</Form.Label>
                    
                    <ListGroup>
                        {details.members.map((assgn, i) => {
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

                <Button type="submit" className="projectForm__button">
                    CREATE PROJECT 
                </Button>


            </Form>


        </div>
    )
}

export default NewProject