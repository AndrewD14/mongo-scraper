$("#scrap").on("click", function(){
    $.ajax({
        url: "/scrap",
        method:"GET"
    }).done(function(data){
        if(data.status === "OK")
            $("#scrap-info").html("Insert "+data.insert+" new articles.");
        else
            $("#scrap-info").html("There was an error with inserting articles.");
    });
});