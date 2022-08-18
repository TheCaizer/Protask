from telnetlib import STATUS
#from requests import delete
from sqlalchemy import desc
from .models import *
from flask import Blueprint, jsonify, request, flash
import json
from datetime import date
from werkzeug.utils import secure_filename

from .models import *
from . import db

from backend.auth import *
from backend.task import *
from backend.test import *
from backend.project import *
from backend.skills import *
from backend.reccomendation import *

views = Blueprint('views', __name__)
auth = Blueprint('auth', __name__)


@views.route('/')
def home():
    return {}

@views.route('/main')
def app_main():
    return {}

@auth.route('/login', methods=['POST'])
def app_login():
    login_data = request.get_json()
    
    result = login(login_data['email'], login_data['password'])
    if ('error' in result):
        return jsonify(result)
    
    user = getUserID(result['user_id'])
    user['token'] = result['token']
    
    return jsonify(user)

@auth.route('/register', methods=['POST'])
def app_register():
    login_data = request.get_json()
    
    if(emailExist(login_data['email'])):
        flash('Email already in use',category='error')
        return jsonify({'error': 'Email already in use'})
    elif(len(login_data['email']) < 4):
        flash('Email too short',category='error')
        return jsonify({'error': 'Email too short'})
    elif(len(login_data['email']) > 150):
        flash('Email too long',category='error')
        return jsonify({'error': 'Email too long'})
    elif(len(login_data['firstName']) <= 0):
        flash('Need to input first name',category='error')
        return jsonify({'error': 'Need to input first name'})
    elif(len(login_data['firstName']) > 150):
        flash('First name too long',category='error')
        return jsonify({'error': 'First name too long'})
    elif(len(login_data['lastName']) <= 0):
        flash('Need to input last name',category='error')
        return jsonify({'error': 'Need to input last name'})
    elif(len(login_data['lastName']) > 150):
        flash('Last name too long',category='error')
        return jsonify({'error': 'Last name too long'})
    elif(len(login_data['password']) < 8):
        flash('Password needs to be at least 8 characters',category='error')
        return jsonify({'error': 'Password needs to be at least 8 characters'})
    elif (not any(x.isupper() for x in login_data['password'])):
        flash('Password must contain at least 1 uppercase character', category='error')
        return jsonify({'error': 'Password must contain at least 1 uppercase character'})
    elif (not any(x.islower() for x in login_data['password'])):
        flash('Password must contain at least 1 lowercase character', category='error')
        return jsonify({'error': 'Password must contain at least 1 lowercase character'})
    elif (not any(x.isdigit() for x in login_data['password'])):
        flash('Password must contain at least 1 number', category='error')
        return jsonify({'error': 'Password must contain at least 1 number'})
    elif(len(login_data['password']) > 150):
        flash('Password too long',category='error')
        return jsonify({'error': 'Password too long'})
    elif(login_data['password'] != login_data['password2']):
        flash('Passwords do not match',category='error')
        return jsonify({'error': 'Passwords do not match'})
    
    result = sign_up(login_data['firstName'], login_data['lastName'], login_data['password'], login_data['password2'], login_data['email'])
    addSkillsUserToken(result['token'], login_data['skills'])
    
    result['skills'] = login_data['skills']    
    
    return jsonify(result)

@auth.route('/logout')
def app_logout():
    data = request.args.get('token')
    logoff(data)
    
    return {}

@views.route('/notifications', methods=['GET'])
def app_notifs():
    token = request.args.get('token')
    user_id = decode_token(token)
    user = getUserID(user_id['user_id'])
    
    friendReq = viewFriendRequests(user['email'])
    
    dictReqs = []
    for i in friendReq:
        dictReqs.append(getUser(i))
    
    return jsonify({"notifs": dictReqs})

@views.route('/accept-req', methods=['POST', 'GET'])
def app_accept_req(): 
    token = request.args.get('token')
    target = request.get_json()
    user_id = decode_token(token)
    user = getUserID(user_id['user_id'])
    
    newNotifs = accept_request(user['email'], target['email'])
    
    return {}
   
@views.route('/reject-req', methods=['POST', 'GET'])
def app_reject_req(): 
    token = request.args.get('token')
    target = request.get_json()
    user_id = decode_token(token)
    user = getUserID(user_id['user_id'])
    
    newNotifs = rejectFriendReq(user['email'], target['email'])  
    
    return {}

