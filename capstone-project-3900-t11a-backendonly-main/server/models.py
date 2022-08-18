from enum import unique
from lib2to3.pgen2 import token
from pickletools import read_unicodestring1

from flask import session
from . import db
from datetime import date
from flask_sqlalchemy import SQLAlchemy

class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(150), unique = True)
    firstName = db.Column(db.String(150))
    lastName = db.Column(db.String(150))
    password = db.Column(db.String(150))
    token = db.Column(db.String(200), unique = True)
    profilePic =  db.Column(db.String(1000))

class Friends(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    requesterID = db.Column(db.Integer, db.ForeignKey('user.id'))
    addresseeID = db.Column(db.Integer, db.ForeignKey('user.id'))
    status = db.Column(db.Integer)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    creatorEmail = db.Column(db.String(150), db.ForeignKey('user.email'))
    title =  db.Column(db.String(150))
    description = db.Column(db.String(1000))
    deadline = db.Column(db.Date)
    status = db.Column(db.Integer)
    projectID = db.Column(db.Integer, db.ForeignKey('project.id'), nullable = True) 
    public =  db.Column(db.Boolean, default=False)

class assTasks(db.Model):
    email = db.Column(db.String(150), db.ForeignKey('user.email'), primary_key = True)
    taskID = db.Column(db.Integer, db.ForeignKey('task.id'), primary_key = True)

class Notifications(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    taskID = db.Column(db.Integer, db.ForeignKey('task.id'))
    userID = db.Column(db.Integer, db.ForeignKey('user.id'))
    Ntype = db.Column(db.Integer)
    projectID = db.Column(db.Integer, db.ForeignKey('project.id'), nullable = True)  

class Project(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    title =  db.Column(db.String(150))
    description = db.Column(db.String(1000))

class projectMembers(db.Model):
    email = db.Column(db.String(150), db.ForeignKey('user.email'), primary_key = True)
    projectID = db.Column(db.Integer, db.ForeignKey('project.id'), primary_key = True)  

class UserSkills(db.Model):
    skillName = db.Column(db.String(150), primary_key = True)
    email = db.Column(db.String(150), db.ForeignKey('user.email'), primary_key = True)

class TaskSkills(db.Model):
    skillName = db.Column(db.String(150), primary_key = True)
    taskID = db.Column(db.Integer, db.ForeignKey('task.id'), primary_key = True)

class projectManager(db.Model):
    email = db.Column(db.Integer, db.ForeignKey('user.email'), primary_key = True)
    projID = db.Column(db.Integer, db.ForeignKey('project.id'),  primary_key = True)

class friendAd(db.Model):
    __tablename__ = 'friendnotif'
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.Integer, db.ForeignKey('user.email'))
    description = db.Column(db.String(1000))

class friendAdSkills(db.Model):
    skillName = db.Column(db.String(150), primary_key = True)
    friendAdID = db.Column(db.Integer, db.ForeignKey('friendnotif.id'), primary_key = True)

# Description: Adds a Token to the database refering to the user
# Arguments: user, token
# Returns: 1 is successfull
def addToken(user, token):
    user.token = token
    db.session.commit()
    return 1

# Description: Removes a Token to the database refering to the user
# Arguments: token
# Returns: 1 is successfull else return 0
def removeToken(token):
    user = User.query.filter_by(token=token).first()
    if user:
        user.token = None
        db.session.commit()
        return 1
    return 0

# Description: Stores user in database, (please check if email already exists before adding it to database as otherwise function will fail)
# Arguments: first_name(string[150]), last_name(string[150]), password(string[150]) and email(string[150])
# Returns: 1 is successfull
def addUser(first_name, last_name, password, email):
    new_user = User(email = email, firstName = first_name, lastName = last_name, password = password)
    db.session.add(new_user)
    db.session.commit()
    return {"firstName": new_user.firstName, "lastName": new_user.lastName, "email": new_user.email, "id" : new_user.id}

# Description: Gets ID to USer
# Arguments: ID
# Returns: if successfull returns  first_name(string[150]), last_name(string[150]) and email(string[150])
# If function fails (due to email not existing function will return 0)
def getUserID(userIDA):
    user = User.query.filter_by(id = userIDA).first()
    if(user == None):
        return 0
    else:
        skillList = UserSkills.query.filter_by(email = user.email)
        skills = []
        for elem in skillList:
            skills.append(elem.skillName)
        return {"firstName": user.firstName, "lastName":user.lastName, "email":user.email, "id" : user.id, "skills": skills, "profilePic": user.profilePic}


# Description: Gets important user information from email
# Arguments: email address (string)
# Returns: if successfull returns  first_name(string[150]), last_name(string[150]) and email(string[150])
# If function fails (due to email not existing function will return 0)
def getUser(emailA):
    user = User.query.filter_by(email = emailA).first()
    if(user == None):
        return 0
    else:
        skillList = UserSkills.query.filter_by(email = user.email)
        skills = []
        for elem in skillList:
            skills.append(elem.skillName)
        return {"firstName": user.firstName, "lastName":user.lastName, "email":user.email, "id":user.id, "skills": skills, "profilePic" : user.profilePic}


# Description: Changes password of a user
# Arguments: email(string[150]) and newPassword(string[150])
# Returns: 1 is successfull, returns 0 if user does not exist
def changePassword(emailA, newPW):
    user = User.query.filter_by(email = emailA).first()
    if(user == None):
        return 0
    else:
        user.password = newPW
        db.session.commit()
        return 1

# Description: Gets password of user
# Arguments: email(string[150])
# Returns: 1 is successfull, returns 0 if user does not exist
def getPW(emailA):
    user = User.query.filter_by(email = emailA).first()
    if(user == None):
        return 0
    else:
        return {"password": user.password}

# Description: Sends a friend request from one user to another
# Arguments: email_of_sender(string[150]) email_of_reciever(string[150])
# first argument is sender email
#second argument is reciever email
# Returns: 1 is successfull, returns 0 if either user does not exist
def SendFriendReq(emailA, emailB):
    userA = User.query.filter_by(email = emailA).first()
    userB = User.query.filter_by(email = emailB).first()
    if(userA == None):
        return 0
    if(userB == None):
        return 0
    newFriendA = Friends(requesterID = userA.id, addresseeID = userB.id, status = 0)
    db.session.add(newFriendA)
    db.session.commit()
    return 0


# Description: Views friend requests of user
# Arguments: email(string[150])
# Returns: returns a list of email addresses (string[150]) or an empty list
# returns 0 if user does not exist
def viewFriendRequests(emailA):
    user = User.query.filter_by(email = emailA).first()
    if(user == None):
        return 0
    else:
        req = Friends.query.filter_by(addresseeID = user.id, status = 0)
        friendReqList = []
        for friendReq in req:
            friendReqList.append(User.query.filter_by(id = friendReq.requesterID).first().email)
        return friendReqList

# Description: Accept friend request from user
# Arguments: email_of_user(string[150]) email_of_friend(string[150])
# first argument is user email
# second argument is friend email
# Returns: updated friend request list
def acceptFriendRequest(emailA, emailB):
    user1 = User.query.filter_by(email = emailA).first()
    if(user1 == None):
        return viewFriendRequests(emailA)
    
    user2 = User.query.filter_by(email = emailB).first()
    if(user2 == None):
        return viewFriendRequests(emailA)
    
    friendReq = Friends.query.filter_by(addresseeID = user1.id, requesterID = user2.id, status = 0).first()
    if(friendReq == None):
        return viewFriendRequests(emailA)
    else:
        friendReq.status = 1
        db.session.commit()
        return viewFriendRequests(emailA)

# Description: Views friends of user
# Arguments: email(string[150])
# Returns: returns a list of email addresses (string[150]) or an empty list
# returns 0 if user does not exist
def viewFriends(emailA):
    user = User.query.filter_by(email = emailA).first()
    if(user == None):
        return 0
    else:
        friendList = Friends.query.filter_by(addresseeID = user.id, status = 1)
        friendReqList = []
        for cur in friendList:
            friendReqList.append(User.query.filter_by(id = cur.requesterID).first().email)
        friendList = Friends.query.filter_by(requesterID = user.id, status = 1)
        for cur in friendList:
            friendReqList.append(User.query.filter_by(id = cur.addresseeID).first().email)
        return friendReqList

# Description: Reject Friend Request
# first argument is user email
# second argument is friend email
# Returns: updated friend request list
def rejectFriendReq(emailA, emailB):
    user1 = User.query.filter_by(email = emailA).first()
    if(user1 == None):
        return viewFriendRequests(emailA)
    user2 = User.query.filter_by(email = emailB).first()
    if(user2 == None):
        return viewFriendRequests(emailA) 
    friendReq = Friends.query.filter_by(addresseeID = user1.id, requesterID = user2.id, status = 0).first()
    if(friendReq == None):
        return viewFriendRequests(emailA)
    else:
        db.session.delete(friendReq)
        db.session.commit()
        return viewFriendRequests(emailA)


# Description: Checks to see if email exists
# Arguments: email(string[150])
# Returns: returns 0 if user dosen't exist 
# returns 1 if user exists
def emailExist(emailA):
    user = User.query.filter_by(email = emailA).first()
    if(user == None):
        return 0
    else:
        return 1

# Description: Creats a new Task
# Arguments: creatorEmail (string[150]) ,title (string), description (string), emailAssign ([string]), deadline (date)
# Returns: returns -1 if user dosen't exist 
# returns taskID if successful 
# FIXED new task includes optional projectID 
def newTask(creatorEmail ,title, description, emailAssign, deadline = None, projectID = None, public = False):
    user = User.query.filter_by(email = creatorEmail).first()
    if(user == None):
        return -1
    new_Task = Task(creatorEmail = creatorEmail, title = title, deadline = deadline, description = description, status = 0, projectID = projectID, public = public)
    db.session.add(new_Task)
    for email in emailAssign:
        user = User.query.filter_by(email = email).first()
        if(user == None):
            return -1
        new_task_ass = assTasks(email = email, taskID = new_Task.id)
        db.session.add(new_task_ass)
    db.session.commit()
    return new_Task.id

# Description: Add an user to a task as an assignee using their email
# Arguments: taskID(int), emailAssign(string[150]) 
# Returns: returns -1 if user dosen't exist 
# returns the taskID if we successfully added the user to the task
def addAssignee(taskID, emailAssign):
    for email in emailAssign:
        user = User.query.filter_by(email = email).first()
        if(user == None):
            return -1
        new_task_ass = assTasks(email = email, taskID = taskID)
        db.session.add(new_task_ass)
    db.session.commit()
    return taskID

# Description: edit an existing task with new title, description, deadline 
# or a combination of the three
# Arguments: taskID(int),title(string), description(string), deadline(datetime object)
# Returns: returns -1 if task dosen't exist 
# returns the taskID if we successfully edited the task
def editTaskData(taskID, title = None, description = None, deadline = None, public = False):
    curTask = Task.query.filter_by(id = taskID).first()
    if(curTask == None):
        return -1
    if(title != None):
        curTask.title = title
    if(description != None):
        curTask.description = description
    if(deadline != None):
        curTask.deadline = deadline
    if(curTask.public != public):
        curTask.public = public
    db.session.commit()
    return taskID

# Description: gets the assigned task of a user using their email
# Arguments: email(string[150]) 
# Returns: returns 0 if user dosen't exist 
# returns a list of task assigned to the user
def getAssTasks(email):
    user = User.query.filter_by(email = email).first()
    if(user == None):
        return 0
    else:
        taskList = db.session.query(assTasks).join(Task).filter(assTasks.taskID == Task.id).filter(assTasks.email == user.email).filter(Task.status != -2)
        listofTaskID = []
        for cur in taskList:
            listofTaskID.append(cur.taskID)
    return listofTaskID

# Description: gets a list of task craeted by a user using email
# Arguments: email(string[150]) 
# Returns: returns 0 if user dosen't exist 
# returns a list of task created to the user
def getCreatedTasks(email):
    user = User.query.filter_by(email = email).first()
    if(user == None):
        return 0
    else:
        taskList = Task.query.filter(Task.creatorEmail == email).filter(Task.status != -2)
        listofTaskID = []
        for cur in taskList:
            listofTaskID.append(cur.id)
    return listofTaskID

# Description: searchs a users assigned task given parameters
# Arguments: email(string[150]), taskID(int), title(string), description(string),
# deadline(datetime object)
# Returns: returns 0 if user dosen't exist 
# returns a list of taskID that matches any of the parameter
def searchAssTasks(email, taskID = None, title = None, description = None, deadline = None):
#FIXED use the upper or lower function to transform so its not cap sensitive 
    user = User.query.filter_by(email = email).first()
    if(user == None):
        return 0
    taskList = []
    if(taskID != None):
        tempList = db.session.query(assTasks).join(Task).filter(assTasks.taskID == Task.id).filter(Task.id.like("%"+taskID+"%")).filter(assTasks.email == email).filter(Task.status != -2)
        for curTask in tempList:
            taskList.append(curTask.taskID)
    if(title != None):
        tempList =  db.session.query(assTasks).join(Task).filter(assTasks.taskID == Task.id).filter(Task.title.like("%"+title+"%")).filter(assTasks.email == email).filter(Task.status != -2)
        for curTask in tempList:
            if(curTask.taskID not in taskList):
                taskList.append(curTask.taskID)    
    if(description != None):
        tempList = db.session.query(assTasks).join(Task).filter(assTasks.taskID == Task.id).filter(Task.description.like("%"+description+"%")).filter(assTasks.email == email).filter(Task.status != -2)
        for curTask in tempList:
            if(curTask.taskID not in taskList):
                taskList.append(curTask.taskID)    
    if(deadline != None):
        tempList = db.session.query(assTasks).join(Task).filter(assTasks.taskID == Task.id).filter(Task.deadline.like(deadline)).filter(assTasks.email == email).filter(Task.status != -2)
        for curTask in tempList:
            if(curTask.taskID not in taskList):
                taskList.append(curTask.taskID)    
    return taskList

# Description: searchs a users created task given parameters
# Arguments: email(string[150]), taskID(int), title(string), description(string),
# deadline(datetime object)
# Returns: returns 0 if user dosen't exist 
# returns a list of taskID that matches any of the parameter
def searchCreatedTasks(email, taskID = None, title = None, description = None, deadline = None):
# FIXED use the upper or lower function to transform so its not cap sensitive
    user = User.query.filter_by(email = email).first()
    if(user == None):
        return 0
    taskList = []
    if(taskID != None):
        tempList = Task.query.filter(Task.id.like("%"+taskID+"%"), (Task.creatorEmail == user.email)).filter(Task.status != -2)
        for curTask in tempList:
            taskList.append(curTask.id)
    if(title != None):
        tempList = Task.query.filter(Task.title.like("%" +title + "%"), (Task.creatorEmail == user.email)).filter(Task.status != -2)
        for curTask in tempList:
            if(curTask.id not in taskList):
                taskList.append(curTask.id)    
    if(description != None):
        tempList = Task.query.filter(Task.description.like("%" +description + "%"), (Task.creatorEmail == user.email)).filter(Task.status != -2)
        for curTask in tempList:
            if(curTask.id not in taskList):
                taskList.append(curTask.id)    
    if(deadline != None):
        tempList = Task.query.filter(Task.deadline.like(deadline), (Task.creatorEmail == user.email)).filter(Task.status != -2)
        for curTask in tempList:
            if(curTask.id not in taskList):
                taskList.append(curTask.id)    
    return taskList

# Description: changes the status of progression of a task to a newStatus
# Arguments: taskID(int), newStatus(int)
# Returns: returns -1 if task dosen't exist 
# returns the taskID if it was successful
def changeTaskStatus(taskID, newStatus):
    curTask = Task.query.filter_by(id = taskID).first()
    if(curTask == None):
        return -1
    else:
        curTask.status = newStatus
    db.session.commit()
    return taskID

# Description: given the email of the notification reciever it adds to their
# notification database
# Arguments: email(string[150]), taskID(int), notifType(int),
# Returns: returns -1 if user dosen't exist 
# returns the notification id when successful in adding to database
def addNotification(email, taskID, notifType, projID = None):
    user = User.query.filter_by(email = email).first()
    if(user == None):
        return -1
    notif = Notifications(userID = user.id, taskID = taskID, Ntype = notifType, projectID = projID)
    db.session.add(notif)
    db.session.commit()
    return notif.id

# Description: view the notification of a user given email
# Arguments: email(string[150])
# Returns: returns -1 if user dosen't exist 
# returns a list of user notification if successful
def viewNotif(email):
    user = User.query.filter_by(email = email).first()
    if(user == None):
        return -1
    notif = Notifications.query.filter_by(userID = user.id)
    listOfNotifications = []
    for cur in notif:
        listOfNotifications.append({"userID" : cur.userID, "notificationType" : cur.Ntype, "taskID" : cur.taskID, "notificationID" : cur.id , "projectID" : cur.projectID})
    return listOfNotifications

# Description: removes the notification from database given notification id
# Arguments: notifID(int)
# Returns: returns -1 if notification dosen't exist 
# returns 1 if successful
def removeNotif(notifID):
    notif = Notifications.query.filter_by(id = notifID).first()
    if(notif == None):
        return -1
    db.session.delete(notif)
    db.session.commit()
    return 1

# Description: get task details from taskID
# Arguments: taskID(int)
# Returns: returns -1 if task dosen't exist 
# returns the id, creatoremail, title, status, description, assignees and deadline
# of the task as a dict
def getTaskfromID(taskID):
    curTask = Task.query.filter_by(id = taskID).first()
    if(curTask == None):
        return -1
    taskList = assTasks.query.filter_by(taskID = taskID)
    listofAss = []
    for cur in taskList:
        listofAss.append(cur.email)
    return {"id": curTask.id, "creatorEmail": curTask.creatorEmail, "title": curTask.title, "status" : curTask.status, "description": curTask.description,"assignees": listofAss, "deadline": curTask.deadline, "projectID": curTask.projectID, "public": curTask.public}

# Description: delete the task from a database
# Arguments: taskID(int)
# Returns: returns -1 if task dosen't exist 
# returns 1 if successfully deleted
def deleteTaskfromData(taskID):
    curTask = Task.query.filter_by(id = taskID).first()
    if(curTask == None):
        return -1
    assList = assTasks.query.filter_by(taskID = taskID)
    for ass in assList:
        db.session.delete(ass)
    notifList = Notifications.query.filter_by(taskID = taskID)
    for notif in notifList:
        db.session.delete(notif)
    db.session.delete(curTask)
    db.session.commit()
    return 1

# FIXED : add token to the parameters to search through connections
# Description: searchs for a task master that matches the name case insensitive
# as well as includes the letters in name
# Arguments: name(string)
# Returns: a list of user ID
def searchTaskMasterNameData(userID, name):
    searchString = "%"
    for c in name:
        searchString = searchString + c + "%"
    userList =  User.query.filter(User.firstName.like(searchString))
    listUser = []
    user1 = User.query.filter_by(id = userID).first()
    friendList = viewFriends(user1.email)
    for curUser in userList:
        if(curUser.email in friendList):
            listUser.append(curUser.id)
    userList = User.query.filter(User.lastName.like(searchString))
    for curUser in userList:
        if((curUser.id not in listUser) and (curUser.email in friendList)):
            listUser.append(curUser.id)
    return listUser


# Description: Adds a project to the database
# Arguments: creatorEmail (string), title (string), description (string), emailAssign (a list of strings)
# Returns: project ID
def addProject(creatorEmail ,title, description, emailAssign):
    user1 = User.query.filter_by(email = creatorEmail).first()
    if(user1 == None):
        return -1
    new_Project = Project(title = title, description = description)
    db.session.add(new_Project)
    db.session.commit()
    projMaster = projectManager(email = creatorEmail, projID = new_Project.id)
    db.session.add(new_Project)
    db.session.add(projMaster)
    for email in emailAssign:
        user = User.query.filter_by(email = email).first()
        if(user == None):
            return -1
        new_proj_mem = projectMembers(email = email, projectID = new_Project.id)
        db.session.add(new_proj_mem)
    db.session.commit()
    return new_Project.id

# Description: Adds a task to a project
# Arguments: projectID of relevant project(int), taskID (int)
# Returns: project 1 if succesfull, -1 if not succesfull 
def addTaskToProject(projectID, taskID):
    proj = Project.query.filter_by(id = projectID).first()
    curTask = Task.query.filter_by(id = taskID).first()
    if(proj == None):
        return -1
    if(curTask == None):
        return -1
    curTask.projectID = proj.id
    db.session.commit()
    return 1

# Description: Adds users to a project
# Arguments: projectID of relevant project(int), listofEmails is a list of all the emails of the users that are to be 
# added to the project(list of strings)
# Returns: project 1 if succesfull, -1 if not succesfull 
def addUserToProject(projectID, listEmails):
    proj = Project.query.filter_by(id = projectID).first()
    if(proj == None):
        return -1
    for email in listEmails:
        user = User.query.filter_by(email = email).first()
        if(user == None):
            return -1
        new_proj_mem = projectMembers(email = email, projectID = proj.id)
        db.session.add(new_proj_mem)
    db.session.commit()
    
# Description: Deletes a project
# Arguments: projectID of relevant project (int)
# Returns: project 1 if succesfull, -1 if not succesfull 
def deleteProject(projectID):
    proj = Project.query.filter_by(id = projectID).first()
    if(proj == None):
        return -1
    taskList = Task.query.filter_by(projectID = projectID)
    for curTask in taskList:
        deleteTaskfromData(curTask.id)
    assUserList = projectMembers.query.filter_by(projectID = projectID)
    for cur in assUserList:
        db.session.delete(cur)
    projList = projectManager.query.filter_by(projID = projectID)
    for elem in projList:
        db.session.delete(elem)
    notifList = Notifications.query.filter_by(projectID = projectID)
    for notif in notifList:
        db.session.delete(notif)
    db.session.delete(proj)
    db.session.commit()
    return 1

# Description: view created projects of specified user
# Arguments: email of specified user (string)
# Returns: list of projectIDs 
def viewCreatedProjects(email):
    projList = projectManager.query.filter_by(email = email)
    projectList = []
    for proj in projList:
        projectList.append(proj.projID)
    return projectList

# Description: view assigned projects of specified user
# Arguments: email of specified user (string)
# Returns: list of projectIDs 
def viewAssignedProjects(email):
    projList = projectMembers.query.filter_by(email = email)
    projectList = []
    for proj in projList:
        projectList.append(proj.projectID)
    return projectList


# Description: Gets relevant project information from projectID
# Arguments: projectID of specified project(projectID)
# Returns: a dictionary containing "creatorEmail" (string), "title" (string), "description": (string), 
# "listofMembers": (list of strings (emails)), "projectTasks" : (list of ints (task id)), "id" (int (projectID))
def getProjectInfo(projectID):
    proj = Project.query.filter_by(id = projectID).first()
    if(proj == None):
        return -1
    assUserList = projectMembers.query.filter_by(projectID = projectID)
    listOfAssigned = []
    for cur in assUserList:
        listOfAssigned.append(cur.email)
    taskList = Task.query.filter_by(projectID = projectID)
    listOfTasks = []
    for curTask in taskList:
        listOfTasks.append(curTask.id)
    projList = projectManager.query.filter_by(projID = projectID)
    masterList = []
    for elem in projList:
        masterList.append(elem.email)
    return {"creatorEmail": masterList, "title": proj.title, "description": proj.description, "listofMembers": listOfAssigned, "projectTasks" : listOfTasks, "id": projectID}

def taskInProject(taskID):
    curTask = Task.query.filter_by(id = taskID).first()
    if(curTask.projectID != None):
        return curTask.projectID
    else:
        return - 1

# Description: search through all task masters within a given project
# Arguments: projectID (int), searchString(string)
# Returns: list of emails of found users matching searchString (emailList)
def searchTaskMasterProject(projectID, searchString):
    proj = Project.query.filter_by(id = projectID).first()
    if(proj == None):
        return -1
    searchStr = "%"
    for c in searchString:
        searchStr = searchStr + c + "%"
    projList = db.session.query(projectMembers).join(User).filter(projectMembers.email == User.email).filter(projectMembers.projectID == projectID).filter(User.firstName.like(searchStr))
    emailList = []
    for elem in projList:
        emailList.append(projList.email)
    projList = db.session.query(projectMembers).join(User).filter(projectMembers.email == User.email).filter(projectMembers.projectID == projectID).filter(User.lastName.like(searchStr))
    for elem in projList:
        if(projList.email not in emailList):
            emailList.append(projList.email)
    return emailList
    
# Description: Add skills to a user
# Arguments: userID (int), skills (list of strings)
# Returns: 1 is succesfull, -1 if fails
def addSkillsUser(userID, skills):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1
    for skill in skills:
        newSkill = UserSkills(email = user.email, skillName = skill)
        db.session.add(newSkill)
    db.session.commit()
    return 1

# Description: Add skills to a user
# Arguments: userID (int), skills (list of strings)
# Returns: 1 is succesfull, -1 if fails
def addSkillsTask(taskID, skills):
    curTask = Task.query.filter_by(id = taskID).first()
    if(curTask == None):
        return -1
    for skill in skills:
        newSkill = TaskSkills(taskID = curTask.id, skillName = skill)
        db.session.add(newSkill)
    db.session.commit()

# Description: Gets all the skills of specified user
# Arguments: userID (int)
# Returns: a list of all the skills belonging to user (list of strings)
def viewSkillsUser(userID):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1
    skills = UserSkills.query.filter_by(email = user.email)
    skillList = []
    for skill in skills:
        skillList.append(skill.skillName)
    return skillList

# Description: Gets all the skills of specified task
# Arguments: taskID (int)
# Returns: a list of all the skills belonging to a task (list of strings)
def viewSkillsTask(taskID):
    curTask = Task.query.filter_by(id = taskID).first()
    if(curTask == None):
        return -1
    skills = TaskSkills.query.filter_by(taskID = curTask.id)
    skillList = []
    for skill in skills:
        skillList.append(skill.skillName)
    return skillList

# Description: Searches task masters based on skills
# Will only return task masters matching all skills that are input
# Arguments: userID (int), skills (list of strings)
# Returns: list of emails of users that satisfy all the skills in the list
def searchTaskMasterSkills(userID, skills):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1
    friendList = viewFriends(user.email)
    TMList = []
    for friend in friendList:
        contains = 1
        for skill in skills:
            cur = UserSkills.query.filter_by(email = friend, skillName = skill).first()
            if(cur == None):
                contains = 0
        if(contains == 1):
            TMList.append(friend)
    return TMList

# Description: Changes profile picture of user
# Arguments: userID (int), url (string)
# Returns: 1 if succesfull 
def changeProfilePicture(userID, url):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1
    user.profilePic = url
    db.session.commit()
    return 1

# Description: gets all past tasks created by specified user
# Arguments: userID (int)
# Returns: list of task ids (list of ints)
def getPastTask(userID):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1
    else:
        taskList = Task.query.filter_by(creatorEmail = user.email, status = -2)
        listofTaskID = []
        for cur in taskList:
            listofTaskID.append(cur.id)
    return listofTaskID

# Description: gets all past tasks assigned to specified user
# Arguments: userID (int)
# Returns: list of task ids (list of ints)
def getPastAssTask(userID):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1
    else:
        taskList = db.session.query(assTasks).join(Task).filter(assTasks.taskID == Task.id).filter(assTasks.email == user.email).filter(Task.status == -2)
        listofTaskID = []
        for cur in taskList:
            listofTaskID.append(cur.taskID)
    return listofTaskID

# Description: gets all public tasks visible to user specified
# Arguments: userID (int)
# Returns: list of task ids (list of ints)
def getPublicTask(userID):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1
    friendList = viewFriends(user.email)
    PTaskList = []
    for friend in friendList:
        tasks = Task.query.filter(Task.creatorEmail == friend, Task.public == True, Task.projectID == None, Task.status != -2)
        for cur in tasks:
            PTaskList.append(cur.id)
    return PTaskList

# Description: gets all public tasks visible to user specified in a specific project
# Arguments: userID (int), projectID (int)
# Returns: list of task ids (list of ints)
def getPublicTaskProject(userID, projectID):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1
    friendList = viewFriends(user.email)
    PTaskList = []
    for friend in friendList:
        tasks = Task.query.filter(Task.public == True, Task.projectID == projectID, Task.status != -2)
        for cur in tasks:
            PTaskList.append(cur.id)
    return PTaskList

# Description: Searches through all public tasks based on name and description
# Arguments: userID of searching user(int), name (string), desciption (string)
# Returns: list of task ids (list of ints)
def searchPublicTask(userID, name = None, description = None):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1
    friendList = viewFriends(user.email)
    PTaskList = []
    for friend in friendList:
        if(name != None):
            tasks = Task.query.filter(Task.creatorEmail == friend, Task.public == True, Task.name.like("%"+name+"%"))
        for cur in tasks:
            PTaskList.append(cur.id)
        if(description != None):
            tasks = Task.query.filter(Task.creatorEmail == friend, Task.public == True, Task.name.like("%"+description+"%"))
        for cur in tasks:
            PTaskList.append(cur.id)
    return PTaskList
 
# Description: Searches through all public tasks in a project based on name and description
# Arguments: userID of searching user(int), projectID (string), name (string), desciption (string)
# Returns: list of task ids (list of ints)
def searchPublicTaskProject(userID, projectID, name = None, description = None):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1
    friendList = viewFriends(user.email)
    PTaskList = []
    for friend in friendList:
        if(name != None):
            tasks = Task.query.filter(Task.creatorEmail == friend, Task.public == True, Task.projectID == projectID, Task.name.like("%"+name+"%"))
        for cur in tasks:
            PTaskList.append(cur.id)
        if(description != None):
            tasks = Task.query.filter(Task.creatorEmail == friend, Task.public == True, Task.projectID == projectID, Task.name.like("%"+description+"%"))
        for cur in tasks:
            PTaskList.append(cur.id)
    return PTaskList

# Description: Promote a user to project manager in specified project
# Arguments: userID (string), projectID (string)
# Returns: 1 if succesful
def promoteProjectManager(userID, projectID):
    user1 = User.query.filter_by(id = userID).first()
    if(user1 == None):
        return -1
    projMaster = projectManager(email = user1.email, projID = projectID)
    db.session.add(projMaster)
    projMem = projectMembers.query.filter_by(email = user1.email, projectID = projectID).first()
    if(projMem != None):
        db.session.delete(projMem)
    db.session.commit()
    return 1

# Description: Searches through all project members in specified project
# Arguments: projectID (string), searchString (string)
# Returns: returns list of email addresses of members matching search string (list of strings)
def searchProjectMember(projectID, searchString):
    proj = Project.query.filter_by(id = projectID).first()
    if(proj == None):
        return -1
    searchStr = "%"
    for c in searchString:
        searchStr = searchStr + c + "%"
    memListfName = db.session.query(projectMembers).join(User).filter(projectMembers.email == User.email).filter(User.firstName.like(searchStr))
    memListlName = db.session.query(projectMembers).join(User).filter(projectMembers.email == User.email).filter(User.lastName.like(searchStr))
    memListEmail = db.session.query(projectMembers).join(User).filter(projectMembers.email == User.email).filter(User.email.like(searchStr))
    manListfName = db.session.query(projectManager).join(User).filter(projectManager.email == User.email).filter(User.firstName.like(searchStr))
    manListlName = db.session.query(projectManager).join(User).filter(projectManager.email == User.email).filter(User.lastName.like(searchStr))
    manListEmail = db.session.query(projectManager).join(User).filter(projectManager.email == User.email).filter(User.email.like(searchStr))
    memList = []
    for elem in memListfName:
        if(elem.email not in memList):
            memList.append(elem.email)
    for elem in memListlName:
        if(elem.email not in memList):
            memList.append(elem.email)
    for elem in memListEmail:
        if(elem.email not in memList):
            memList.append(elem.email)
    for elem in manListfName:
        if(elem.email not in memList):
            memList.append(elem.email)
    for elem in manListlName:
        if(elem.email not in memList):
            memList.append(elem.email)
    for elem in manListEmail:
        if(elem.email not in memList):
            memList.append(elem.email)

    return memList

# Description: Add a find connection post
# Arguments: userID (int), description (string), skills (list of string)
# Returns: postID if succesfull otherwise return -1
def addFindConnection(userID, descrition, skills):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1
    newAd = friendAd(email = user.email, description = descrition)
    db.session.add(newAd)
    db.session.commit()
    for skill in skills:
        newSkill = friendAdSkills(friendAdID = newAd.id, skillName = skill)
        db.session.add(newSkill)
    db.session.commit()
    return newAd.id

# Description: delete find connection post
# Arguments: postID (int)
# Returns: 1 is succesfull otherwise returns -1
def deleteFindConnection(postID):
    curAd = friendAd.query.filter_by(id = postID).first()
    if(curAd == None):
        return -1
    db.session.delete(curAd)
    db.session.commit()
    return 1

# Description: show all find connection posts posted by specified user
# Arguments: userID (int)
# Returns: list of postIDs (list of string) otherwise returns -1
def findMyConnectionPost(userID):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1  
    ads = friendAd.query.filter_by(email = user.email)
    postList = []
    for ad in ads:
        postList.append(ad.id)
    return postList

# Description: show all find connection posts which can be seen by specified user
# Arguments: userID (int)
# Returns: list of postIDs (list of string) otherwise returns -1
def findConnectionPost(userID):
    user = User.query.filter_by(id = userID).first()
    if(user == None):
        return -1
    friendList = viewFriends(user.email)
    posts = friendAd.query.filter(friendAd.email != user.email)
    postList = []
    for post in posts:
        if(post.email not in friendList):
            postList.append(post.id)
    return postList

# Description: get find connections post info from postID
# Arguments: postID (int)
# Returns: dictionary of "postID" (int), "creatorEmail" (string), "description" (string), "skills" (list of strings)
def getFindConnectionInfo(postID):
    ad = friendAd.query.filter_by(id = postID).first()
    if(ad == None):
        return -1
    skillList = []
    skills = friendAdSkills.query.filter_by(friendAdID = postID)
    for skill in skills:
        skillList.append(skill.skillName)
    return {"postID": ad.id, "creatorEmail": ad.email, "description" : ad.description, "skills" : skillList}
