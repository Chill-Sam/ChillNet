let count = 0;
let isLoadingPosts = false;
let loadedAllPosts = false;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function handleOlderPosts(posts) {
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

$(document).ready(function () {
    const postsSocket = new WebSocket(
        "ws://chillsam.ddns.net:8080/websocket/posts",
    );

    postsSocket.onopen = function () {};

    postsSocket.onmessage = function (event) {
        isLoadingPosts = false;

        const message = JSON.parse(event.data);
        switch (message.type) {
            case "add_new_post":
                addNewPost(message.data, "#posts");
                break;
            case "latest_posts":
                handleOlderPosts(message.data);
                break;
            case "older_posts":
                handleOlderPosts(message.data);
                break;
            default:
                break;
        }
    };

    postsSocket.onclose = function () {};

    postsSocket.onerror = function (error) {};

    $("#new-post").submit(function (e) {
        e.preventDefault();

        const form = $(this);

        postsSocket.send(
            JSON.stringify({
                action: "new_post",
                post: {
                    AssUserId: SESSION_USERID,
                    msg: form.serializeArray()[0]["value"],
                },
            }),
        );

        form.trigger("reset");
    });

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
});
