import requests
import json
from flask import Flask, jsonify, request, abort, make_response
from werkzeug.exceptions import HTTPException
from flask import make_response
from flask import flash
from flask_restful import Resource, Api, reqparse
import os
from flask_mail import Mail, Message
from celery import Celery
from app import *
from flask_security import Security,SQLAlchemyUserDatastore,SQLAlchemySessionUserDatastore,auth_required,roles_required,verify_password
import matplotlib.pyplot as plt
from models import *
from flask import Flask, request, jsonify
from flask_security import current_user
from datetime import datetime , timedelta
from celery.schedules import crontab
from app import app
from sqlalchemy import func
from flask_caching import Cache
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table
from reportlab.platypus import TableStyle
from reportlab.lib import colors
cache = Cache(app)

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'],include=['app','api'])
celery.conf.update(app.config)
celery.conf.timezone = 'Asia/Kolkata'
mail = Mail(app)


@celery.task
def send_congratulations_email(user_email):
    msg = Message('Congratulations!',
                  sender=app.config['MAIL_USERNAME'],
                  recipients=[user_email])
    msg.body = 'Congrats! You are now a creator.'
    with app.app_context():
        mail.send(msg)
    return 'Email sent successfully!'

class UserNotFoundError():
    def __init__(self, status_code):
        self.response = make_response({'error': 'User not found'}, status_code)

class SongNotFoundError():
    def __init__(self, status_code):
        self.response = make_response({'error': 'Song not found'}, status_code)



class UserRegistrationAPI(Resource):
    def post(self):
        data = request.get_json()
        email = data['email']
        password = data['password']
        password_confirm = data['password_confirm']
        user=User.query.filter_by(email=email).first()
        if user:
            return {"error": "User already exists"},400
        if password == password_confirm:
            user = datastore.create_user(email=email, password=hash_password(password),last_login_at=db.func.current_timestamp(),current_login_at=db.func.current_timestamp(),login_count=1,active=True,current_login_ip=request.remote_addr,last_login_ip=request.remote_addr)
            datastore.add_role_to_user(user, 'user')
            db.session.commit()
            return {"message": "User registered successfully"},200
        else:
            return {"error": "Passwords do not match"},400

def get_top_five_songs_by_rating():
    songs = Music.query.all()
    if songs is None:
        return "No songs to display"
    l={}
    for song in songs:
        if RatingAPI.get_by_id(song.song_id)!=0:
            l[song.song_name]=RatingAPI.get_by_id(song.song_id)
    l=sorted(l.items(), key=lambda x: x[1], reverse=True)
    return l[:5]


class MusicAPI(Resource):
    def get(self):
        songs = Music.query.all()
        if songs is None:
            return "No songs to display"
        l=[]
        for song in songs:
            d = {}
            d['song_id']=song.song_id
            d['song_name']=song.song_name
            d['song_lyrics']=song.song_lyrics
            d['genre']=song.genre
            d['year']=song.year
            d['singer']=song.singer
            d['song_path']=song.song_path
            l.append(d)
        return l
    @auth_required('token')
    @roles_required('creator')
    def post(self):
        id=current_user.id
        # print(id)
        data=request.form
        post_query = db.session.query(Music).filter(
            (Music.song_name == data.get('song_name')) & (Music.user_id == id)).first()
        if post_query:
            return make_response(jsonify("Song already exists"), 409)
        else:
            # song = file
            song= request.files['song']
            song.save(os.path.join(app.config['UPLOAD_DIR'], str(id)+song.filename))
            song_path = os.path.join(app.config['UPLOAD_DIR'], str(id)+song.filename)
            # with open(os.path.join(app.config['UPLOAD_DIR'], song.filename), 'rb') as f:
            #     song_blob = f.read()
            music = Music(user_id=id, song_name=data.get('song_name'), song_lyrics=data.get('song_lyrics'),
                          genre=data.get('genre'), singer=data.get('singer'),
                          year=data.get('year'), song_path=song_path )
            db.session.add(music)
            db.session.commit()
            rating=Rating(user_id=id,song_id=music.song_id,rating=2.5)
            db.session.add(rating)
            db.session.commit()

            # os.remove(os.path.join(app.config['UPLOAD_DIR'], song.filename))
            return jsonify("Song added")

    @staticmethod
    def get_by_id(song_id):
        song = Music.query.filter_by(song_id=song_id).first()
        if song is None:
            return 0
        return song



def album_and_playlist_sanity_check_on_song_deletion(song_id):
    playlists=Playlist.query.all()
    albums=Album.query.all()
    for playlist in playlists:
        song_id_list = playlist.song_id.split(' ')
        if song_id in song_id_list:
            song_id_list.remove(song_id)
        if len(song_id_list)==0:
            db.session.delete(playlist)
    for album in albums:
        song_id_list = album.song_id.split(' ')
        if song_id in song_id_list:
            song_id_list.remove(song_id)
        if len(song_id_list)==0:
            db.session.delete(album)

