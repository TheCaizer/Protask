import os
from pickle import TRUE
from base64 import decode
import os
import uuid

from flask import flash
from PIL import Image
from server.models import *
from backend.auth import *
import datetime
from flask import flash
from server.models import *
from backend.auth import *
from flask import flash
from PIL import Image
from server.models import *
from backend.auth import *

# Description: adds skills to a user if skill already exist in user skips it
# Arguments: token(string), skills(list[string])
# Returns: 0 for success
# returns -1 if token does not correspond to user
def addSkillsUserToken(token, skills):
    userDict = decode_token(token)
    if userDict is None:
        return -1
    userID = userDict["user_id"]
    skillsDict = viewSkillsUserToken(token)
    skills = list(set(skills))
    for skill in skills:
        if skill not in skillsDict:
            addSkillsUser(userID, [skill])
    return 0

# Description: adds skills to a task if skill already exist in task skips it
# Arguments: token(string), taskID(int) ,skills(list[string])
# Returns: 0 for success
# returns -1 if token does not correspond to user 
# returns -2 if the user is not the creator of task
def addSkillsTaskToken(token, taskID, skills):
    userDict = decode_token(token)
    if userDict is None:
        return -1
    userID = userDict["user_id"]
    user = getUserID(userID)
    task = getTaskfromID(taskID) 
    if task["creatorEmail"] != user["email"]:
        return -2
    else:
        skillsDict = viewSkillsTask(taskID)
        skills = list(set(skills))
        for skill in skills:
            if skill not in skillsDict:
                addSkillsTask(taskID, [skill])
    return 0

# Description: views skills of a user
# Arguments: token(string)
# Returns: a list of the users skills
# returns -1 if token does not correspond to user 
def viewSkillsUserToken(token):
    userDict = decode_token(token)
    if userDict is None:
        return -1
    userID = userDict["user_id"]
    return viewSkillsUser(userID)

# Description: get the past task that the user has created that is considered complete
# Arguments: token(string)
# Returns: a list of the task completed created by the user
# returns -1 if token does not correspond to user 
def getPastTaskToken(token):
    userDict = decode_token(token)
    if userDict is None:
        return -1
    userID = userDict["user_id"]
    return getPastTask(userID)

# Description: get the past task that the user has completed assigned to them
# Arguments: token(string)
# Returns: a list of the task completed by the user
# returns -1 if token does not correspond to user 
def getPastAssTaskToken(token):
    userDict = decode_token(token)
    if userDict is None:
        return -1
    userID = userDict["user_id"]
    return getPastAssTask(userID)

# Description: get a list of task that are public from connections that can be request to be assigned
# to the user, sorted by the number of skills that user have that match with the task
# Arguments: token(string)
# Returns: a list of task that are public to the user
# returns -1 if token does not correspond to user 
def getPublicTaskToken(token):
    userDict = decode_token(token)
    if userDict is None:
        return -1
    userID = userDict["user_id"]
    user = getUserID(userID)
    allPublicTask = getPublicTask(userID)
    assigned = getAssTasks(user["email"])
    publicTask = list(set(allPublicTask) - set(assigned))
    
    userSkills = viewSkillsUserToken(token)
    ret = []
    for i in publicTask:
        match = 0
        taskSkills = viewSkillsTask(i)
        for skills in userSkills:
            if skills in taskSkills:
                match += 1
        publicDict = {"taskID": i, "match": match}
        ret.append(publicDict)
    ret = sorted(ret, key=lambda d: d["match"], reverse=True)
    return ret

# Description: get a list of task that are public in a project that can be request to be assigned
# to the user, sorted by the number of skills that user have that match with the task
# Arguments: token(string), projectID(int)
# Returns: a list of task that are public to the user inside the project
# returns -1 if token does not correspond to user 
def getPublicTaskProjectToken(token, projectID):
    userDict = decode_token(token)
    if userDict is None:
        return -1
    userID = userDict["user_id"]
    user = getUserID(userID)
    
    project = getProjectInfo(projectID)
    if user["email"] not in project["listofMembers"] and user["email"] not in project["creatorEmail"]:
        return -2
    allPublicTask = getPublicTaskProject(userID, projectID)
    assigned = getAssTasks(user["email"])
    publicTask = list(set(allPublicTask) - set(assigned))
    userSkills = viewSkillsUserToken(token)
    ret = []
    for i in publicTask:
        match = 0
        taskSkills = viewSkillsTask(i)
        for skills in userSkills:
            if skills in taskSkills:
                match += 1
        publicDict = {"taskID": i, "match": match}
        ret.append(publicDict)
    ret = sorted(ret, key=lambda d: d["match"],reverse=True)
    return ret

# Description: a project manager(token) promotes a memeber (userID) to a project manager 
# inside a project (projectID)
# Arguments: token(string), userID(int), projectID(int)
# Returns: 1 if success
# returns -1 if token does not correspond to user 
# Returns: -2 if token of user is not a project manager
# returns -3 the promoting user is already a project manager
def promoteProjectManagerToken(token, userID, projectID):
    userDict = decode_token(token)
    if userDict is None:
        return -1
    userIDT = userDict["user_id"]
    user = getUserID(userIDT)
    userP = getUserID(userID)
    project = getProjectInfo(projectID)
    if user["email"] not in project["creatorEmail"]:
        return -2
    elif user["email"] in project["creatorEmail"] and userP["email"] in project["creatorEmail"]:
        return -3
    else:
        return promoteProjectManager(userID, projectID)

# Description: user change the exist profile picture, the function only accept the 
# Arguments: token(string), file(Image)
# Returns: filename
#          return -1 if the file type is not JPG or PNG
# Pictures will be saved in the folder 'protask-ui/src/static/profile_pictures'
# When sign up the default picture will be set,
# user can change their profile picture after login
def changeProfilePictureToken(token, file):
    user = decode_token(token)
    if user is None:
        return 0
    userID = user["user_id"]
    user_info = getUserID(userID)

    fileType = os.path.splitext(file.filename)[1]
    
    if fileType != ".jpg" and fileType != ".png":
        flash("Sorry! We only accept JPG and PNG images.", category = 'error')
        return -1
    
    oldFileName = user_info["profilePic"]
    os.remove(os.path.join('protask-ui/src/static/profile_pictures', oldFileName))
    
    oldName = os.path.splitext(oldFileName)[0] + fileType
    
    file.save(os.path.join('protask-ui/src/static/profile_pictures', oldName))
    
    changeProfilePicture(userID, oldName)
    flash("Profile picture upload successfully!", category = 'success')
    
    return oldName
