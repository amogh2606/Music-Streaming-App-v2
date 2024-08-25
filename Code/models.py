from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
db = SQLAlchemy()

class roles_users(db.Model):
    __tablename__='roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id=db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id=db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))
class User(db.Model,UserMixin):
    __tablename__='user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String, nullable=False, unique=True)
    current_login_at= db.Column(db.DateTime,default=db.func.current_timestamp(),onupdate=db.func.current_timestamp())
    password = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean)
    fs_uniquifier = db.Column(db.String(64), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='roles_users', backref=db.backref('users', lazy='dynamic'))
    last_login_at = db.Column(db.DateTime)
    current_login_ip = db.Column(db.String)
    last_login_ip = db.Column(db.String)
    login_count = db.Column(db.Integer)
    fs_token_uniquifier = db.Column(db.String(100), unique=True, nullable=False)

class Role(db.Model, RoleMixin):
    __tablename__='role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class Music(db.Model):
    __tablename__='Music'
    song_id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    song_name = db.Column(db.String, nullable=False)
    song_lyrics = db.Column(db.String)
    genre = db.Column(db.String)
    year = db.Column(db.Integer, nullable=False)
    singer = db.Column(db.String)
    song_path = db.Column(db.String, nullable=False)

class Rating(db.Model):
    __tablename__='Rating'
    rating_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    song_id = db.Column(db.Integer, db.ForeignKey('Music.song_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)

class Album(db.Model):
    __tablename__='Album'
    album_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    song_id = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    album_name = db.Column(db.String, nullable=False)
    album_created_time = db.Column(db.DateTime, default=db.func.current_timestamp())




class Playlist(db.Model):
    __tablename__='Playlist'
    playlist_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    song_id = db.Column(db.String, nullable=False)
    playlist_name = db.Column(db.String, nullable=False)

