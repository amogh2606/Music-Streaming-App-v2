#----------------------------------------------------------------------#
#---- MODERN APPLICATION DEVELOPMENT - II PROJECT ----#

#----------------------------------------------------------------------#

#--------------------------22F1001411----------------------------------#

#----------------------------------------------------------------------#

from flask import Flask, session, redirect, url_for, Response,send_from_directory
from flask_cors import CORS
from flask_restful import Resource, Api

from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from celery import Celery
from flask import render_template
from flask import request
from flask_caching import Cache
from flask import jsonify
from flask import flash
from models import *
import os
from flask_session import Session
# from api import *
from flask_security import Security,SQLAlchemyUserDatastore,SQLAlchemySessionUserDatastore,auth_required,roles_required,logout_user
from flask_security.utils import hash_password
# from flask_security import register_user
from flask_security import current_user, login_required,roles_accepted,roles_required
def create_app():
    app = Flask(__name__, template_folder='templates')
    CORS(app)

    app.config['UPLOAD_DIR'] = 'uploads'
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///identifier.sqlite3'
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_TYPE"] = "filesystem"
    app.config['SECRET_KEY']="23sdfdsgsrwsfsgsf"
    app.config['SECURITY_PASSWORD_HASH'] = 'bcrypt'
    app.config['SECURITY_PASSWORD_SALT'] = 'sdfdsf4241324'
    app.config['SECURITY_REGISTERABLE'] = True
    app.config['SECURITY_SEND_REGISTER_EMAIL'] = False
    app.config['SECURITY_UNAUTHORIZED_VIEW'] = None
    app.config["WTF_CSRF_ENABLED"] = False
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'music-token'
    app.config['SECURITY_REGISTER_USER_TEMPLATE'] = 'registration.html'
    app.config['SECURITY_LOGIN_USER_TEMPLATE'] = 'login.html'
    app.config['ACCESS_CONTROL_ALLOW_ORIGIN'] = True
    app.config["WTF_CSRF_ENABLED"] = False
    app.config['MAIL_SERVER'] = 'smtp.googlemail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'xxxx@gmail.com' #replace the contents inside '' with your email id
    app.config['MAIL_PASSWORD'] = 'xxxx xxxx xxxx xxxx' #replace the contents inside '' with your mail password
    app.config['SECURITY_TRACKABLE'] = True
    app.config['SECURITY_LOGOUT_URL'] = '/logout_user'
    app.config['CACHE_TYPE'] = 'simple'
    app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
    app.config['result_backend'] = 'redis://localhost:6379/0'





    app.debug = True


    db.init_app(app)
    api = Api(app)
    app.app_context().push()
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    db.create_all()
    datastore.find_or_create_role(name='admin', description='Administrator')
    datastore.find_or_create_role(name='creator', description='Creator')
    datastore.find_or_create_role(name='user', description='User')
    admin = roles_users.query.filter_by(role_id=1).first()
    if not admin:
        admin_role = datastore.find_or_create_role(name='admin', description='Administrator')
        admin_user = datastore.create_user(email='admin@gmail.com', password=hash_password('admin'))
        datastore.add_role_to_user(admin_user, admin_role)

        db.session.commit()
    else:
        pass


    return app,api,datastore


app,api,datastore = create_app()

cache=Cache(app)

@app.route('/uploads/<path:filename>')
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/')
@cache.cached(timeout=3600)
def index():
    return render_template('index.html')
@app.route('/user_registration')
@cache.cached(timeout=3600)
def user_registration():
    return render_template('registration.html')

@app.route('/user_login')
@cache.cached(timeout=3600)
def user_login():
    return render_template('user_login.html')

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/user')
def user():
    return render_template('edit_user.html')

@app.route('/song/<int:song_id>')
def song(song_id):
    return render_template('song_page.html',id=song_id)

@app.route('/create/playlist')
def create_playlist():
    return render_template('create_playlist.html')
@app.route('/playlist/<int:playlist_id>')
def playlist(playlist_id):
    return render_template('playlist_page.html',id=playlist_id)

@app.route('/search/<string:search>')
def search(search):
    return render_template('user_search.html',search=search)
@app.route('/creator/')
def creator():
    if current_user.has_role('creator'):
        print('entered')
        return redirect('/creator/dashboard')
    else:
        return render_template('creator_register.html')

@app.route('/creator/dashboard')
def creator_dashboard():
    return render_template('creator_dashboard.html')

@app.route('/creator/create_album')
def creator_create_album():
    return render_template('create_album.html')

@app.route('/creator/song/edit/<int:song_id>')
def creator_edit_song(song_id):
    return render_template('edit_song.html')

@app.route('/upload/song')
def upload_song():
    return render_template('upload_song.html')

@app.route('/all/albums')
def all_albums():
    return render_template('all_albums.html')

@app.route('/album/<int:album_id>')
def album(album_id):
    return render_template('album_page.html',id=album_id)

@app.route('/creator/album/edit/<int:album_id>')
def creator_edit_album(album_id):
    return render_template('edit_album.html',id=album_id)

@app.route('/album/create')
def create_album():
    return render_template('create_album.html')

@app.route('/admin_login')
def admin_login():
    return render_template('admin_login.html')

@app.route('/admin/dashboard')
# @auth_required('admin')
# @roles_required('admin')
def admin_dashboard():
    return render_template('admin_dashboard.html')

@app.route('/admin/tracks')
def admin_tracks():
    return render_template('admin_tracks.html')

@app.route('/admin/albums')
def admin_albums():
    return render_template('admin_albums.html')

@app.route('/admin/users')
def admin_users():
    return render_template('admin_users.html')

@app.route('/user_logout')
def logout():
    return render_template('user_logout.html')


if __name__ == '__main__':
    app.secret_key = 'super secret key'
    from api import *
    # api.add_resource(LoginAPI, '/login')
    api.add_resource(MusicAPI, '/api/music')
    api.add_resource(MusicAPI2, '/api/music/<int:song_id>')
    api.add_resource(RatingAPI2, '/api/rating/<int:song_id>')
    api.add_resource(PlaylistAPI, '/api/playlist')
    api.add_resource(PlaylistAPI2, '/api/playlist/<int:playlist_id>')
    api.add_resource(EditPlaylistAPI, '/api/playlist/edit/<int:playlist_id>')
    api.add_resource(AlbumAPI, '/api/album/')
    api.add_resource(AllAlbumsAPI, '/api/album/all')
    api.add_resource(AlbumAPI2, '/api/album/<int:album_id>')
    api.add_resource(AlbumRenderAPI, '/api/album/render')
    api.add_resource(EditALbumAPI, '/api/album/edit/<int:album_id>')
    api.add_resource(PlaylistRenderAPI, '/api/playlist/render')
    api.add_resource(MusicRenderAPI, '/api/music/render')
    api.add_resource(CreateCreatorAPI, '/api/creator')
    api.add_resource(CreatorAPI, '/api/creator/<string:type>')
    api.add_resource(CreatorDashboardAPI, '/api/creator/dashboard')
    api.add_resource(AdminAPI, '/api/admin/<int:id>')
    api.add_resource(AdminAPI2, '/api/admin2/<string:type>')
    api.add_resource(AdminDashboardAPI, '/api/admin/dashboard')
    api.add_resource(SearchAPI, '/api/search/<string:type>/<string:search>')
    api.add_resource(UserAPI, '/api/user')
    api.add_resource(UserRegistrationAPI,'/user_register')
    api.add_resource(AcessAPI,'/api/access')



    app.run(port=9000)

