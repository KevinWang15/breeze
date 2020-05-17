chrome.storage.sync.get(["breezeUser", "breezeServer"], function (result) {
    document.getElementById("user").value = result.breezeUser || "";
    document.getElementById("server").value = result.breezeServer || "";
});

window.onload = () => {
    document.getElementById("submit-btn").addEventListener("click", (e) => {
        e.preventDefault();
        chrome.storage.sync.set({
            breezeUser: document.getElementById("user").value,
            breezeServer: document.getElementById("server").value
        }, function () {
            alert("ok");
            window.location.reload();
        });
    })
}
