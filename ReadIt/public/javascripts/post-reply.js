$(function() {
    $("#post-reply-button").click(function(e) {
        e.preventDefault();
        $("#comment-writer").slideToggle(200);
    });
});