@views.route('/add-connection', methods=['POST', 'GET'])
def app_add_con():
    token = request.args.get('token')
    target = request.get_json() 
    user_id = decode_token(token)
    user = getUserID(user_id['user_id'])
    
    send_request(user['email'], target['email']) 
    
    return {}
    
@views.route('forgot-password', methods=['POST'])
def app_pword_recover():
    target = request.get_json()
    
    retrieve_password(target['email'])
    
    return {}

@views.route('change-password', methods=['GET', 'POST'])
def app_pword_change():
    details = request.get_json()
    token = request.args.get('token')
    user_id = decode_token(token)
    user = getUserID(user_id['user_id'])
    
    if(len(details['new_pw']) < 8):
        flash('Password needs to be at least 8 characters',category='error')
        return jsonify({'error': 'Password needs to be at least 8 characters'})
    elif (not any(x.isupper() for x in details['new_pw'])):
        flash('Password must contain at least 1 uppercase character', category='error')
        return jsonify({'error': 'Password must contain at least 1 uppercase character'})
    elif (not any(x.islower() for x in details['new_pw'])):
        flash('Password must contain at least 1 lowercase character', category='error')
        return jsonify({'error': 'Password must contain at least 1 lowercase character'})
    elif (not any(x.isdigit() for x in details['new_pw'])):
        flash('Password must contain at least 1 number', category='error')
        return jsonify({'error': 'Password must contain at least 1 number'})
    elif(len(details['new_pw']) > 150):
        flash('Password too long',category='error')
        return jsonify({'error': 'Password too long'})
    
    
    result = change_password(user['email'], details['old_pw'], details['new_pw'])
    
    if (result == -1 or result == 0):
        return jsonify({'error': 'Invalid Password'})
    
    return jsonify({'res': result})

@views.route('/myprofile', methods=['GET']) 
def app_my_profile():
    token = request.args.get('token')
    user_id = decode_token(token)
    user = getUserID(user_id['user_id'])
    
    return jsonify({"user": user})

@views.route('/connections', methods=['GET'])
def app_connections(): 
    token = request.args.get('token')
    user_id = decode_token(token)
    user = getUserID(user_id['user_id'])
    connections = viewFriends(user['email'])
    dictConnections = []
    for i in connections:
        dictConnections.append(getUser(i))
    return jsonify({"connections": dictConnections})

@views.route('/create-task', methods=['POST', 'GET'])
def app_create_task():
    details = request.get_json()
    token = request.args.get('token')
    
    if (details['dueDate'] != ''):
        dateConv = datetime.datetime.strptime(details['dueDate'], '%Y-%m-%d')
        id = createTask(token, details['name'], details['description'], details['assignees'], dateConv, public=details['public'])
    else:
        id = createTask(token, details['name'], details['description'], details['assignees'], deadline=None, public=details['public'])
    
    if (id is dict):
        return jsonify(id)
    
    addSkillsTaskToken(token, id, details['skills'])
    
    return jsonify({'task_id': id})

@views.route('/edit-task', methods=['POST', 'GET'])
def app_edit_task():
    details = request.get_json()
    token = request.args.get('token')
    
    if (details['assignees'] != []):
        assignTask(token, details['id'], details['assignees'])
    
    if (details['name'] == ''):
        name = None
    else: 
        name = details['name']
    
    if (details['description'] == ''):
        description = None
    else: 
        description = details['description']
        
    if (details['dueDate'] == ''):
        id = editTask(token, details['id'], name, description, deadline=None, public=details['public'])
    else: 
        dateConv = datetime.datetime.strptime(details['dueDate'], '%Y-%m-%d')
        id = editTask(token, details['id'], name, description, dateConv, public=details['public'])
        
    if (details['skills'] != []):
        addSkillsTaskToken(token, details['id'], details['skills'])
        
    
    return jsonify({'task_id': id})

@views.route('/createdTasks', methods=['GET'])
def app_created_task():
    token = request.args.get('token')
    
    taskList = getCreatedTask(token)
    
    for i in taskList:
        skills = viewSkillsTask(i['id'])
        i['skills'] = skills
    
    return jsonify({'tasks': taskList})
    