class MusicAPI2(Resource):

    def get(self, song_id):
        song = Music.query.filter_by(song_id=song_id).first()
        if song is None:
            abort(404)
        d = {}
        d['song_id']=song.song_id
        d['song_name']=song.song_name
        d['song_lyrics']=song.song_lyrics
        d['genre']=song.genre
        d['year']=song.year
        d['singer']=song.singer
        d['song_path']=song.song_path
        return d

    @auth_required('token')
    @roles_required('creator')
    def put(self, song_id):
        put_query = db.session.query(Music).filter(Music.song_id == song_id).first()
        if put_query.user_id == current_user.id:
            put_query.song_name = request.form['song_name']
            put_query.song_lyrics = request.form['song_lyrics']
            put_query.genre = request.form['genre']
            put_query.year = request.form['year']
            put_query.singer = request.form['singer']
            db.session.commit()
            return jsonify({'message':"Song updated"})
        else:
            return make_response(jsonify("Song does not exist"), 404)




    @auth_required('token')
    @roles_accepted('creator','admin')
    def delete(self, song_id):
        song = Music.query.filter_by(song_id=song_id).first()
        if song is None:
            abort(404)
        if current_user.has_role('admin'):
            os.remove(song.song_path)
            album_and_playlist_sanity_check_on_song_deletion(song_id)
            db.session.delete(song)
            db.session.commit()
            return jsonify("Song deleted")
        if song.user_id != current_user.id:
            return make_response(jsonify("Unauthorized"), 401)
        os.remove(song.song_path)
        album_and_playlist_sanity_check_on_song_deletion(song_id)
        db.session.delete(song)
        db.session.commit()

        return jsonify("Song deleted")


# class RatingAPI(Resource):

class RatingAPI():
    @staticmethod
    def get_by_id(song_id):
        ratings = Rating.query.filter_by(song_id=song_id).all()
        if ratings is None:
            return 0
        total = 0
        for rating in ratings:
            total += rating.rating
        # return 0
        return total / len(ratings)

class RatingAPI2(Resource):
    def get(self, song_id):
        ratings = Rating.query.filter_by(song_id=song_id).all()
        if ratings is None:
            return 0
        total = 0
        for rating in ratings:
            total += rating.rating
        return total/len(ratings)

    @auth_required('token')
    def post(self, song_id):
        id=current_user.id
        data=request.json
        post_query = db.session.query(Rating).filter(
            (Rating.song_id == song_id) & (Rating.user_id == id)).first()
        if post_query:
            post_query.rating = data.get('rating')
            db.session.commit()
            return jsonify("Rating updated")
        else:
            rating = Rating(user_id=id, song_id=song_id, rating=data.get('rating'))
            db.session.add(rating)
            db.session.commit()
            return jsonify("Rating added")

    @auth_required('token')
    def put(self, song_id):
        id=current_user.id
        put_query = db.session.query(Rating).filter(
            (Rating.song_id == song_id) & (Rating.user_id == id)).first()
        if put_query:
            put_query.rating = request.form['rating']
            db.session.commit()
            return jsonify("Rating updated")
        else:
            return make_response(jsonify("Rating does not exist"), 404)

    @auth_required('token')
    def delete(self, song_id):
        id=current_user.id
        rating = Rating.query.filter_by(song_id=song_id, user_id=id).first()
        if rating is None:
            abort(404)
        db.session.delete(rating)
        db.session.commit()
        return jsonify("Rating deleted")


def songs_in_playlist(playlist_id):
    playlist = Playlist.query.filter_by(playlist_id=playlist_id).first()
    song_id_list = playlist.song_id.split(' ')
    return song_id_list

def songs_not_in_playlist(playlist_id):
    song_id_list = songs_in_playlist(playlist_id)
    songs = Music.query.all()
    song_id_list = [int(i) for i in song_id_list]
    songs_not_in_playlist = [song for song in songs if song.song_id not in song_id_list]
    songs_not_in_playlist_id = [song.song_id for song in songs_not_in_playlist]
    return songs_not_in_playlist_id

def songs_in_album(album_id):
    album = Album.query.filter_by(album_id=album_id).first()
    song_id_list = album.song_id.split(' ')
    return song_id_list

def songs_not_in_album(album_id,user_id):
    song_id_list = songs_in_album(album_id)
    songs = Music.query.filter_by(user_id=user_id).all()
    song_id_list = [int(i) for i in song_id_list]
    songs_not_in_album = [song for song in songs if song.song_id not in song_id_list]
    songs_not_in_album_id = [song.song_id for song in songs_not_in_album]
    return songs_not_in_album_id

def construct_list_of_song_dictionaries(playlist_id):
        playlist = Playlist.query.filter_by(playlist_id=playlist_id).first()
        song_id_list = playlist.song_id.split(' ')
        list_of_song_dict = []
        for song_id in song_id_list:
            song_dict = {}
            song = MusicAPI.get_by_id(song_id)
            song_dict['song_id'] = song.song_id
            song_dict['song_name'] = song.song_name
            song_dict['song_lyrics'] = song.song_lyrics
            song_dict['genre'] = song.genre
            song_dict['song'] = song.song
            song_dict['rating'] = song.rating
            song_dict['year'] = song.year
            song_dict['singer'] = song.singer
            list_of_song_dict.append(song_dict)

        return list_of_song_dict
