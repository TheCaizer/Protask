from server.models import *
from backend.auth import *
from backend.skills import *

# Description: A friend reccomendation system that finds any non-connections
# by reccomending people who have mutal friends, up to 2 degrees of friends
# Arguments: creatorToken(string)
# Returns: returns a list of reccomended connections in form of dict {id:, mutuals:}
# sorted by number of mutals else return 0 for invalid token
def freindReccomendation(token):
    decoded = decode_token(token)
    if decoded is None:
        return 0
    userID = decoded["user_id"]
    user = getUserID(userID)
    # get all your friends email
    friendList = viewFriends(user["email"])
    # empty list
    tempList = []
    # for all the friends in your friend list
    for friends in friendList:
        # add your friends friends into the list
        mutualsFriends = viewFriends(friends)
        tempList += mutualsFriends
        for i in mutualsFriends:
            tempList += viewFriends(i)
    # change list to a set so it contians unqiues values and minus your friends
    # and yourself then change it back into a list
    tempList = list(set(tempList) - set(friendList))
    if user["email"] in tempList:
        tempList.remove(user["email"])
    # here we sort the list in the order of the most mutuals at the top and no 
    # mutal at the bottom
    ret = []
    # goes through all the possible reccomendation
    for j in tempList:
        # gets their userID
        tempID = getUser(j)["id"]
        # count the number of mutuals
        mutuals = 0
        # for all your friends m  
        for m in friendList:
            # if they have j as their friends increment mutuals by 1
            if j in viewFriends(m):
                mutuals += 1
        # get a dict of id to number of your mutuals
        tempDict = {"id" : tempID, "mutuals": mutuals}
        ret.append(tempDict)
    # sort by the number of mutual
    ret = sorted(ret, key=lambda d: d["mutuals"], reverse=True)
    return ret

# Description: backend function to add a find connection post using a users token
# Arguments: token(string),  description(string), skills(list[string])
# Returns: the id of the newly added find connection post
# returns -1 if the description is empty
# returns 0 if token does not correspond to user
def addFindConnectionToken(token, description, skills):
    decoded = decode_token(token)
    if decoded is None:
        return 0
    userID = decoded["user_id"]
    if description is None:
        return -1
    ret = addFindConnection(userID, description, skills)
    return ret
# Description: gets a list of the find connections that are not your friends sorted
# by the number of similar skills you have and the post is requesting
# Arguments: token(string)
# Returns: the list of find connections post
# returns 0 if token does not correspond to user
def findConnectionToken(token):
    decoded = decode_token(token)
    if decoded is None:
        return 0
    userID = decoded["user_id"]
    adList = findConnectionPost(userID)
    userSkills = viewSkillsUserToken(token)
    ret = []
    for post in adList:
        postInfo = getFindConnectionInfo(post)
        match = 0
        for skills in userSkills:
            if skills in postInfo["skills"]:
                match += 1
        postInfo["match"] = match
        ret.append(postInfo)
    ret = sorted(ret, key=lambda d: d["match"], reverse=True)
    return ret

# Description: gets a list of the find connections that user created
# Arguments: token(string)
# Returns: the list of find connections post made by user
# returns 0 if token does not correspond to user        
def findMyConnectionPostToken(token):
    decoded = decode_token(token)
    if decoded is None:
        return 0
    userID = decoded["user_id"]
    myPost = findMyConnectionPost(userID)
    ret = []
    for post in myPost:
        i = getFindConnectionInfo(post)
        ret.append(i)
    return ret

# Description: deletes a post made by the user to find connections
# Arguments: token(string), postID(int)
# Returns: 1 for success
# returns 0 if token does not correspond to user
# returns -1 if the user is not the post creator
def deleteFindConnectionToken(token, postID):
    decoded = decode_token(token)
    if decoded is None:
        return 0
    userID = decoded["user_id"]
    user = getUserID(userID)
    post = getFindConnectionInfo(postID)
    if user["email"] != post["creatorEmail"]:
        return -1
    deleteFindConnection(postID)
    return 1