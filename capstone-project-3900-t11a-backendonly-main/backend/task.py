import datetime
from flask import flash
from server.models import *
from backend.auth import *
from backend.project import *

# Description: user creates a new task and adds it into the database with optinal deadline
# Arguments: creatorToken(string), title(string), description(string), emails(string), deadline(datetime object), public(bool))
# Returns: returns TaskID for success 
# else return 0
def createTask(creatorToken, title, description, emails, deadline = None, public = False):
    user = decode_token(creatorToken)
    if user is None:
        return 0
    userID = user["user_id"]
    user_info = getUserID(userID)

    u_email = user_info['email']
    u_frineds = viewFriends(u_email)
    if title == None:
        return {'error': "Please enter the task title."}
    elif description == None:
        return {'error':"Please enter the task description"}
    elif emails == []:
         taskID = newTask(u_email, title, description, [u_email], deadline, None, public)
         return taskID
    else:
        no_error = True
        for email in emails:
            if email not in u_frineds and  email != u_email :
                no_error = False
                return {'error': email + " is not your friend. Please send the friend request first."}
        if no_error:
            taskID = newTask(u_email, title, description, emails, deadline, None, public)
            for email in emails:
                addNotification(email, taskID, 0)
            return taskID
    return 0

# Description: creator assigns an existing task to a friend as a new assigne
# Arguments: creatorToken(string), taskID(int), assigne(list[emails])
# Returns: returns 1 for success 
# else return 0
def assignTask(creatorToken, taskID, assigne):
    # assigne is a list of emails (string ) if only one email just do list with 1 element
    user = decode_token(creatorToken)
    if user is None:
        return 0
    userID = user["user_id"]
    user_info = getUserID(userID)

    u_email = user_info['email']
    u_friends = viewFriends(u_email)

    no_error = True
    for email in assigne:
        if email not in u_friends and  email != u_email:
            no_error = False
            flash(email + " is not your friend. Please send the friend request first.", category='error')
    if no_error:
        taskID = addAssignee(taskID, assigne)
        for email in assigne:
            addNotification(email, taskID, 0)
        flash("Assign task successfully.", category = 'success')
        return 1
    return 0

# Description: creator of task edit an existing task
# Arguments: creatorToken(string), taskID(int), title(string), description(string),
# emails(string), deadline(datetime object)
# Returns: returns taskID for success 
# else return 0
def editTask(creatorToken, taskID, title = None, description = None, deadline = None, public = False):
    #deadline is date type object
    user = decode_token(creatorToken)
    if user is None:
        return 0
    userID = user["user_id"]
    user_info = getUserID(userID)
    
    u_email = user_info['email']
    task = getTaskfromID(taskID)
    creator_email = task['creatorEmail']
    # if user is a creator
    if u_email == creator_email:
        taskID = editTaskData(taskID, title, description, deadline, public)
        return taskID
    else:
        flash("Edit task fail. You are not a creator of the task.", category = 'error')
    return 0

# Description: gets the token of the person trying to view a profile then if they are friends
# they are able to get list of taskID they are assigned to
# Arguments: Token(string), emails(string)
# Returns: returns list of dict task with details for success 
# else return 0 
def getConnectionTask(token, email):
    userID = decode_token(token)
    if userID is None:
        return 0
    user = getUserID(userID["user_id"])
    friendList = viewFriends(email);
    
    if user["email"] not in friendList:
        return 0

    ret = []
    noDate = []
    # returns a list of task ID of the email they are looking at
    listOfTask = getAssTasks(email)
    
    for taskID in listOfTask:
        eachTask = getTaskfromID(taskID)
        if (eachTask['deadline'] != None):
            ret.append(eachTask)
        else:
            noDate.append(eachTask)
    ret.extend(noDate)
    return ret

# Description: get a list of created task by the user 
# Arguments: creatorToken(string)
# Returns: returns list of taskID sorted by deadline
# returns 0 if invalid token
def getCreatedTask(creatorToken):
    userID = decode_token(creatorToken)
    if userID is None:
        return 0
    user = getUserID(userID["user_id"])
    assTask = getCreatedTasks(user["email"])
    listOfTask = []
    noDate = []
    for task in assTask:
        taskA = getTaskfromID(task)
        if (taskA['deadline'] != None):
            listOfTask.append(taskA)
        else:
            noDate.append(taskA)
    
    ret = sorted(listOfTask, key=lambda d: d["deadline"])
    ret.extend(noDate)
    return ret

