let userCache = {};
let count = 0;
let isLoadingPosts = false;

function toggleMenu() {
    const menu = $(".menu");
    const cover = $(".cover");
    menu.toggleClass("visible");
    cover.toggleClass("on");
}

async function fetchUserDetails(UserId) {
    if (userCache[UserId] !== undefined) {
        return Promise.resolve(userCache[UserId]);
    } else {
        return $.ajax({
            url: "/api/getUser",
            method: "GET",
            data: { UserId: UserId },
            dataType: "json",
        }).then((response) => {
            userCache[UserId] = response.data;
            return response.data;
        });
    }
}

async function handleNewPosts(posts) {
    for (const post of posts) {
        count++;
        const user = await fetchUserDetails(post.AssUserId);
        const date = new Date(post.PostDate + "Z").toLocaleDateString();
        const time = new Date(post.PostDate + "Z").toLocaleTimeString("en-US", {
            hour12: false,
        });
        $("#posts-container").append(`
            <div class="post">
                <div class="post-header">
                    <h1>${user.Username}</h1>
                    <div class="post-time">
                        <h2>${date}</h2>
                        <h4>${time}</h4>
                    </div>
                </div>
                <p>${post.Content}</p>
            </div>
            `);
    }
}

$("#navbar-toggle").on("click", function () {
    toggleMenu();
});

$("#menu-close").on("click", function () {
    toggleMenu();
});

$("#menu-settings").on("click", function () {});

$("#menu-about").on("click", function () {});

$("#menu-github").on("click", function () {
    window.location.replace("https://github.com/Chill-Sam/ChillNet");
});

$("#menu-logout").on("click", async function () {
    await $.ajax({
        type: "POST",
        url: "/api/logout",
    });
    window.location.replace("/signin");
});

$(".cover").on("click", function (e) {
    if (!$(this).hasClass("on")) {
        return;
    }

    if (!$(e.target).is(".menu")) {
        toggleMenu();
    }
});

$(document).ready(function () {
    if (!(SESSION_USERID === "")) {
        (async () => {
            const curUser = await fetchUserDetails(Number(SESSION_USERID));
            $(".navbar-message").append(curUser.Username);
        })();
    }

    const postsSocket = new WebSocket(
        "ws://chillsam.ddns.net:8080/websocket/posts",
    );

    postsSocket.onopen = function () {};

    postsSocket.onmessage = function (event) {
        isLoadingPosts = false;

        const message = JSON.parse(event.data);

        switch (message.type) {
            case "latest_posts":
                handleNewPosts(message.data);
                break;
            case "older_posts":
                handleNewPosts(message.data);
                break;
            default:
                break;
        }
    };

    postsSocket.onclose = function () {};

    postsSocket.onerror = function (error) {};

    $("#posts-container").on("scroll", function () {
        const container = $(this);

        if (
            container.scrollTop() + container.innerHeight() >=
            container[0].scrollHeight
        ) {
            if (isLoadingPosts) {
                return;
            }

            getMorePosts(count);
            isLoadingPosts = true;
        }
    });

    function getMorePosts(index) {
        console.log("crazy");
        postsSocket.send(
            JSON.stringify({ action: "load_more_posts", index: index }),
        );
    }
});