class PlaylistAPI(Resource):

    def get(self):
        id=current_user.id
        playlists = Playlist.query.filter_by(user_id=id).all()
        if playlists is None:
            return "No playlists to display"
        l=[]
        for playlist in playlists:
            d = {}
            d['playlist_id']=playlist.playlist_id
            d['user_id']=playlist.user_id
            d['songs']=construct_list_of_song_dictionaries(playlist.playlist_id)
            d['playlist_name']=playlist.playlist_name
            l.append(d)
        return l

    @auth_required('token')
    def post(self):
        id = current_user.id
        data = request.get_json()
        playlist_name = data['name']
        song_dict = data['songs']
        song_id_list = []
        for key in song_dict:
            if song_dict[key] == True:
                song_id_list.append(key)

        song_id_str = ' '.join([str(elem) for elem in song_id_list])
        post_query = db.session.query(Playlist).filter(Playlist.playlist_name == playlist_name).first()
        if post_query:
            return make_response(jsonify("Playlist already exists"), 409)
        else:

            playlist = Playlist(user_id=id, song_id=song_id_str, playlist_name=playlist_name)
            db.session.add(playlist)
            db.session.commit()
            return jsonify("Playlist added"),200

class PlaylistAPI2(Resource):
    def get(self, playlist_id):
        user_id = 14
        # user_id=request.args.get('user_id')
        playlist = Playlist.query.filter_by(playlist_id=playlist_id).first()
        if playlist is None:
            abort(404)
        d = {}
        song_id_list = [int(id) for id in playlist.song_id.split(" ")]
        songs = []
        for song in song_id_list:
            song_dict = {}
            song = MusicAPI.get_by_id(song)
            song_dict['song_id'] = song.song_id
            song_dict['song_name'] = song.song_name
            song_dict['song_lyrics'] = song.song_lyrics
            song_dict['genre'] = song.genre
            song_dict['song_path'] = song.song_path
            # song_dict['rating'] = song.rating
            song_dict['year'] = song.year
            song_dict['singer'] = song.singer
            songs.append(song_dict)

        # print(playlist.playlist_id)
        # print(construct_list_of_song_dictionaries(playlist.playlist_id))
        d['playlist_id'] = playlist.playlist_id
        d['user_id'] = playlist.user_id
        d['songs'] = songs
        d['playlist_name'] = playlist.playlist_name
        return d

    # print(playlists)


    def put(self, playlist_id):
        id = current_user.id
        # print(id)
        data = request.get_json()
        playlist_name = data['name']
        song_dict = data['songs']
        song_id_list = []
        for key in song_dict:
            if song_dict[key] == True:
                song_id_list.append(key)
        # print(song_id_list)
        song_id_str = ' '.join([str(elem) for elem in song_id_list])
        put_query = db.session.query(Playlist).filter(Playlist.playlist_id == playlist_id).first()
        if put_query.user_id == id:
            put_query.playlist_name = playlist_name
            put_query.song_id = song_id_str
            db.session.commit()
            validity_query = db.session.query(Playlist).filter(Playlist.playlist_id == playlist_id).first()
            if validity_query.song_id == '':
                db.session.delete(validity_query)
                db.session.commit()
                return jsonify("Playlist deleted")
            return jsonify("Playlist updated")

        # print(song_id_str)
        # playlist = Playlist(user_id=id, song_id=song_id_str, playlist_name=playlist_name)
        # db.session.add(playlist)
        # db.session.commit()
        # return jsonify("Playlist added")

    def delete(self, playlist_id):
        playlist = Playlist.query.filter_by(playlist_id=playlist_id).first()
        if playlist is None:
            abort(404)
        db.session.delete(playlist)
        db.session.commit()
        return jsonify("Playlist deleted")


class EditPlaylistAPI(Resource):
    @auth_required('token')
    def get(self, playlist_id):
        songs1=songs_in_playlist(playlist_id)

        songs2=songs_not_in_playlist(playlist_id)

        d={}
        l1=[]
        l2=[]
        for song in songs1:
            song_dict = {}
            song = MusicAPI.get_by_id(song)
            song_dict['song_id'] = song.song_id
            song_dict['song_name'] = song.song_name
            song_dict['song_lyrics'] = song.song_lyrics
            song_dict['genre'] = song.genre
            song_dict['song_path'] = song.song_path
            # song_dict['rating'] = song.rating
            song_dict['year'] = song.year
            song_dict['singer'] = song.singer
            l1.append(song_dict)
        for song in songs2:
            song_dict = {}
            song = MusicAPI.get_by_id(song)
            song_dict['song_id'] = song.song_id
            song_dict['song_name'] = song.song_name
            song_dict['song_lyrics'] = song.song_lyrics
            song_dict['genre'] = song.genre
            song_dict['song_path'] = song.song_path
            # song_dict['rating'] = song.rating
            song_dict['year'] = song.year
            song_dict['singer'] = song.singer
            l2.append(song_dict)
        d['songs_in_playlist']=l1
        d['songs_not_in_playlist']=l2
        return d

