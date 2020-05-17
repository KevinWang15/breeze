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
            window.close();
        });
    })

    document.getElementById("enter-read-mode-btn").addEventListener("click", (e) => {
        e.preventDefault();
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {"action": "EnterReadMode"}, function (response) {
                if (response.ok) {
                    window.close();
                }
            });
        });
    })
}
