import re
import string
import random
import jwt
import hashlib
import smtplib
import os
import uuid
from PIL import Image

from flask import flash

from server.models import *

# regex for a valid email
VALID_EMAIL = r"^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$"
# secret key for the jwt
secret = "COMP3900"

# Description: decodes a given jwt token 
# Arguments: token(string)
# Returns: a dict with the userid as {'user_id': user_id}
def decode_token(token):
    return jwt.decode(token, secret, algorithms=["HS256"])

# Description: generate a jwt token with a user_id
# Arguments: user_id(int)
# Returns: the token that was generated
def generate_token(user_id):
    # encode it and associate it as a user_id with algo HS256
    token = jwt.encode({'user_id': user_id}, secret, algorithm = 'HS256')
    return token

# Description: given a first name, last name, password and email it signs the user
# up to the app and then logs the person in
# Arguments: first_name(string), last_name(string), password(string), 
# confirm_password(string), email(string)
# Returns: a dict of the users details such as {"firstName":, "lastName":, "email": , "id" :,"token":}
# returns 0 if unsuccessful sign up
def sign_up(first_name, last_name, password, confirm_password, email):
    if not re.search(VALID_EMAIL, email):
        flash('Not a valid email format',category='error')
    elif(emailExist(email)):
        flash('Email already in use',category='error')
    elif(len(email) < 4):
        flash('Email too short',category='error')
    elif(len(email) > 150):
        flash('Email too long',category='error')
    elif(len(first_name) <= 0):
        flash('Need to input first name',category='error')
    elif(len(first_name) > 150):
        flash('First name too long',category='error')
    elif(len(last_name) <= 0):
        flash('Need to input last name',category='error')
    elif(len(last_name) > 150):
        flash('Last name too long',category='error')
    elif(len(password) < 8):
        flash('Password too short need to be at least 8 characters',category='error')
    elif(len(password) > 150):
        flash('Password too long',category='error')
    elif(password != confirm_password):
        flash('Password does not match',category='error')
    else:
        # hash the password
        hashed_password = hash_password(password)
        user = addUser(first_name, last_name, hashed_password, email)
        
        # set default picture
        file =  Image.open('protask-ui/src/static/profile_pictures/' + "default.jpg")
        sysFileName = str(uuid.uuid1()) + ".jpg"
        changeProfilePicture(user["id"], sysFileName)
        file.save(os.path.join('protask-ui/src/static/profile_pictures', sysFileName))
        
        flash('Account Created',category='success')
        # after signing up it should login
        loginCheck = login(email, password)
        
        real_user = getUser(email)
        real_user['token'] = loginCheck['token']
        
        return real_user
    return 0

# Description: logs a person in given email and password
# Arguments: password(string), email(string)
# Returns: a dict of the users details {"id" :,"token":}
# returns 0 if unsuccessful login
def login(email, password):
    if not re.search(VALID_EMAIL, email):
        return {'error': 'Not a valid email format'}
    elif not emailExist(email):
        return {'error': 'Login Failed Check Your Password and Email is Correct'}
    else:
        user = User.query.filter_by(email=email).first()
        if(user.password != hash_password(password)):
            return {'error': 'Login Failed Check Your Password and Email is Correct'} 
        else:
            token = generate_token(user.id)
            addToken(user, token)
            return {'user_id': user.id, 'token': token}
    return 0

# Description: logs a person off given a token
# Arguments: token(string)
# Returns: a dict {"logoff_success":} with either true or false if successful or not
def logoff(token):
    user = User.query.filter_by(token=token).first()
    if user:
        success = removeToken(user.token)
        if success:
            return {"logoff_success": True}
    return {"logoff_success": False}

# Description: changes the password of a user given correct old password
# Arguments: email(string), old_password(string), new_password(string)
# Returns: returns 1 if successful
# returns -1 if old password is new password
# returns 0 if password doesnt match old password
def change_password(email, old_password, new_password):
    password = getPW(email)
    oldPasswordHash = hash_password(old_password)
    if password['password'] != oldPasswordHash:
        flash("The old password is wrong. Please try again.")
        return 0
    if old_password == new_password:
        flash("The new password needs to be different from the old password.", category='error')
        return -1
    hashed_password = hash_password(new_password)
    changePassword(email, hashed_password)
    flash("Password changed!", category='success')
    return 1

# Description: retrieve the password by sending a new one if forgotten
# Arguments: email(string)
# Returns: returns 1 if successful
# returns 0 if unsuccessful
def retrieve_password(email):
    user = getUser(email)
    # #check if email valid
    if user:
        sender = "protask3900@gmail.com"
    
        send_server =  smtplib.SMTP('smtp.gmail.com', 587)
        send_server.ehlo()
        send_server.starttls()
        send_server.ehlo()
        
        send_server.login(sender, "yfpxyvygsekwdebo")
            
        subject = 'The ProTask password retrieve'
        
        # retrieve password by sending a random password and updating it.
        characters = string.ascii_letters + string.digits + string.punctuation
        password = ''.join(random.choice(characters) for i in range(8))
        changePassword(email, hash_password(password))
        
        body = 'Your account new password is ' + password
        msg = f'Subject: {subject}\n\n{body}'    
            
        send_server.sendmail(sender, email, msg)  
        flash("The password has been sent to your email. Please take a check", category='success')
    else:
        # input error
        flash("The email is invalid. Please try again", category='error')
        return 0
    return 1

# Description: given a string hashs it using utf-8
# Arguments: password(string)
# Returns: returns the hashed string
def hash_password(password):
    hash = hashlib.md5()
    hash.update(password.encode("utf-8"))
    return hash.hexdigest()

# Description: sends a friend request from email to target_email users
# Arguments: email(string), target_email(string)
# Returns: returns 1 for success else return 0
def send_request(email, target_email):
    
    requestList = viewFriendRequests(target_email)
    # the request is sent before
    if email in requestList:
        flash("You have sent a friend request before. Please be patient.")
        return 1
        
    friendList = viewFriends(target_email)
    # they are alreafy friend
    if email in friendList:
        flash("You are already friend.")
        return 2
    
    SendFriendReq(email, target_email)
    flash("The friend request has been sent.")
    
    return 1

# Description: accept an existing friend request
# Arguments: email(string), target_email(string)
# Returns: returns 1 for success else return 0 if no such friend request
def accept_request(email, target_email):
    # add to both friend list
    ret = acceptFriendRequest(email, target_email)
    if ret == 0:
        flash("No such friend request.")
        return ret
    flash("You are now friends.")
    return 1
    