let userCache = {};
let count = 0;
let isLoadingPosts = false;
let loadedAllPosts = false;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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
    if (posts.length == 0) {
        loadedAllPosts = true;
        $("#posts").append(`
            <div class="post" style="display:flex;align-items:center;justify-content:center;"><h1>No more posts</h1></div>
            `);
        $("#loading")[0].style.display = "none";
        return;
    }
    for (const post of posts) {
        count++;
        const user = await fetchUserDetails(post.AssUserId);
        const date = new Date(post.PostDate + "Z").toLocaleDateString();
        const time = new Date(post.PostDate + "Z").toLocaleTimeString("en-US", {
            hour12: false,
        });
        $("#posts").append(`
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
    window.location.href = ("https://github.com/Chill-Sam/ChillNet");
});

$("#menu-logout").on("click", async function () {
    await $.ajax({
        type: "POST",
        url: "/api/logout",
    });
    window.location.href = ("/signin");
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
    let debounceTimer;

    // Debounce function to delay AJAX requests
    const debounce = (callback, delay) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(callback, delay);
    };

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

    $("#posts-container").on("scroll", async function () {
        const container = $(this);

        if (
            !loadedAllPosts &&
            !isLoadingPosts &&
            container.scrollTop() + container.innerHeight() >=
                container[0].scrollHeight
        ) {
            isLoadingPosts = true;
            container[0].style.overflowY = "hidden";

            setTimeout(() => {
                getMorePosts(count);
                container[0].style.overflowY = "auto";
                isLoadingPosts = false;
            }, 1000);
        }
    });

    function getMorePosts(index) {
        postsSocket.send(
            JSON.stringify({ action: "load_more_posts", index: index }),
        );
    }

    $("#navbar-search").on("input", function () {
        const navbar = $(this);
        const query = navbar.val().trim();
        const results = $("#search-results");

        debounce(() => {
            $.ajax({
                url: "/api/searchUser",
                type: "GET",
                data: { search: query },
                dataType: "json",
            }).then((response) => {
                const users = response.data;
                results.empty();
                if (query.length === 0) {
                    results.css("height", "0px");
                    return;
                }

                if (!response.success) {
                    results.css("height", "0px");
                    return;
                }
                users.forEach((user) => {
                    results.append(`
                        <button class="search-result">
                            <img src="/assets/no_account.png" alt="" />
                                ${user[0]}
                        </button>
                            `);
                });

                const children = results.children().length;
                const height = 80 * children + (children - 1) * 10 + 50;
                results.css("height", height + "px");

                $(".search-result").on("click", function () {
                    window.location.href =
                        "/users/" + $(this).prop("outerText");
                });
            });
        }, 200);
    });
});
