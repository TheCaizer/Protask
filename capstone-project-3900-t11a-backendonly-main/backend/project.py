from base64 import decode
import datetime
from flask import flash
from server.models import *
from backend.auth import *

# Description: user creates a new project with title, description and memebers
# Arguments: token(string), title(string), description(string), members(list[emails])
# Returns: Project ID
# returns None if failcreating project
def createProject(token, title, description, members):
    user = decode_token(token)
    userID = user["user_id"]
    user_info = getUserID(userID)
    
    u_email = user_info['email']
    u_friends = viewFriends(u_email)
    if title == None:
        flash("Please enter the project title.", category='error')
    elif description == None:
        flash("Please enter the project description", category='error')
    else:
        no_error = True
        for email in members:
            if email not in u_friends:
                no_error = False
                flash(email + " is not your friend. Please send the friend request first.", category='error')
        if no_error:
            projectID = addProject(u_email, title, description, members)
            for m_email in members:
                member = User.query.filter_by(email = m_email).first()
                m_id = member.id
                sendAddedToProject(m_id, projectID)
            return projectID
        
    return

# Description: project creator adds new member to project
# Arguments: projectID(int), token(string),  members(list[emails])
# Returns: 1 if add members successfully
#          None if fail adding members
def addMemToProject(projectID, token, members):
    # check creator
    # add new members
    user = decode_token(token)
    userID = user["user_id"]
    user_info = getUserID(userID)
    
    u_email = user_info['email']
    u_friends = viewFriends(u_email)
    
    no_error = True
    for email in members:
        if email not in u_friends:
            no_error = False
            flash(email + " is not your friend. Please send the friend request first.", category='error')
    if no_error:
        addUserToProject(projectID, members)
        for m_email in members:
            member = User.query.filter_by(email = m_email).first()
            m_id = member.id
            sendAddedToProject(m_id, projectID)
        return 1
    return

# Description: add a new task into a project
# Arguments: projectID(int), creatorToken(string), title(string), description(string), emails(list[emails])
# Returns: taskID
#          None if fail crearing new task in project
def addNewTasktoProject(projectID, creatorToken, title, description, emails, deadline = None, public = False):
    # can assign to all the members in the project
    user = decode_token(creatorToken)
    userID = user["user_id"]
    user_info = getUserID(userID)

    u_email = user_info['email']
    project = getProjectInfo(projectID)
    creator = project['creatorEmail']
    members = project['listofMembers']
    
    if title == None:
        return {'error': "Please enter the task title."}
    elif description == None:
        return {'error': "Please enter the task description"}
    elif emails == []:
        if u_email not in members and u_email not in creator:
            flash("Only users in the project can create tasks in the project", category='error')
        else:
            taskID = newTask(u_email, title, description, [u_email], deadline, projectID, public)
            addTaskToProject(projectID, taskID)
            sendCreateTaskProjectNotif(projectID, taskID)
            return taskID
    else:
        error = checkMembers(creator, members, emails)
        if error == None:
            taskID = newTask(u_email, title, description, emails, deadline, projectID, public)
            addTaskToProject(projectID, taskID)
            sendCreateTaskProjectNotif(projectID, taskID)
            
            for a_email in emails:
                addNotification(a_email, taskID, 0, projectID)
                
            return taskID
        else:
            return {'error': error + " is not in the project. Please add the user into the project first."}
      
    return

# Description: add a new assign into a project task
# Arguments: projectID(int), creatorToken(string), taskID(int),  assignee(string)
# Returns: taskID
#          None if fail crearing new task in project
def assignToTaskProject(projectID, creatorToken, taskID, assigne):
    # assigne is a list of emails (string ) if only one email just do list with 1 element
    user = decode_token(creatorToken)
    userID = user["user_id"]
    user_info = getUserID(userID)

    u_email = user_info['email']
    project = getProjectInfo(projectID)
    creator = project['creatorEmail']
    members = project['listofMembers']

    error = checkMembers(creator, members, assigne)
    if error == None:
        taskID = addAssignee(taskID, assigne)
        for a_email in assigne:
            addNotification(a_email, taskID, 0)
        flash("Assign task successfully.", category = 'success')
        return 1
    else:
        return {'error': error + " is not in the project. Please add the user into the project first."}
    return 0

# Description: Check if the assigne is a project member
# Arguments: creator(email), members(list[emails]), assigne(list[emails])
# Returns: None if no error
#          email if the email is not a project member
def checkMembers(creator, members, assigne):
    for a_email in assigne:
        if a_email not in members and  a_email not in creator:
            return a_email
    return

# Description: sends a notification that a task was created to the project creator
# Arguments: projectID(int), taskID(int)
# Returns: 1 if successful and 0 if no project to projectID
def sendCreateTaskProjectNotif(projectID, taskID):
    project = getProjectInfo(projectID)
    if project == None:
        return 0
    projectCreator = project["creatorEmail"]
    for i in projectCreator:
        addNotification(i, taskID, 2, projectID)
    return 1

# Description: sends a notification to userID that they have been added to project
# Arguments: userID(int), projectID(int)
# Returns: notificationID if successful and 0 if no user to userID
def sendAddedToProject(userID, projectID):
    user = getUserID(userID)
    if user == None:
        return 0
    notif = addNotification(user["email"], None, 3, projectID)
    return notif

# Description: sends a notification to project creator that task has been marked
# as completed
# Arguments: projectID(int), taskID(int)
# Returns: 1 if successful and 0 if no project to projectID
def sendTaskCompleteProject(projectID, taskID):
    project = getProjectInfo(projectID)
    if project == None:
        return 0
    projectCreator = project["creatorEmail"]
    for i in projectCreator:
        addNotification(i, taskID, 4, projectID)
    return 1

# Description: project creator is able to change the status of the task in his
# own project
# Arguments: projectID(int), taskID(int), token(string), status(int)
# Returns: 0 if any invalid id or invalid staus change, -1 if no permission 
# to change status and taskID if it chagnes successfully
def changeProjectTaskStatus(projectID, taskID, token, status):
    project = getProjectInfo(projectID)
    task = getTaskfromID(taskID)
    userID = decode_token(token)
    if(project is None or task is None or userID is None):
        return 0
    user = getUserID(userID["user_id"])
    if project["creatorEmail"] != user["email"] or taskInProject(taskID) != projectID:
        return -1
    # not started -> in progress
    if(task["status"] == 0 and status == 1):
        changeTaskStatus(taskID, status)
        return taskID
    # in progress -> completed
    elif(task["status"] == 1 and status == 2):
        changeTaskStatus(taskID, status)
        return taskID
    # not started or in progress -> blocked
    elif((task["status"] == 1 or task["status"] == 0) and status == -1):
        changeTaskStatus(taskID, status)
        return taskID
    # blocked -> not started or in progress
    elif((task["status"] == -1) and (status == 1 or status == 0)):
        changeTaskStatus(taskID, status)
        return taskID
    else:
        return 0

# Description: search members in the project
# Arguments: token(string), projectID(int), search(string)
# Returns: the list of email if the string match 
#          None otherwise
def searchProjectMemberToken(token, projectID, search):
    user = decode_token(token)
    u_email = getUserID(user['user_id'])['email']
    
    project_info = getProjectInfo(projectID)
    members = project_info['listofMembers']
    creator = project_info['creatorEmail']
    # check user in project
    if u_email in members or u_email in creator:
        return searchProjectMember(projectID, search)
    return

