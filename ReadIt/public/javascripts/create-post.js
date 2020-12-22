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
});