class AllAlbumsAPI(Resource):
    def get(self):
        albums = Album.query.all()
        if albums is None:
            return "No albums to display"
        l=[]
        for album in albums:
            d = {}
            d['album_id']=album.album_id
            d['user_id']=album.user_id
            d['song_id']=album.song_id
            d['album_name']=album.album_name
            l.append(d)
        return l
class AlbumAPI(Resource):

    @auth_required('token')
    def get(self):
        id=current_user.id
        # print(id)
        songs=Music.query.filter_by(user_id=id).all()
        # print(songs)
        if songs is None:
            return "No songs to display"
        l=[]
        for song in songs:
            d = {}
            d['song_id']=song.song_id
            d['song_name']=song.song_name
            d['song_lyrics']=song.song_lyrics
            d['genre']=song.genre
            d['year']=song.year
            d['singer']=song.singer
            d['song_path']=song.song_path
            l.append(d)

        return l

    @auth_required('token')
    @roles_required('creator')
    def post(self):
        id=current_user.id
        # print(id)
        data=request.get_json()
        album_name=data['name']
        song_dict=data['songs']
        song_id_list=[]
        for key in song_dict:
            if song_dict[key]==True:
                song_id_list.append(key)
        # print(song_id_list)
        song_id_str = ' '.join([str(elem) for elem in song_id_list])
        # print(song_id_str)
        post_query = db.session.query(Album).filter(
            (Album.album_name == album_name) & (Album.user_id == id)).first()
        if post_query:
            return make_response(jsonify("Album already exists"), 409)
        else:
            album = Album(user_id=id, song_id=song_id_str, album_name=album_name)
            db.session.add(album)
            db.session.commit()
            return jsonify("Album added")

class AlbumAPI2(Resource):
    def get(self, album_id):
        album = db.session.query(Album).filter(Album.album_id == album_id).first()
        # print(album)
        if album is None:
            abort(404)
        songs = []
        song_id_list = [int(id) for id in album.song_id.split(" ")]
        # print(song_id_list)
        for song in song_id_list:
            song_dict = {}
            song = MusicAPI.get_by_id(song)
            song_dict['song_id'] = song.song_id
            song_dict['song_name'] = song.song_name
            song_dict['song_lyrics'] = song.song_lyrics
            song_dict['genre'] = song.genre
            song_dict['song_path'] = song.song_path
            # song_dict['rating'] = song.rating
            song_dict['year'] = song.year
            song_dict['singer'] = song.singer
            songs.append(song_dict)
        # print(songs)

        d = {}
        d['album_id']=album.album_id
        d['user_id']=album.user_id
        d['album_name']=album.album_name
        d['songs'] = songs
        return d

    @auth_required('token')
    @roles_required('creator')
    def put(self,album_id):
        id = current_user.id
        # print(id)
        data = request.get_json()
        album_name = data['name']
        song_dict = data['songs']
        song_id_list = []
        for key in song_dict:
            if song_dict[key] == True:
                song_id_list.append(key)
        # print(song_id_list)
        song_id_str = ' '.join([str(elem) for elem in song_id_list])
        # print(song_id_str)
        put_query = db.session.query(Album).filter(Album.album_id == album_id).first()
        if put_query.user_id == id:
            put_query.album_name = album_name
            put_query.song_id = song_id_str
            db.session.commit()
            validity_query = db.session.query(Album).filter(Album.album_id == album_id).first()
            if validity_query.song_id == '':
                db.session.delete(validity_query)
                db.session.commit()
                return jsonify("Album deleted")
            # print('Album updated')
            return jsonify("Album updated")
        else:
            return make_response(jsonify("Album does not exist"), 404)
    @auth_required('token')
    @roles_accepted('creator','admin')
    def delete(self, album_id):
        album = Album.query.filter_by(album_id=album_id).first()
        if album is None:
            abort(404)
        db.session.delete(album)
        db.session.commit()
        return jsonify("Album deleted")


class EditALbumAPI(Resource):
    @auth_required('token')
    def get(self, album_id):
        songs1=songs_in_album(album_id)
        songs2=songs_not_in_album(album_id,current_user.id)
        d={}
        l1=[]
        l2=[]
        for song in songs1:
            song_dict = {}
            song = MusicAPI.get_by_id(song)
            song_dict['song_id'] = song.song_id
            song_dict['song_name'] = song.song_name
            song_dict['song_lyrics'] = song.song_lyrics
            song_dict['genre'] = song.genre
            song_dict['song_path'] = song.song_path
            # song_dict['rating'] = song.rating
            song_dict['year'] = song.year
            song_dict['singer'] = song.singer
            l1.append(song_dict)
        for song in songs2:
            song_dict = {}
            song = MusicAPI.get_by_id(song)
            song_dict['song_id'] = song.song_id
            song_dict['song_name'] = song.song_name
            song_dict['song_lyrics'] = song.song_lyrics
            song_dict['genre'] = song.genre
            song_dict['song_path'] = song.song_path
            # song_dict['rating'] = song.rating
            song_dict['year'] = song.year
            song_dict['singer'] = song.singer
            l2.append(song_dict)
        d['songs_in_album']=l1
        d['songs_not_in_album']=l2
        d['album_name']=Album.query.filter_by(album_id=album_id).first().album_name
        return d