# Description: given a user token the person searchs through their created task
# with criteria and gets task matching those criteria
# Arguments: token(string), tokenID(int), title(string), description(string), 
# emails(string), deadline(datetime object)
# Returns: returns a list of taskID sorted by the number of criteria that matches
# the search criteria
# return 0 if invalid token
def searchCreatedTaskSorted(token, taskID = None, title = None, description = None, deadline = None):
    userID = decode_token(token)
    if userID is None:
        return 0
    user = getUserID(userID["user_id"])
    email = user["email"]
    listOfTask = searchCreatedTasks(email, taskID, title , description, deadline)
    retTask = []
    for task in listOfTask:
        taskInfo = getTaskfromID(task)
        # search every task id so that if the parameters are contained in the
        # taskID it incremets and then we can sort it by the most that it contains
        numMatches = 0
        if taskID != None and (taskID == str(taskInfo["id"])):
            numMatches += 1
        if title != None and title.upper() in taskInfo["title"].upper():
            numMatches += 1
        if description != None and description.upper() in taskInfo["description"].upper():
            numMatches += 1
        if deadline != None and (taskInfo['deadline'] != None):
            if (deadline == taskInfo["deadline"].strftime("%Y-%m-%d")):
                numMatches += 1
        single = {"task": taskInfo, "searchCriteria": numMatches}
        retTask.append(single)
    ret = sorted(retTask, key=lambda d: d["searchCriteria"], reverse=True)
    return ret

# Description: get a list of assigned task by the user 
# Arguments: creatorToken(string)
# Returns: returns list of taskID sorted by deadline
# returns 0 if invalid token
def getAssignedTask(creatorToken):
    userID = decode_token(creatorToken)
    if userID is None:
        return 0
    user = getUserID(userID["user_id"])
    assTask = getAssTasks(user["email"])
    listOfTask = []
    noDate = []
    for task in assTask:
        taskA = getTaskfromID(task)
        if (taskA['deadline'] != None):
            listOfTask.append(taskA)
        else:
            noDate.append(taskA)
    ret = sorted(listOfTask, key=lambda d: d["deadline"])
    ret.extend(noDate)
    return ret

# Description: given a user email through their assigned task
# with criteria and gets task matching those criteria
# Arguments: email(string), tokenID(int), title(string), description(string), 
# emails(string), deadline(datetime object)
# Returns: returns a list of taskID sorted by the number of criteria that matches
# the search criteria
def searchAssignedTaskSorted(email, taskID = None, title = None, description = None, deadline = None):
    listOfTask = searchAssTasks(email, taskID, title , description, deadline)
    retTask = []
    for task in listOfTask:
        taskInfo = getTaskfromID(task)
        # search every task id so that if the parameters are contained in the
        # taskID it incremets and then we can sort it by the most that it contains
        numMatches = 0
        if taskID != None and (taskID == str(taskInfo["id"])):
            numMatches += 1
        if title != None and title.upper() in taskInfo["title"].upper():
            numMatches += 1
        if description != None and description.upper() in taskInfo["description"].upper():
            numMatches += 1
        if deadline != None and (deadline == taskInfo["deadline"].strftime("%Y-%m-%d")):
            numMatches += 1
        single = {"task": taskInfo, "searchCriteria": numMatches}
        retTask.append(single)
    ret = sorted(retTask, key=lambda d: d["searchCriteria"], reverse=True)
    return ret

# Description: changes a the status of a task given a task ID
# to newStatus given it is the creator or assignee
# Arguments: Token(string), taskID(int), newStatus(int)
# Returns: returns taskID for success
# else returns 0 for error

# newStatus is an int
# 0 -> not started
# 1 -> in progress
# 2 -> completed
# -1 -> blocked
def changeTaskStatusCheck(token, taskID, newStatus):
    task = getTaskfromID(taskID)
    userID = decode_token(token)
    if task is None or userID is None:
        return 0
    user = getUserID(userID["user_id"])
    if task["creatorEmail"] != user["email"] and user["email"] not in task["assignees"]:
        flash("You do not have permission to change task status")
        return 0
    # not started -> in progress
    if(task["status"] == 0 and newStatus == 1):
        return changeTaskStatus(taskID, newStatus)
    # in progress -> completed
    elif(task["status"] == 1 and newStatus == 2):
        if task["projectID"] is not None:
            sendTaskCompleteProject(task["projectID"], taskID)
        return changeTaskStatus(taskID, newStatus)
    # not started or in progress -> blocked
    elif((task["status"] == 1 or task["status"] == 0) and newStatus == -1):
        return changeTaskStatus(taskID, newStatus)
    # blocked -> not started or in progress
    elif((task["status"] == -1) and (newStatus == 1 or newStatus == 0)):
        return changeTaskStatus(taskID, newStatus)
    # complete -> in progress or not started (for when task completion is not approved)
    elif((task["status"] == 2) and (newStatus == 1 or newStatus == 0 or newStatus == -2)):
        return changeTaskStatus(taskID, newStatus)
    else:
        return -1

