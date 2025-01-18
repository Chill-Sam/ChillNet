function toggleMenu() {
    const menu = $(".menu");
    const cover = $(".cover");
    menu.toggleClass("visible");
    cover.toggleClass("on");
}

async function fetchUserDetails(UserId) {
    return $.ajax({
        url: "/api/getUser",
        method: "GET",
        data: { UserId: UserId },
        dataType: "json",
    }).then((response) => {
        return response.data;
    });
}

$("#navbar-home").on("click", function () {
    window.location.href = "/";
});

$("#navbar-toggle").on("click", function () {
    toggleMenu();
});

$("#menu-close").on("click", function () {
    toggleMenu();
});

$("#menu-settings").on("click", function () {});

$("#menu-about").on("click", function () {});

$("#menu-github").on("click", function () {
    window.location.href = "https://github.com/Chill-Sam/ChillNet";
});

$("#menu-logout").on("click", async function () {
    await $.ajax({
        type: "POST",
        url: "/api/logout",
    });
    window.location.href = "/signin";
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

    let debounceTimer;

    // Debounce function to delay AJAX requests
    const debounce = (callback, delay) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(callback, delay);
    };

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
