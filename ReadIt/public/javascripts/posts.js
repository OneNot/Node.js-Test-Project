$(function() {
    $(".post-upvote, .post-downvote").click(function(e) {
        e.preventDefault();

        var upvoteEl = $(this).parent().find(".post-upvote");
        var downvoteEl = $(this).parent().find(".post-downvote");
        var scoreEl = $(this).parent().find(".post-score");
        var isUpvote = $(this).is(".post-upvote");

        $.post($(this).data("postUrl"), {vote: (isUpvote ? 1 : -1)})
        .done(function(data) {
            if(data.error == 'login')
            {
                if(confirm("You need to login to vote! Go to login page now?"))
                    window.location.href = "/users/login";
            }
            else if(data.error)
            {
                alert("error: " + data.error);
            }
            else
            {
                upvoteEl.removeClass('vote-selected');
                downvoteEl.removeClass('vote-selected');

                if(data.state == 1)
                {
                    upvoteEl.addClass('vote-selected');
                }
                else if(data.state == -1)
                {
                    downvoteEl.addClass('vote-selected');
                }

                scoreEl.text(data.score);
            }
        })
        .fail(function(err) {
            alert( "error" );
        })
    });

    $(".comment-delete").click(function(e) {
        e.preventDefault();

        let comment = $(this).parent().parent(".post-comment-container");
        if(!comment)
            alert("Failed to get comment");

            $.post($(this).data("postUrl"))
            .done(function(data) {
                if(data.error == 'login')
                {
                    if(confirm("You need to login to remove comments! Go to login page now?"))
                        window.location.href = "/users/login";
                }
                else if(data.error)
                {
                    alert("error: " + data.error);
                }
                else
                {
                    //delete on the front end
                    comment.remove();
                }
            })
            .fail(function(err) {
                alert( "error" );
            });
    });
});