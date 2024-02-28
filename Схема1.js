function compress(a) {
    a = unescape(encodeURIComponent(a));
    GID("im2").src = "https://www.plantuml.com/plantuml/check/" + encode64(zip_deflate(a, 9))
}

function changed() {
    var b = GID("im2");
    var a = b.src.replace("/check/", "/png/");
    if (b.width == 3) {
        GID("im").src = a;
        GID("err").style.visibility = "hidden";
        GID("err").src = "soft/shema/pixel.png"
    } else {
        GID("err").src = a;
        GID("err").style.visibility = "visible"
    }
};
