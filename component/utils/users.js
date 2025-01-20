let userCache = {};
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
