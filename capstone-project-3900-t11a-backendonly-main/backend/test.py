# file to write functions to use to test the code

from backend.auth import *
from backend.task import *
from backend.skills import *
from server.models import *
from backend.reccomendation import *
# signup 10 users and make some of them friends and then create a few task
# as a baseline of the database then we can test the functions
def test():
    A =sign_up("Jackie", "Cai", "Jackiecai1", "Jackiecai1", "jackiecai@email.com")
    B =sign_up("Bob", "C", "BobC1234", "BobC1234", "BobC1234@email.com")
    C =sign_up("Tob", "A", "TobA1234", "TobA1234", "TobA1234@email.com")
    D =sign_up("Jean", "B", "JeanB1234", "JeanB1234", "JeanB1234@email.com")
    E =sign_up("Diluc", "V", "DilucV1234", "DilucV1234", "DilucV1234@email.com")
    F=sign_up("Venti", "D", "VentiD1234", "VentiD1234", "VentiD1234@email.com")
    G=sign_up("Rosaria", "C", "RosariaC1234", "RosariaC1234", "RosariaC1234@email.com")
    H=sign_up("Lisa", "P", "LisaP1234", "LisaP1234", "LisaP1234@email.com")
    I=sign_up("Bart", "E", "BartE1234", "BartE1234", "BartE1234@email.com")
    J=sign_up("Mona", "W", "MonaW1234", "MonaW1234", "MonaW1234@email.com")

    send_request("jackiecai@email.com", "BobC1234@email.com")
    accept_request("BobC1234@email.com", "jackiecai@email.com")
    
    send_request("JeanB1234@email.com", "TobA1234@email.com")
    accept_request("TobA1234@email.com", "JeanB1234@email.com")
    
    send_request("jackiecai@email.com", "TobA1234@email.com")
    accept_request("TobA1234@email.com", "jackiecai@email.com")
    
    send_request("jackiecai@email.com", "JeanB1234@email.com")
    accept_request("JeanB1234@email.com", "jackiecai@email.com")

    send_request("jackiecai@email.com", "LisaP1234@email.com")
    accept_request("LisaP1234@email.com", "jackiecai@email.com")
    
    send_request("JeanB1234@email.com", "BartE1234@email.com")
    accept_request("BartE1234@email.com", "JeanB1234@email.com")
    
    send_request("JeanB1234@email.com", "MonaW1234@email.com")
    accept_request("MonaW1234@email.com", "JeanB1234@email.com")
    
    send_request("MonaW1234@email.com", "TobA1234@email.com")
    accept_request("TobA1234@email.com", "MonaW1234@email.com")
    
    send_request("MonaW1234@email.com", "RosariaC1234@email.com")
    accept_request("RosariaC1234@email.com", "MonaW1234@email.com")
    logoff(A["token"])
    logoff(B["token"])
    logoff(C["token"])
    logoff(D["token"])
    logoff(E["token"])
    logoff(F["token"])
    logoff(G["token"])
    logoff(H["token"])
    logoff(I["token"])
    logoff(J["token"])
    
    
    '''
    ID1 = createTask(JC["token"], "Write Code C++", "Write a Program in C++", ["BobC1234@email.com"], datetime.datetime(2022, 10, 27), True)
    ID2 = createTask(JC["token"], "Write Code Python", "Write a Program in Python", ["TobA1234@email.com","JeanB1234@email.com"], datetime.datetime(2022, 11, 27), True)
    ID3 = createTask(JC["token"], "Write Code Java", "Write a Program in Java", ["BobC1234@email.com", "TobA1234@email.com", "JeanB1234@email.com"], datetime.datetime(2022, 12, 27), True)
    ID4 = createTask(JC["token"], "Write Code Golang", "Write a Program in Golang", ["JeanB1234@email.com"], None, True)
    createTask(JC["token"], "Write Code Ruby", "Write a Program in Ruby", ["JeanB1234@email.com"], None, True)
    createTask(JC["token"], "Do frontend", "Java", ["JeanB1234@email.com"], datetime.datetime(2022, 10, 23))
    createTask(Lisa["token"], "Do Backend", "Java", ["jackiecai@email.com"], datetime.datetime(2022, 7, 15), True)
    createTask(Lisa["token"], "Do Backend", "Java", ["jackiecai@email.com"], datetime.datetime(2022, 7, 10))
    '''
    '''
    project = createProject(JC["token"], "temp", "temp", ["BobC1234@email.com", "JeanB1234@email.com"])
    # return 3,4 CHeck this after the change in models rn it needs to be friends not project 
    addNewTasktoProject(project, JC["token"], "1", "1", [], None)
    addNewTasktoProject(project, Jean["token"], "2", "2", ["jackiecai@email.com"], None)
    task = addNewTasktoProject(project, Jean["token"], "3", "3", [], None, public = True)
    addNewTasktoProject(project, JC["token"], "4", "4", ["JeanB1234@email.com"], None, True)
    addNewTasktoProject(project, BC["token"], "5", "5", [], None, True)
    ret = getPublicTaskProject(BC["id"], project)
    '''