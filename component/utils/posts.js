async function addNewPost(post, selector) {
    console.table(post);
    count++;
    const user = await fetchUserDetails(post.AssUserId);
    const date = new Date(post.PostDate + "Z").toLocaleDateString();
    const time = new Date(post.PostDate + "Z").toLocaleTimeString("en-US", {
        hour12: false,
    });
    $(selector).prepend(`
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
