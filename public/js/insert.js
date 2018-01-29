$("#scrap").on("click", function(){
    $.ajax({
        url: "/scrap",
        method:"GET"
    }).done(function(data){
        if(data.status === "OK")
            $("#scrapMsg").html("Insert "+data.insert+" new articles.");
        else
            $("#scrapMsg").html("There was an error with inserting articles.");
    });
});