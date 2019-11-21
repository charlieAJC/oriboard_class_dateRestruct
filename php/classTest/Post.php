<?php
require_once("Session.php");

class Post extends Session
{
    private $conn;
    protected $ss_account, $ss_permission;

    function __construct($conn)
    {
        $this->conn = $conn;
        session_start();
        $arr = $this->verify();
        $this->ss_account = $arr["account"];
        $this->ss_permission = $arr["permission"];
    }

    function __destruct()
    {
        ## TODO: Implement __destruct() method.
    }

    function index($date)
    {
        $regex = "/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/";
        if ($date === "" || preg_match($regex, $date) === 0) {
            $sql = "SELECT `post`.*,`member`.`account` FROM `post`,`member` 
            WHERE `post`.`member_id` = `member`.`id` 
            ORDER BY create_at DESC";
        } else {
            $date = date_create($date);
            $date = date_format($date, 'Y/m/d');
            $sql = "SELECT `post`.*,`member`.`account` FROM `post`,`member` 
            WHERE (`post`.`member_id` = `member`.`id`)
            AND (date(`create_at`) = date('$date'))
            ORDER BY create_at DESC";
        }
        $result = $this->conn->query($sql);
        if ($result->num_rows === 0) {
            return json_encode($result->num_rows);
        }
        while ($row = $result->fetch_assoc()) {
            $arr[] = $row;
        }
        $this->conn->close();
        return json_encode($arr);
    }

    function add($title)
    {
        if ($title === "") {
            return json_encode(false);
        } else {
            $account = $this->ss_account;
            $query = "INSERT INTO `post` (`member_id`, `title`, `create_at`) VALUES ((SELECT `id` FROM `member` WHERE `account` = ?), ?, ?)";
            $stmt = $this->conn->prepare($query);

            ## 設置參數並執行
            date_default_timezone_set('Asia/Taipei');
            $datetime = date("Y-m-d H:i:s");
            $stmt->bind_param("sss", $account, $title, $datetime);
            return json_encode($stmt->execute());
        }
    }

    function showModify($id)
    {
        $sql = "SELECT * FROM `post` WHERE `id` = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $arr = $stmt->get_result()->fetch_assoc();
        return json_encode($arr);
    }

    function modify($id, $title)
    {
        if ($title === "") {
            return json_encode(false);
        } else {
            ## 先確認提出要求的是否為原作者
            $sql = "SELECT `member`.`account` FROM `post`,`member` WHERE `post`.`member_id` = `member`.`id` AND `post`.`id` = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $stmt->bind_result($account);
            $stmt->fetch();
            ## $stmt-> free_result()释放与结果集相关的内存,而$stmt-> close()释放与准备语句相关的内存
            $stmt->close();
            if ($account === $this->ss_account) {
                ## 預處理
                $query = "UPDATE `post` SET `title`= ? WHERE `id`= ?";
                $stmt = $this->conn->prepare($query);

                ## 設置參數並執行
                $stmt->bind_param("si", $title, $id);
                return json_encode($stmt->execute());
            } else {
                return json_encode(false);
            }
        }
    }

    function remove($id)
    {
        ## 先確認提出要求的是否為原作者
        $sql = "SELECT `member`.`account` FROM `post`,`member` WHERE `post`.`member_id` = `member`.`id` AND `post`.`id` = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->bind_result($account);
        $stmt->fetch();
        ## $stmt-> free_result()释放与结果集相关的内存,而$stmt-> close()释放与准备语句相关的内存
        $stmt->close();
        if ($account === "") {
            return json_encode(false);
        } else {
            if ($account === $this->ss_account || $this->ss_permission === 2) {
                ## 預處理
                $query = "DELETE FROM `post` WHERE id = ?";
                $stmt = $this->conn->prepare($query);
                
                ## 設置參數並執行
                $stmt->bind_param("i", $id);
                return json_encode($stmt->execute());
            }
        }
    }
}