@views.route('/change-status', methods=['POST', 'GET'])
def app_change_status():
    details = request.get_json()
    token = request.args.get('token')
    
    if (details['projectID'] == None):
        id = changeTaskStatusCheck(token, details['taskID'], details['newStatus']) 
    else:        
        u = decode_token(token)
        user = getUserID(u['user_id'])
        proj = getProjectInfo(details['projectID'])
        
        if (proj['creatorEmail'] == user['email']):
            id = changeProjectTaskStatus(details['projectID'], details['taskID'], token, details['newStatus'])
        else:
            id = changeTaskStatusCheck(token, details['taskID'], details['newStatus'])    
    
    task = getTaskfromID(id)
    
    if (details['newStatus'] == 2):
        if (task['creatorEmail'] == user['email']):
            changeTaskStatusCheck(token, id, -2) 
        
        if (details['projectID'] == None):
            completeTaskNotification(token, id)   
        else:
            sendTaskCompleteProject(details['projectID'], id)
        

    return jsonify(task)

    
@views.route('/assignedTasks', methods=['GET'])
def app_assigned_task():
    token = request.args.get('token')
    
    taskList = getAssignedTask(token)
    
    for i in taskList:
        skills = viewSkillsTask(i['id'])
        i['skills'] = skills
    
    tasks = []
    tasks.append({"id": 2, "creatorEmail": 'jon@mail.com', "title": 'task1', "status" : 0, "description": 'desc1',"assginees": ['guy2@mail.com', 'mail@mail.com'], "deadline": date(2022, 7, 25)})
    tasks.append({"id": 3, "creatorEmail": 'jon@mail.com', "title": 'task2', "status" : 0, "description": 'desc2',"assginees": ['guy3@mail.com', 'mail@mail.com'], "deadline": date(2022, 7, 24)})
    tasks.append({"id": 4, "creatorEmail": 'jon@mail.com', "title": 'task3', "status" : 0, "description": 'desc3',"assginees": ['guy4@mail.com', 'mail@mail.com'], "deadline": date(2022, 7, 24)})
    tasks.append({"id": 1, "creatorEmail": 'jon@mail.com', "title": 'task', "status" : 0, "description": 'desc4',"assginees": ['guy@mail.com', 'mail@mail.com'], "deadline": date(2022, 7, 22)})
        
    return jsonify({'tasks': taskList})
    
@views.route('/approve-complete', methods=['GET', 'POST'])
def app_approve_compete(): 
    token = request.args.get('token')
    details = request.get_json()
    
    removeNotification(details['notificationID'])
    changeTaskStatusCheck(token, details['id'], -2)
    
    return {}
    
@views.route('/deny-complete', methods=['GET', 'POST'])
def app_deny_complete(): 
    token = request.args.get('token')
    details = request.get_json()
    
    changeTaskStatusCheck(token, details['id'], 1)
    removeNotification(details['notificationID'])
    
    return {}   

@views.route('/taskNotifications', methods=['GET'])
def app_task_notifs():
    token = request.args.get('token')
    
    notifications = viewNotification(token)
    
    notifList = []
    
    for i in notifications:
        if (i['taskID'] != None):
            task = getTask(i['taskID'])
            notifObj = i
            notifObj.update(task)
            
            if (i['projectID'] != None):
                proj = getProjectInfo(i['projectID'])
                if (type(proj) is dict):
                    notifObj.update(proj)
        
            notifList.append(notifObj)
                          
    
    return jsonify({'notifs': notifList})                 

@views.route('/mark-notification-read', methods=['GET', 'POST'])
def app_mark_read_notif(): 
    token = request.args.get('token')
    details = request.get_json()
    
    removeNotification(details['notificationID'])
    return {}

@views.route('/search-connections', methods=['GET', 'POST'])
def app_conns_search():
    token = request.args.get('token')
    query = request.get_json()
    
    res = searchTaskMasterName(token, query['query'])
    results = []
    
    if (type(res) == list):
        for i in res:
            results.append(getUserID(i))       
    
    return jsonify({'result': results})
    
@views.route('/connectionTasks', methods=['GET'])
def app_conns_tasks():
    token = request.args.get('token')
    email = request.args.get('email')
    
    tasks = getConnectionTask(token, email)
    
    for i in tasks:
        skills = viewSkillsTask(i['id'])
        i['skills'] = skills
    
    return jsonify({'tasks': tasks})
    
@views.route('/busyFactor', methods=['GET'])
def app_busy_factor():
    email = request.args.get('email')
    
    bFac = busyFactor(email)
    
    return jsonify({'busyFactor': bFac})