class AlbumRenderAPI(Resource):
    def get(self):
        albums = db.session.query(Album).limit(5).all()
        if albums is None:
            abort(404)
        l=[]
        for album in albums:
            d = {}
            d['album_id']=album.album_id
            d['user_id']=album.user_id
            d['song_id']=album.song_id
            d['album_name']=album.album_name
            l.append(d)

        return l

class PlaylistRenderAPI(Resource):
    @auth_required('token')
    def get(self):
        id=current_user.id
        playlists = Playlist.query.filter_by(user_id=id).limit(5).all()
        if playlists is None:
            abort(404)
        l=[]
        for playlist in playlists:
            d = {}
            d['playlist_id']=playlist.playlist_id
            d['user_id']=playlist.user_id
            d['song_id']=playlist.song_id
            d['playlist_name']=playlist.playlist_name
            l.append(d)
        return l


class MusicRenderAPI(Resource):
    @auth_required('token')
    def get(self):
        songs = Music.query.all()

        top_5_songs = sorted(songs, key=lambda song: RatingAPI.get_by_id(song.song_id), reverse=True)[:5]

        song_details = []

        for song in top_5_songs:
            song_dict = {
                'song_id': song.song_id,
                'song_name': song.song_name,
                'song_lyrics': song.song_lyrics,
                'genre': song.genre,
                'year': song.year,
                'singer': song.singer,
                'song_path': song.song_path,
                'rating': RatingAPI.get_by_id(song.song_id)
            }
            song_details.append(song_dict)

        return song_details




class CreateCreatorAPI(Resource):
    @auth_required('token')
    def patch(self):
        id=current_user.id
        # print(id)
        user = User.query.filter_by(id=id).first()
        # print(user)
        creator=Role.query.filter_by(name='creator').first()
        datastore.add_role_to_user(user, creator)
        db.session.commit()
        send_congratulations_email.delay(user.email)
        return "Role changed to creator"

class CreatorAPI(Resource):
    @auth_required('token')
    def get(self,type):
        if type=="songs":
            id=current_user.id
            music = Music.query.filter_by(user_id=id).all()
            if music is None:
                return "No songs to display"
            l=[]
            for song in music:
                d = {}
                d['song_id']=song.song_id
                d['song_name']=song.song_name
                d['song_lyrics']=song.song_lyrics
                d['genre']=song.genre
                d['year']=song.year
                d['singer']=song.singer
                d['song_path']=song.song_path
                l.append(d)
            return l
        if type=="albums":
            id=current_user.id
            albums = Album.query.filter_by(user_id=id).all()
            if albums is None:
                return "No albums to display"
            l=[]
            for album in albums:
                d = {}
                d['album_id']=album.album_id
                d['user_id']=album.user_id
                d['song_id']=album.song_id
                d['album_name']=album.album_name
                l.append(d)
            return l



