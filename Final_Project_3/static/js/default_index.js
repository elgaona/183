// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings
    Vue.config.devtools = true;

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };
    function get_posts_url_with_args(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };

        return get_posts_url + "?" + $.param(pp);
    }
    function get_tracks_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return tracks_url + "?" + $.param(pp);
    }

    // Enumerates an array.
    var enumerate = function(v) {
        var k=0;
        return v.map(function(e) {e._idx = k++;});
    };

    self.get_images_vue = function () {
        //var image_id=0;
        // Gets new products in response to a query, or to an initial page load.
        $.getJSON(images_url, $.param({q: self.vue.product_search}), function(data) {
            self.vue.products = data.products;
            enumerate(self.vue.products);
        });
    };




    self.goto = function (page) {
        self.vue.page = page;
    };


    self.toggle_picture_button = function() {
        self.vue.is_clicking_picture = true;
    }

    self.toggle_adding_picture_button = function() {
        self.vue.is_adding_picture = true;
    }



    self.toggle_post_button = function() {
        self.vue.is_adding_post = !self.vue.is_adding_post;
    }
    self.toggle_events_button = function() {
        self.vue.is_clicking_events = true;
    }



    self.toggle_post_under_edit= function(post_id){
         self.vue.post_being_edited = post_id;
        if (post_id == 0)
            self.vue.post_under_edit = !self.vue.post_under_edit;
        else self.vue.post_under_edit = true;




    }

    self.add_post = function() {
        var is_edit = self.vue.post_under_edit ? 1 : null;

        var post_id = 0;
        if (is_edit) {
            post_id = self.vue.post_being_edited;
        }

        $.post(add_post_url, {
            form_content: self.vue.form_content,
            post_id: post_id,
            is_edit: is_edit
        }, function(data) {
            $.web2py.enableElement($("#add_post_submit"));
            if (is_edit) {
                post = self.vue.posts.find(function(el) {
                    return el.id == post_id;
                })
                post.post_content = data.post.post_content;
                self.vue.post_under_edit = 0;
                self.vue.post_being_edited = 0;
            } else {
                self.toggle_post_button();
                self.vue.posts.unshift(data.post);

            }
            self.vue.form_content = "";
        });
    }
    self.get_posts = function() {
        $.getJSON(get_posts_url_with_args(0, 1), function(data) {
            self.vue.posts = data.posts;
            self.vue.has_more = data.has_more;
            self.vue.user_id = data.user_id;
        });
    }

    self.delete_post = function(post_id) {
        $.post(del_post_url, {
           post_id: post_id
        }, function(data) {
            if (data.deleted) {
                post_idx = self.vue.posts.findIndex(function(el) {
                    return el.id == post_id;
                });
                self.vue.posts.splice(post_idx, 1);
            }
            self.vue.post_being_edited = 0;
            self.vue.post_under_edit = 0;
            self.vue.form_content = "";
        });
    }

    self.get_more = function() {
        var num_posts = self.vue.posts.length;

        $.getJSON(get_posts_url_with_args(num_posts, num_posts + 4), function(data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
        });
    }


    //Events

    self.get_tracks = function () {
        $.getJSON(get_tracks_url(0, 20), function (data) {
            self.vue.tracks = data.tracks;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
        })
    };

    self.get_more = function () {
        var num_tracks = self.vue.tracks.length;
        $.getJSON(get_tracks_url(num_tracks, num_tracks + 50), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.tracks, data.tracks);
        });
    };


    self.add_track_button = function () {
        // The button to add a track has been pressed.
        self.vue.is_adding_track = !self.vue.is_adding_track;
    };

    self.add_track = function () {
        // The submit button to add a track has been added.
        $.post(add_track_url,
            {
                artist: self.vue.form_artist,
                title: self.vue.form_track,
                album: self.vue.form_album,
                duration: self.vue.form_duration
            },
            function (data) {
                $.web2py.enableElement($("#add_track_submit"));
                self.vue.tracks.unshift(data.track);
            });
    };

    self.delete_track = function(track_id) {
        $.post(del_track_url,
            {
                track_id: track_id
            },
            function () {
                var idx = null;
                for (var i = 0; i < self.vue.tracks.length; i++) {
                    if (self.vue.tracks[i].id === track_id) {
                        // If I set this to i, it won't work, as the if below will
                        // return false for items in first position.
                        idx = i + 1;
                        break;
                    }
                }
                if (idx) {
                    self.vue.tracks.splice(idx - 1, 1);
                }
            }
        )
    };



    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            //PICTURE
            products: [],
            is_clicking_picture: false,
            is_adding_picture:false,
            //POST
            posts: [],
            is_adding_post: false,
            post_under_edit: false,
            post_being_edited: null,
            user_id: 0,
            has_more: false,
            form_content: null,
            //events
            is_adding_track: false,
            tracks: [],
            logged_in: false,
            has_more: false,
            form_artist: null,
            form_track: null,
            form_album: null,
            form_duration: null,
            is_clicking_events: false,
            //is_adding_events:false,





        },
        methods: {
            //PICTURE
            toggle_picture_button: self.toggle_picture_button,
            toggle_adding_picture_button: self.toggle_adding_picture_button,
            get_images_vue: self.get_images_vue,
            goto: self.goto,
            //POST
            get_more: self.get_more,
            add_post: self.add_post,
            toggle_post_button: self.toggle_post_button,
            toggle_post_under_edit: self.toggle_post_under_edit,
            delete_post: self.delete_post,
            //events
            get_more: self.get_more,
            add_track_button: self.add_track_button,
            add_track: self.add_track,
            delete_track: self.delete_track,
            toggle_events_button: self.toggle_events_button,


        }

    });

    self.get_images_vue();
    self.get_posts();
    self.get_tracks();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});


/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}