@views.route('/created-search', methods=['GET', 'POST'])
def app_created_search():
    token = request.args.get('token')
    query = request.get_json()
    
    res = searchCreatedTaskSorted(token, query['query'], query['query'], query['query'], query['query'])
    
    if (type(res) == list):
        for i in res:
            skills = viewSkillsTask(i['task']['id'])
            i['task']['skills'] = skills
    
    return jsonify({'result': res})

@views.route('/assigned-search', methods=['GET', 'POST'])
def app_assigned_search():
    token = request.args.get('token')
    id = decode_token(token)
    
    user = getUserID(id["user_id"])
    
    query = request.get_json()
    
    res = searchAssignedTaskSorted(user['email'], query['query'], query['query'], query['query'], query['query'])
    
    if (type(res) == list):
        for i in res:
            skills = viewSkillsTask(i['task']['id'])
            i['task']['skills'] = skills
    
    return jsonify({'result': res})
    
@views.route('/projects', methods=['GET'])
def app_projects():
    token = request.args.get('token')
    u = decode_token(token)
    user = getUserID(u['user_id'])
    
    projectIds_a = viewCreatedProjects(user['email'])
    projectIds_b = viewAssignedProjects(user['email'])
    projectList = []
    
    for i in projectIds_a:
        proj = getProjectInfo(i)
        projectList.append(proj)
    
    for i in projectIds_b:
        proj = getProjectInfo(i)
        projectList.append(proj)
    
    
    for i in projectList:
        taskList = []
        for j in i['projectTasks']:
            task = getTask(j)
            taskList.append(task)
        i['projectTasks'] = taskList
    
    return jsonify({'projects': projectList})

@views.route('/myprojects', methods=['GET'])
def app_my_projects():
    token = request.args.get('token')
    u = decode_token(token)
    user = getUserID(u['user_id'])
    
    projectIds_a = viewCreatedProjects(user['email'])
    
    projectList = []
    
    for i in projectIds_a:
        proj = getProjectInfo(i)
        projectList.append(proj)
        
    return jsonify({'projects': projectList})

@views.route('/create-project', methods=['GET', 'POST'])
def app_create_project():
    token = request.args.get('token')
    details = request.get_json()
    
    project_id = createProject(token, details['title'], details['description'], details['members'])
    
    return jsonify({'project_id': project_id})

@views.route('/project-createTask', methods=['GET', 'POST'])
def app_project_createTask():
    token = request.args.get('token')  
    details = request.get_json() 
    
    if (details['dueDate'] != ''):
        dateConv = datetime.datetime.strptime(details['dueDate'], '%Y-%m-%d')
        id = addNewTasktoProject(details['projectID'], token, details['name'], details['description'], details['assignees'], dateConv)
    else:
        id = addNewTasktoProject(details['projectID'], token, details['name'], details['description'], details['assignees'], deadline=None) 
    
    if (id is dict):
        return jsonify(id)
    
    addSkillsTaskToken(token, id, details['skills'])
    assignTaskNotification(token, id) 
    return jsonify({'task_id': id})  

@views.route('/project-addNewMember', methods=['GET', 'POST'])
def app_project_addMember():
    token = request.args.get('token')    
    details = request.get_json()
    
    res = addMemToProject(details['projectID'], token, [details['email']])
    
    return jsonify({'success': res})

@views.route('/delete-task', methods=['GET', 'POST'])
def app_del_task():
    token = request.args.get('token')
    details = request.get_json()
    
    res = deleteTask(details['id'])
    
    return jsonify({'result': res})
    
@views.route('/pastCreatedTasks', methods=['GET'])
def app_past_cr_task():
    token = request.args.get('token')
    
    result = getPastTaskToken(token)
    
    taskList = []
    for i in result:
        t = getTaskfromID(i)
        taskList.append(t)

    return jsonify({'tasks': taskList})

@views.route('/pastAssignedTasks', methods=['GET'])
def app_past_as_task():
    token = request.args.get('token')
    
    result = getPastAssTaskToken(token)
    
    taskList = []
    for i in result:
        t = getTaskfromID(i)
        taskList.append(t)

    return jsonify({'tasks': taskList})

