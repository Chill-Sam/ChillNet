if (!window.userCache) {
    window.userCache = {};
}

async function fetchUserDetails(UserId) {
    if (window.userCache[UserId] !== undefined) {
        return Promise.resolve(window.userCache[UserId]);
    } else {
        return $.ajax({
            url: "/api/getUser",
            method: "GET",
            data: { UserId: UserId },
            dataType: "json",
        }).then((response) => {
            window.userCache[UserId] = response.data;
            return response.data;
        });
    }
}
