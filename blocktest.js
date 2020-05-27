chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) 
{
    if (changeInfo.status == "loading" && changeInfo.url != undefined) 
    {
        $(document).ready(function () 
        {
            var web = changeInfo.url;
            $.getJSON('blacklist.json', function (data) {
                var block = data.blacklist;
                for(var i=0;i<data.blacklist.length;i++)
                {
                if (changeInfo.url == block[i])
                    {alert("[Warning]\n" + changeInfo.url + "\nis dangerous.");
                }}
            });
        });
    }
})