@views.route('/publicTasks', methods=['GET'])
def app_pub_tasks():
    token = request.args.get('token')
    projID = request.args.get('projectID')

    if (projID == 'undefined'):
        res = getPublicTaskToken(token)
    else: 
        res = getPublicTaskProjectToken(token, int(projID))
    
    taskList = []
    
    for i in res:
        t = getTaskfromID(i['taskID'])
        taskList.append(t)
        
    for i in taskList:
        skills = viewSkillsTask(i['id'])
        i['skills'] = skills
    
    return jsonify({'tasks': taskList})

@views.route('/delete-project', methods=['POST', 'GET'])
def app_del_proj():
    token = request.args.get('token')
    details = request.get_json()
    
    res = deleteProject(details['id'])

    return jsonify({'success': res})

@views.route('/findConnection', methods=['GET'])
def app_find_connection():
    token = request.args.get('token')
    
    return {}

@views.route('/add-skill', methods=['POST', 'GET'])
def app_add_skill():
    token = request.args.get('token')
    details = request.get_json()
    
    addSkillsUserToken(token, [details['skill']])
    
    return {}
    
@views.route('/get-user', methods=['GET'])
def app_get_u():
    token = request.args.get('token')
    
    u = decode_token(token)
    
    user = getUserID(u['user_id'])
    
    return jsonify({'info': user})
    

@views.route('/create-post', methods=['GET', 'POST'])
def app_create_post():
    token = request.args.get('token')
    details = request.get_json()
    
    addFindConnectionToken(token, details['description'], details['skills'])
    
    return {}

@views.route('/allPosts', methods=['GET'])
def app_all_posts():
    token = request.args.get('token')
    
    posts = findConnectionToken(token)
    
    return jsonify({'posts': posts})

@views.route('/myPosts', methods=["GET"])
def app_my_posts():
    token = request.args.get('token')
    
    posts = findMyConnectionPostToken(token)
    
    return jsonify({'posts': posts})

@views.route('/delete-post', methods=['GET', 'POST'])
def app_del_post():
    token = request.args.get('token')
    details = request.get_json()
    
    res = deleteFindConnectionToken(token, details['id'])
    
    return jsonify({'result': res})

@views.route('/connectionRecs', methods=['GET'])
def app_conn_rec():
    token = request.args.get('token')
    
    result = freindReccomendation(token)
    
    recs = []
    
    for i in result:
        u = getUserID(i['id'])
        u['mutuals'] = i['mutuals']
        recs.append(u)
    
    return jsonify({'recs': recs})

@views.route('/pastDue', methods=['GET'])
def app_past_due():
    token = request.args.get('token')
    
    expired = getDueList(token)
    if (len(expired) > 0):            
        dueNotifiction(token)
        tasks = []
        for i in expired:
            t = getTaskfromID(i)
            skills = viewSkillsTask(i)
            t['skills'] = skills
            tasks.append(t)
        
        return jsonify({'tasks': tasks})
    else:
        return jsonify({'tasks': []})
    
@views.route('/project-promoteMember', methods=['GET', 'POST'])
def app_proj_promote_mem():
    token = request.args.get('token')
    details = request.get_json()
    
    target = getUser(details['email'])
    
    res = promoteProjectManagerToken(token, target['id'], details['projectID']) 
    
    return jsonify({'success': res})       
    
@views.route('/project-search', methods=['GET', 'POST'])
def app_proj_search():
    token = request.args.get('token')
    details = request.get_json()
    
    result = searchProjectMemberToken(token, details['projectID'], details['query'])
    
    mems = []
    if (type(result) == list):    
        for i in result:
            u = getUser(i)
            mems.append(u)
    
    return jsonify({'result': mems})
    
@views.route('/numNotifs', methods=['GET'])
def app_num_notif():
    token = request.args.get('token')
    
    user_id = decode_token(token)
    user = getUserID(user_id['user_id'])
    
    friendReq = viewFriendRequests(user['email'])
    taskNotif = viewNotification(token)
    
    length = len(friendReq) + len(taskNotif)
    
    return jsonify({'num': length})

@views.route('/req-task', methods=['GET', 'POST'])
def app_req_task():
    token = request.args.get('token')
    details = request.get_json()
    
    task = details['task']
    
    user_id = decode_token(token)
    user = getUserID(user_id['user_id'])
    
    id = addAssignee(task['id'], [user['email']])
    
    return jsonify({'task_id': id})

@views.route('/change-picture', methods=['GET', 'POST'])
def app_change_pic():
    token = request.args.get('token')
    file = request.files['file']

    res = changeProfilePictureToken(token, file)
    
    return jsonify({'result': res})
    
    