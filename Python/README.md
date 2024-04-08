# capstone-project-3900-t11a-backendonly

## Requirements and Versions

### Using versions:

- Flask 2.1.2
- Python 3.10.4 64 bit
- Werkzeug 2.1.2
- SQLAlchemy (2.5.1)
- PYJwt (Not JWT)
- NodeJS 16.14.0
- npm 8.3.1

## How to run

### **Must be run inside Lubuntu 20.4.1 LTS virtual machine**

_Note: It is highly recommended to run the app on a widescreen monitor of resolution 1920x1080 for the optimal experience_

1. Open a terminal in the VM and update the apt, run

```
$ sudo apt update
```

2. Install pip

```
$ sudo apt install python3-pip
```

3. It is preferable that the python version is 3.10, however the program still functions with 3.8 as it is on the VM

4. Install curl to retrieve the latest version of NodeJS

```
$ sudo apt install curl
```

5. Retrieve version 16 of NodeJS and install. Run

```
$ curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

then, after retrieving, run

```
$ sudo apt-get install -y nodejs
```

6. Install Flask, Flask-SQLAlchemy and Pillow

```
$ pip install -U Flask

$ pip install -U Flask-SQLAlchemy

$ python3 -m pip install --upgrade Pillow
```

7. Update PyJWT

```
$ pip install --upgrade pyjwt
```

8. Navigate to the 'protask-ui' folder in the unpacked project folder

```
project$ cd protask-ui
```

9. Install all node js packages

```
project/protask-ui$ npm i
```

10. Open a new terminal tab and navigate to the 'project' folder. From there, run main.py

```
project$ python3 main.py
```

11. In the other terminal tab, in the 'protask-ui' folder, run the react app

```
project/protask-ui$ npm start
```

12. The app should open a window with the default browser, and may take some time to load. Once loaded, see user guide.
