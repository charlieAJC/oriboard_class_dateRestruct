let search_date = "";
let account, permission;
$(document).ready(function () {

    /**
     * navbar上顯示帳號，並將帳號和權限設為全域變數
     */
    $.ajax({
        type: "POST",
        url: "/oriboard_class_dateRestruct/php/member.php",
        async: false,
        data: {
            "action": "navbar"
        },
        success: function (response) {
            response = JSON.parse(response);
            account = response["account"];
            permission = response["permission"];
        }
    });

    /**
     *  大廳的資料
     */ 
    $.ajax({
        type: "POST",
        url: "/oriboard_class_dateRestruct/php/post.php",
        data: {
            "action": "index"
        },
        success: function (response) {
            response = JSON.parse(response);
            // console.log(response["data"]);
            dataToWeb(response["data"], permission, account);
            showPage(response["page"], response["pages"]);
        }
    });

    /**
     * 加入日期查詢的資料
     */
    $("#dateSearch").click(function (e) {
        let regex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
        if (regex.test($("#datepicker").val())) {
            search_date = $("#datepicker").val();
            $.ajax({
                type: "POST",
                url: "/oriboard_class_dateRestruct/php/post.php",
                data: {
                    "action": "index",
                    "date": $("#datepicker").val()
                },
                success: function (response) {
                    response = JSON.parse(response);
                    if (response === 0) {
                        $("#list").empty();
                        $("#list").append('<li class="list-group-item"><p>蝦密攏謀</p></li>');
                    } else {
                        dataToWeb(response["data"], permission, account);
                        showPage(response["page"], response["pages"]);
                    }
                }
            });
        } else {
            $("#datepicker").val("");
            alert("時間格式不符!");
        }

    });
})

/**
 * 點選修改按鈕
 */
$(document).on('click', '.modify', function (event) {
    let id = $(this).parent().attr('id');
    let url = "modify.html?id=" + id;
    window.location.href = url;
});

/**
 * 點選刪除按鈕
 */
$(document).on('click', '.remove', function (event) {
    let id = $(this).parent().attr('id');
    if (confirm("真的要刪除嗎?")) {
        $.ajax({
            type: "POST",
            url: "/oriboard_class_dateRestruct/php/post.php",
            data: {
                "action": "remove",
                "id": id
            },
            success: function (response) {
                response = JSON.parse(response);
                if (response === true) {
                    $("#" + id).parent().remove();
                }
            }
        });
    } else {
        return false;
    }
});

/**
 * 點選分頁
 */
$(document).on('click', '.page', function (event) {
    // 沒有日期查詢或者日期查詢格式正確
    let date = search_date;
    let page = $(this).attr('id');
    if (date == "" || date_format(date)) {
        if (page_format(page)) {
            $.ajax({
                type: "POST",
                url: "/oriboard_class_dateRestruct/php/post.php",
                data: {
                    "action": "index",
                    "date": date,
                    "page": page
                },
                success: function (response) {
                    response = JSON.parse(response);
                    dataToWeb(response["data"], permission, account);
                    showPage(response["page"], response["pages"]);
                }
            });
        } else {
            alert("頁數格式不符!")
        }
    } else {
        alert("時間格式不符!");
    }
});

$(function () {
    $("#datepicker").datepicker();
});

/**
 * 把資料append到網頁上
 */
function dataToWeb(response, permission, account) {
    $("#list").empty();
    $.each(response, function (indexInArray, valueOfElement) {
        let newEl = document.createElement('div');
        newEl.textContent = valueOfElement["title"];
        let tmpTitle = newEl.innerHTML;
        // console.log(newEl.innerHTML, newEl.textContent);

        if (permission == 2) {
            if (valueOfElement["account"] === account) {
                $("#list").append('<li class="list-group-item"><small id="' + valueOfElement["id"] + '" class="pull-right text-muted"> \
                    <button class="glyphicon glyphicon-pencil modify"></button><button class="glyphicon glyphicon-remove remove"></button>'+
                    valueOfElement["create_at"] + '</small><div> \
                    <small class="list-group-item-heading text-muted text-primary">'+ valueOfElement["account"] + '</small> \
                    <p class="list-group-item-text"><pre>' + tmpTitle + '</pre></p></div></li>');
            } else {
                $("#list").append('<li class="list-group-item"><small id="' + valueOfElement["id"] + '" class="pull-right text-muted"> \
                    <button class="glyphicon glyphicon-remove remove"></button>'+
                    valueOfElement["create_at"] + '</small><div> \
                    <small class="list-group-item-heading text-muted text-primary">'+ valueOfElement["account"] + '</small> \
                    <p class="list-group-item-text"><pre>'+ tmpTitle + '</pre></p></div></li>');
            }
        } else {
            if (valueOfElement["account"] === account) {
                $("#list").append('<li class="list-group-item"><small id="' + valueOfElement["id"] + '" class="pull-right text-muted"> \
                    <button class="glyphicon glyphicon-pencil modify"></button><button class="glyphicon glyphicon-remove remove"></button>'+
                    valueOfElement["create_at"] + '</small><div> \
                    <small class="list-group-item-heading text-muted text-primary">'+ valueOfElement["account"] + '</small> \
                    <p class="list-group-item-text"><pre>' + tmpTitle + '</pre></p></div></li>');
            } else {
                $("#list").append('<li class="list-group-item"><small class="pull-right text-muted">' + valueOfElement["create_at"] + '</small><div> \
                    <small class="list-group-item-heading text-muted text-primary">'+ valueOfElement["account"] + '</small> \
                    <p class="list-group-item-text"><pre>'+ tmpTitle + '</pre></p></div></li>');
            }
        }
    });
}

/**
 * 顯示頁數
 */
function showPage(page, pages) {
    $("#page").empty();
    for (let i = 1; i <= pages; i++) {
        if (i == page) {
            $("#page").append('<a class="page" style="color: black;" id="' + i + '">' + i + '</a>');
        } else {
            $("#page").append('<a class="page" href="javascript: void(0)" id="' + i + '">' + i + '</a>');
        }
    }
}

/**
 * 檢查時間格式
 */
function date_format(date) {
    let regex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
    return regex.test(date);
}

/**
 * 檢查頁數格式(小數、負數、英文)
 */
function page_format(page) {
    let regex = /^\+?[1-9][0-9]*$/;
    return regex.test(page);
}