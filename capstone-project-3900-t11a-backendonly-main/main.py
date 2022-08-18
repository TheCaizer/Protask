from server import create_app

app = create_app()

if __name__ == '__main__':
    # debug true so that when we change code it refresh the web sever make false
    # in production
    app.run(debug = False)