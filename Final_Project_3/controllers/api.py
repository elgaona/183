# These are the controllers for your ajax api.


def get_user_name_from_email(email):
    """Returns a string corresponding to the user first and last names,
    given the user email."""
    u = db(db.auth_user.email == email).select().first()
    if u is None:
        return 'None'
    else:
        return ' '.join([u.first_name, u.last_name])

def get_posts():
    """This controller is used to get the posts.  Follow what we did in lecture 10, to ensure
    that the first time, we get 4 posts max, and each time the "load more" button is pressed,
    we load at most 4 more posts."""
    # Implement me!
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0

    posts = []
    has_more = False
    rows = db().select(db.post.ALL, orderby=~db.post.created_on, limitby=(start_idx, end_idx + 1))
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            p = dict(
                id=r.id,
                post_content=r.post_content,
                author=get_user_name_from_email(r.user_email),
                created_on=r.created_on,
                updated_on=r.updated_on,
                belongs_to_user=True if auth.user_id is not None and auth.user.email == r.user_email else False
            )
            posts.append(p)
        else:
            has_more = True

    user_id = auth.user_id if auth.user_id is not None else 0

    return response.json(dict(
        posts=posts,
        user_id=user_id,
        has_more=has_more
    ))


# Note that we need the URL to be signed, as this changes the db.
#@auth.requires_signature()
def add_post():
    """Here you get a new post and add it.  Return what you want."""
    # Implement me!
    if request.vars.is_edit:
        print "why here"
        post_under_edit = db(db.post.id == request.vars.post_id).select().first()

        if post_under_edit.user_email != auth.user.email:
            session.flash = T('Not Authorized')
            return response.json(dict(post=None))

        post_under_edit.post_content = request.vars.form_content
        post_under_edit.update_record()
        return response.json(dict(post=post_under_edit))

    print "break"

    post_id = db.post.insert(
        post_content=request.vars.form_content
    )

    post = db.post(post_id)

    post["belongs_to_user"] = True if auth.user_id is not None and auth.user.email == post.user_email else False
    post["author"] = get_user_name_from_email(post.user_email)

    return response.json(dict(post=post))


#@auth.requires_signature()
def del_post():
    """Used to delete a post."""
    # Implement me!
    q = ((db.post.user_email == auth.user.email) &
         (db.post.id == request.vars.post_id))
    post = db(q).select().first()
    if post is None:
        session.flash = T('Not Authorized')
        return response.json(dict(deleted=False))
    del db.post[post.id]
    session.flash = T('Post deleted')
    return response.json(dict(deleted=True))









#Eddie's Events Code

import random


def Events():
    pass


# Mocks implementation.
def get_tracks():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    # We just generate a lot of of data.
    tracks = []
    has_more = False
    rows = db().select(db.track.ALL, limitby=(start_idx, end_idx + 1))
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            t = dict(
                id=r.id,
                created_by=r.created_by,
                artist=r.artist,
                album=r.album,
                title=r.title,
                duration=r.duration,
                created_on=r.created_on,
            )
            tracks.append(t)
        else:
            has_more = True
    logged_in = auth.user_id is not None
    return response.json(dict(
            tracks=tracks,
            logged_in=logged_in,
            has_more=has_more,
    ))


@auth.requires_signature()
def add_track():
    t_id = db.track.insert(
            artist=request.vars.artist,
            created_by=request.vars.created_by,
            album=request.vars.album,
            title=request.vars.title,
            duration=request.vars.duration,
            created_on=request.vars.created_on,
    )
    t = db.track(t_id)
    return response.json(dict(track=t))

@auth.requires_signature()
def del_track():
    db(db.track.id == request.vars.track_id).delete()
    return "ok"
#Eddie's Finish