class AdminAPI(Resource):
    @auth_required('token')
    def get(self,id):
        user = User.query.get(id)
        if user.active == False:
            return False
        else:
            return True

    @auth_required('token')
    @roles_required('admin')
    def patch(self,id):
        user = User.query.get(id)
        if user:
            if user.active == False:
                user.active = True
                db.session.commit()
                return "User activated"
            else:
                user.active = False
                db.session.commit()
                return "User deactivated"
        else:
            return "User not found"


    @auth_required('token')
    @roles_required('admin')
    def delete(self,id):
        user = User.query.get(id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return "User deleted"
        else:
            return "User not found"

class AdminAPI2(Resource):
    @auth_required('token')
    def get(self,type):
        if type=='users':
            users=User.query.all()
            if users is None:
                return "No users to display"
            l=[]
            for user in users:
                d = {}
                d['id']=user.id
                d['email']=user.email
                d['active']=user.active
                d['username']=user.email
                l.append(d)
            return l

        if type=='songs':
            songs=Music.query.all()
            if songs is None:
                return "No songs to display"
            l=[]
            for song in songs:
                d = {}
                d['song_id']=song.song_id
                d['song_name']=song.song_name
                d['song_lyrics']=song.song_lyrics
                d['genre']=song.genre
                d['year']=song.year
                d['singer']=song.singer
                d['song_path']=song.song_path
                l.append(d)
            return l

        if type=='albums':
            albums=Album.query.all()
            if albums is None:
                return "No albums to display"
            l=[]
            for album in albums:
                d = {}
                d['album_id']=album.album_id
                d['user_id']=album.user_id
                d['song_id']=album.song_id
                d['album_name']=album.album_name
                l.append(d)
            return l



class AdminGraphAPI:
    @staticmethod
    @cache.cached(timeout=60)
    def song_vs_rating():
        songs = Music.query.all()
        if songs is None:
            return "No songs to display"
        x=[]
        y=[]
        for song in songs:
            x.append(song.song_name)
            y.append(RatingAPI.get_by_id(song.song_id))
        plt.bar(x,y, color='green')
        plt.xlabel('Songs')
        plt.ylabel('Ratings')
        plt.title('Songs vs Ratings')
        # plt.show()
        plt.savefig('code/static/song_vs_rating.png', dpi=70, bbox_inches='tight')
        plt.close()
        return '/static/song_vs_rating.png'

    @staticmethod
    @cache.cached(timeout=60)
    def genre_vs_rating():

        songs = Music.query.all()


        genre_ratings = {}


        for song in songs:
            genre = song.genre
            rating = RatingAPI.get_by_id(song.song_id)


            if genre in genre_ratings:
                genre_ratings[genre].append(rating)
            else:
                genre_ratings[genre] = [rating]


        average_ratings = {genre: sum(ratings) / len(ratings) for genre, ratings in genre_ratings.items()}


        plt.bar(average_ratings.keys(), average_ratings.values(), color='red')
        plt.xlabel('Genres')
        plt.ylabel('Average Ratings')
        plt.title('Genres vs Average Ratings')
        plt.savefig('code/static/genre_vs_rating.png', dpi=70, bbox_inches='tight')
        plt.close()
        return '/static/genre_vs_rating.png'

    @staticmethod
    @cache.cached(timeout=60)
    def user_vs_uploads():
        users = User.query.all()

        #
        emails = []
        upload_counts = []


        for user in users:
            if user.id==1:
                pass
            else:
                upload_count = Music.query.filter_by(user_id=user.id).count()
                emails.append(user.email)
                upload_counts.append(upload_count)


        sorted_indices = sorted(range(len(upload_counts)), key=lambda i: upload_counts[i], reverse=True)


        top_5_indices = sorted_indices[:5]


        plt.bar([emails[i] for i in top_5_indices], [upload_counts[i] for i in top_5_indices])
        plt.xlabel('Users')
        plt.ylabel('Number of Uploads')
        plt.title('Top 5 Users with Most Uploads')
        plt.savefig('code/static/user_vs_uploads.png', dpi=70, bbox_inches='tight')
        plt.close()

    @staticmethod
    @cache.cached(timeout=60)
    def user_vs_playlist():
        users=User.query.all()
        if users is None:
            return "No users to display"
        m=[]
        for user in users:
            if user.id==1:
                pass
            else:
                playlists = Playlist.query.filter_by(user_id=user.id).all()

                class graph():
                    def __init__(self, email, playlist_count):
                        self.email = email
                        self.playlist_count = playlist_count

                z = graph(email=user.email, playlist_count=len(playlists))
                m.append(z)
        m.sort(key=lambda y: y.playlist_count, reverse=True)

        f = []
        g = []
        for i in range(min(5, len(m))):
            f.append(m[i].email)
            g.append(m[i].playlist_count)
        plt.bar(f,g, color='cyan')
        plt.xlabel('Users')
        plt.ylabel('Playlists')
        plt.title('Users vs Playlists')
        # plt.show()
        plt.savefig('code/static/user_vs_playlist.png', dpi=70, bbox_inches='tight')
        plt.close()
        return '/static/user_vs_playlist.png'


class AdminDashboardAPI(Resource):
    @auth_required('token')
    @roles_required('admin')

    def get(selfself):
        d = {}

        users = User.query.all()
        if users is None:
            d['no_of_users'] = 0
        else:
            d['no_of_users'] = (len(users)-1)

        songs = Music.query.all()
        if songs is None:
            d['no_of_songs'] = 0
        else:
            d['no_of_songs'] = (len(songs))

        albums = Album.query.all()
        if albums is None:
            d['no_of_albums'] = 0
        else:
            d['no_of_albums'] = (len(albums))

        creators = Role.query.filter_by(name='creator').all()
        if creators is None:
            d['no_of_creators'] = 0
        else:
            d['no_of_creators'] = (len(creators))

        genres = Music.query.with_entities(Music.genre).distinct().all()
        if genres is None:
            d['no_of_genres'] = 0
        else:
            d['no_of_genres'] = (len(genres))

        d['path_of_song_vs_rating'] = AdminGraphAPI.song_vs_rating()
        d['path_of_genre_vs_rating'] = AdminGraphAPI.genre_vs_rating()
        d['path_of_user_vs_uploads'] = AdminGraphAPI.user_vs_uploads()
        d['path_of_user_vs_playlist'] = AdminGraphAPI.user_vs_playlist()

        return d

class CreatorDashboardAPI(Resource):
    @auth_required('token')
    @roles_required('creator')
    def get(self):
        data={}

        id = current_user.id
        songs = Music.query.filter_by(user_id=id).all()
        if songs is None:
            data['n']=0
        data['n']=len(songs)


        albums = Album.query.filter_by(user_id=id).all()
        if albums is None:
            data['a']=0
        data['a']=len(albums)

        songs = Music.query.filter_by(user_id=id).all()
        if songs is None:
            data['r']=0
        total = 0
        for song in songs:
            total += RatingAPI.get_by_id(song.song_id)
            if total==0:
                data['r']=0
            else:
                data['r']=round((total/len(songs)) ,1)

        return data

def search_by_song_name(song_name):
    songs = Music.query.filter(Music.song_name.like('%'+song_name+'%')).all()
    if songs is None:
        return ""
    l=[]
    for song in songs:
        d = {}
        d['song_id']=song.song_id
        d['song_name']=song.song_name
        d['song_lyrics']=song.song_lyrics
        d['genre']=song.genre
        d['year']=song.year
        d['singer']=song.singer
        d['song_path']=song.song_path
        l.append(d)
    return l

def search_by_albums(album_name):
    albums = Album.query.filter(Album.album_name.like('%'+album_name+'%')).all()
    if albums is None:
        return ""
    l=[]
    for album in albums:
        d = {}
        d['album_id']=album.album_id
        d['user_id']=album.user_id
        d['song_id']=album.song_id
        d['album_name']=album.album_name
        l.append(d)
    return l

def search_by_playlist(playlist_name,id):
    playlists = Playlist.query.filter(Playlist.playlist_name.like('%'+playlist_name+'%')).all()
    if playlists is None:
        return ""
    l=[]
    for playlist in playlists:
        if playlist.user_id==id:
            d = {}
            d['playlist_id']=playlist.playlist_id
            d['user_id']=playlist.user_id
            d['song_id']=playlist.song_id
            d['playlist_name']=playlist.playlist_name
            l.append(d)
        else:
            return ""
    return l

def search_by_email(email):
    users = User.query.filter(User.email.like('%'+email+'%')).all()
    if users is None:
        return "No users to display"
    l=[]
    for user in users:
        d = {}
        d['id']=user.id
        d['email']=user.email
        d['active']=user.active
        d['username']=user.email
        l.append(d)
    return l

class SearchAPI(Resource):
    @auth_required('token')
    def get(selfself,type,search):
        if type=='user':
            id=current_user.id
            d={}
            d['songs']=search_by_song_name(search)
            d['albums']=search_by_albums(search)
            d['playlists']=search_by_playlist(search,id)
            return d

        if type=='admin':
            d={}
            d['songs']=search_by_song_name(search)
            d['albums']=search_by_albums(search)
            d['playlists']=search_by_playlist(search)
            d['users']=search_by_email(search)
            return d

class AcessAPI(Resource):
    @auth_required('token')
    def post(self):
        id=current_user.id
        user_role = roles_users.query.filter_by(user_id=id).order_by(roles_users.id.desc()).first()
        if user_role.role_id==1:
            return jsonify({'access':'Admin'})
        if user_role.role_id==2:
            return jsonify({'access':'Creator'})
        if user_role.role_id==3:
            return jsonify({'access':"User"})

    @auth_required('token')
    def get(self):
        id=current_user.id
        user=User.query.filter_by(id=id).first()
        if user.active==True:
            return jsonify({'active':'True'})
        else:
            return jsonify({'active':'False'})


class UserAPI(Resource):
    @auth_required('token')
    def get(self):
        id=current_user.id
        user = User.query.get(id)
        if user is None:
            abort(404)
        d = {}
        d['id']=user.id
        d['email']=user.email
        d['active']=user.active
        d['password']=user.password
        return d

    @auth_required('token')
    def put(self):
        id=current_user.id
        user = User.query.get(id)
        if user:
            user.email = request.json['email']
            user.password = hash_password(request.json['password'])

            db.session.commit()
            return "User updated"


    @auth_required('token')
    def delete(self):
        id=current_user.id
        user = User.query.get(id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return "User deleted"
        else:
            return "User not found"



@celery.task(name='users_not_logged_in_last_24_hours')
def users_not_logged_in_last_24_hours():
    all_users = User.query.all()
    # users_not_logged_in = []
    #
    # for user in all_users:
    #     if user.current_login_at is not None:
    #         time_difference = datetime.now() - user.current_login_at
    #         if time_difference > timedelta(hours=24):
    #             users_not_logged_in.append(user)
    #     else:
    #         users_not_logged_in.append(user)
    # for user in users_not_logged_in:
    #     msg = Message('Login to app',
    #                   sender=app.config['MAIL_USERNAME'],
    #                   recipients=[user.email])
    #     msg.body = 'You did not login to app'
    #     with app.app_context():
    #         mail.send(msg)
    for user in all_users:
        msg = Message('Login to app',
                      sender=app.config['MAIL_USERNAME'],
                      recipients=[user.email])
        msg.body = 'You forgot to login to your favourite music streaming app'
        with app.app_context():
            mail.send(msg)
    return 'Emails sent successfully!'


def creator_report(user_id):
    songs = Music.query.filter_by(user_id=user_id).all()
    avg_rating = 0
    if len(songs)==0:
        return "You have not uploaded any songs yet!"
    for song in songs:
        avg_rating += RatingAPI.get_by_id(song.song_id)
    avg_rating = avg_rating / len(songs)
    return avg_rating


def albums_created_in_last_30_days(user_id):
    thirty_days_ago = datetime.now() - timedelta(days=30)
    albums = Album.query.filter(Album.user_id == user_id, Album.album_created_time >= thirty_days_ago).all()

    album_list = []
    if len(albums)==0:
        return "You have not created any albums in last 30 days!"
    for album in albums:
        album_list.append(album.album_name)

    return album_list


def songs_uploaded_in_last_30_days(user_id):
    thirty_days_ago = datetime.now() - timedelta(days=30)
    songs = Music.query.filter(Music.user_id == user_id, Music.song_created_time >= thirty_days_ago).all()

    song_list = []
    for song in songs:
        song_dict = {
            'song_id': song.song_id,
            'song_name': song.song_name,
            'song_lyrics': song.song_lyrics,
            'genre': song.genre,
            'year': song.year,
            'singer': song.singer,
            'song_path': song.song_path,
            'song_created_time': song.song_created_time
        }
        song_list.append(song_dict)

    return song_list


def graph_of_song_vs_rating(user_id):
    songs = Music.query.filter_by(user_id=user_id).all()
    song_names = [song.song_name for song in songs]
    ratings = [RatingAPI.get_by_id(song.song_id) for song in songs]
    plt.bar(song_names, ratings)
    plt.xlabel('Song Name')
    plt.ylabel('Rating')
    plt.title('Song vs Rating')
    plt.show()
    plt.savefig('report/song_vs_rating' + str(user_id) + '.png')
    plt.close()


def graph_of_genre_vs_rating(user_id):
    songs = Music.query.filter_by(user_id=user_id).all()
    genres = [song.genre for song in songs]
    ratings = [RatingAPI.get_by_id(song.song_id) for song in songs]
    plt.bar(genres, ratings)
    plt.xlabel('Genre')
    plt.ylabel('Rating')
    plt.title('Genre vs Rating')
    # plt.show()
    plt.savefig('report/genre_vs_rating' + str(user_id) + '.png')
    plt.close()


def create_pdf_report(user_id):
    # !pip install reportlab
    # graph_of_song_vs_rating(user_id)
    # graph_of_genre_vs_rating(user_id)

    doc = SimpleDocTemplate("report/report"+str(user_id)+".pdf", pagesize=letter,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    Story = []

    styles = getSampleStyleSheet()

    # Add title
    Story.append(Paragraph("Monthly Report", styles['Title']))

    # Add space
    Story.append(Spacer(1, 12))

    # Add creator report
    creator_report_data = creator_report(user_id)
    Story.append(Paragraph("Average Rating: " + str(creator_report_data), styles['Normal']))

    # Add space
    Story.append(Spacer(1, 12))

    albums_data = albums_created_in_last_30_days(user_id)
    Story.append(Paragraph("Names of albums created in last 30 days: " + ', '.join(albums_data), styles['Normal']))


    Story.append(Spacer(1, 12))

    Story.append(Spacer(1, 12))

    songs = Music.query.filter_by(user_id=user_id).all()

    data = [["Song Name", "Rating"]]
    for song in songs:
        rating = RatingAPI.get_by_id(song.song_id)
        data.append([song.song_name, rating])


    table = Table(data)
    style = TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ])

    table.setStyle(style)

    Story.append(table)

    Story.append(Spacer(1, 12))

    genre_ratings = {}
    for song in songs:
        rating = RatingAPI.get_by_id(song.song_id)
        if song.genre in genre_ratings:
            genre_ratings[song.genre].append(rating)
        else:
            genre_ratings[song.genre] = [rating]


    average_ratings = {genre: sum(ratings) / len(ratings) for genre, ratings in genre_ratings.items()}

    data2 = [["Genre", "Average Rating"]]
    for genre, avg_rating in average_ratings.items():

        data2.append([genre, avg_rating])

    table2 = Table(data2)
    table2.setStyle(style)

    Story.append(table2)

    doc.build(Story)


    return 'report/report'+str(user_id)+'.pdf'


def get_email_id(user_id):
    user = User.query.filter_by(id=user_id).first()
    return user.email



@celery.task(name='monthly_report')
def monthly_report():
    creators = roles_users.query.filter_by(role_id=2).all()
    for creator in creators:
        create_pdf_report(creator.user_id)
        msg=Message('Monthly Report',
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[get_email_id(creator.user_id)])
        msg.body = 'Monthly report is attached'
        msg.attach('report/report'+str(creator.user_id)+'.pdf', 'application/pdf', open('report/report'+str(creator.user_id)+'.pdf', 'rb').read())

        with app.app_context():
            mail.send(msg)

        os.remove('report/report'+str(creator.user_id)+'.pdf')
    return 'Emails sent successfully!'


celery.conf.beat_schedule = {
    'users_not_logged_in_last_24_hours': {
        'task': 'users_not_logged_in_last_24_hours',
        'schedule': crontab(minute='0',hour='17'),
    },
    'monthly-report': {
        'task': 'monthly_report',
        'schedule': crontab(minute='0',hour='17',day_of_month='1'),
    }
}
