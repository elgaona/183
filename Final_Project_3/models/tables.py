# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

# Product table.

import datetime

db.define_table('product',
    #Field('user_email', default=auth.user.email if auth.user_id else None),
    Field('image', 'upload'),
    Field('description', 'text'),
)


db.define_table('post',
                Field('user_email', default=auth.user.email if auth.user_id else None),
                Field('post_content', 'text'),
                Field('created_on', 'datetime', default=datetime.datetime.utcnow()),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                )


def get_user_email():
    return auth.user.email if auth.user else None

db.define_table('track',
                Field('artist'),
                Field('album'),
                Field('title'),
                Field('duration'),
                Field('created_by', default=get_user_email()),
                Field('created_on', default=datetime.datetime.utcnow()),
                )
# I don't want to display the user email by default in all forms.

db.product.id.readable = db.product.id.writable = False
db.post.user_email.readable = db.post.user_email.writable = False
db.post.post_content.requires = IS_NOT_EMPTY()
db.post.created_on.readable = db.post.created_on.writable = False
db.post.updated_on.readable = db.post.updated_on.writable = False


# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