# Description: adds a notification to the database that someone completed a task
# Arguments: token(string), taskID(int)
# Returns: returns 1 for success
# returns 0 if invalid token
def completeTaskNotification(token, taskID):
    user = decode_token(token)
    if user is None:
        return 0 
    userID = user["user_id"]
    user2 = getUserID(userID)
    u_email = user2['email']

    task = getTaskfromID(taskID)
    
    creator_email = task['creatorEmail']
    
    if (u_email != creator_email):
        addNotification(creator_email, taskID, 1)
        return 1
    
    return 0

# Notification Type is the type of notification we send
# 0 is person has been assigned to a task
# 1 a task made by user is marked as completed
# 2 is task has been created in project
# 3 is user has been added into a project
# 4 is a task in project has been marked as complete
# 5 is a task is past the due date

# Description: gets the list of notification of the user given token
# Arguments: token(string)
# Returns: returns list of {userId:, NotificationType: , notificationID}
# returns 0 if invalid token
def viewNotification(token):
    user = decode_token(token)
    if user is None:
        return 0 
    userID = user["user_id"]
    user_info = getUserID(userID)

    u_email = user_info['email']
    listOfNotification = viewNotif(u_email)
    return listOfNotification

# Description: remove a notification from the database
# Arguments: notifID(int)
# Returns: returns 1 for success
def removeNotification(notifID):
    removeNotif(notifID)
    return 1

# Description: sends a notification you have been assigned to a task
# Arguments: token(string), taskID(int)
# Returns: returns 1 for success
# returns 0 if invalid token
def assignTaskNotification(token, taskID):
    user = decode_token(token)
    if user is None:
        return 0 
    userID = user["user_id"]
    user_info = getUserID(userID)

    u_email = user_info['email']
    addNotification(u_email, taskID, 0)
    
    return 1

# Description: get the task information from taskID
# Arguments: taskID(int)
# Returns: returns dict of the details of the task
def getTask(taskID):
    return getTaskfromID(taskID)

# Description: deletes a task from the databse
# Arguments: taskID(int)
# Returns: returns -1 if notification dosen't exist 
# returns 1 if successful
def deleteTask(taskID):
    return deleteTaskfromData(taskID)

# Description: Search for a task master with the name as criteria
# Arguments: name(string)
# Returns: returns a list of dict {id: }task master with same name
# return 0 if no user 
def searchTaskMasterName(token, name):
    user = decode_token(token)
    if user is None:
        return 0
    userID = user["user_id"]
    listTaskMaster = searchTaskMasterNameData(userID, name)
    if listTaskMaster == []:
        flash("We cannot find a user name " + name)
    return listTaskMaster

# Description: finds how busy a person is given their assigned task
# Arguments: email(string)
# Returns: the sum of how busy a person is
def busyFactor(email):
    allTasks = getAssTasks(email)
    sum = 0
    for id in allTasks:
        task = getTaskfromID(id)
        if(task["deadline"] != None):
            w = 10 - dayFromToday(task["deadline"])
            if(w < 1):
                w = 1
        # assuming no deadline means w = 1
        else:
            w = 1
        sum += w
    return sum

# Description: finds the difference between a given date object and today
# Arguments: d1(datetime object)
# Returns: the difference in the number of days
def dayFromToday(d1):
    d2 = datetime.date.today()
    return (d1 - d2).days

# Description: send the notification to the user if their in progress task 
#              pasts the due date 
# Arguments: token(string)
# Returns: the notification id (string)
def dueNotifiction(token):
    user = decode_token(token)
    u_email = getUserID(user['user_id'])['email']
    
    notifList = viewNotif(u_email)
    
    # Prevent more than 1 overdue notif
    for i in notifList:
        if (i['notificationType'] == 5):
            return 0

    return addNotification(u_email, None, 5, None)

# Description: get the list of tasks that past the due date
# Arguments: token(string)
# Returns: the nlist of tasksID
def getDueList(token):
    user = decode_token(token)
    u_email = getUserID(user['user_id'])['email']

    today = datetime.date.today()
    
    expiredTasks = []
    assTasks = getAssTasks(u_email)
    for task in assTasks:
        info = getTaskfromID(task)
        if (info['deadline'] < today and info['status'] != 2):
            expiredTasks.append(task)
    
    return expiredTasks