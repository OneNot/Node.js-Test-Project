$(function() {
    $("#tag-dropdown-header").click(function() {
        console.log("click");
        let body = $("#tag-dropdown-body");
        if(body.is(":visible"))
            $("#tag-dropdown-header-arrow").text("▼");
        else
            $("#tag-dropdown-header-arrow").text("▲");
        body.toggle(200);
    });

    $("#delete-post-button").click(function(e) {
        e.preventDefault();
        if(confirm("Are you sure you want to delete this post?"))
        {
            $.post($(this).data("postUrl"))
            .done(() => {
                window.location.href = "/posts";
            })
            .fail((err) => {
                alert(err);
            });
        }
    });
});