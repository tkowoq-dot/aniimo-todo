// JavaScript source code
const progress = document.querySelector("#progress");
const boxes = document.querySelectorAll('input[type="checkbox"]');
const progressTrack = document.querySelector("#progress-track");

// --- 5時リセット関連の関数 ---

// 1. 現在の時刻から「朝5時区切りの日付文字列（YYYY-MM-DD）」を作る関数
function getFiveAMDateString() {
    const now = new Date();
    // 朝5時を日付の境界にするため、現在の時刻から5時間引く
    now.setHours(now.getHours() - 5);
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${date}`;
}

// 2. 日付が変わっていたら（朝5時を跨いでいたら）チェックをリセットする処理
function checkDailyReset() {
    const lastSavedDate = localStorage.getItem('aniimo_last_date');
    const currentDate = getFiveAMDateString();

    // 前回保存した日付と、今の5時基準の日付が違う場合
    if (lastSavedDate !== currentDate) {
        // すべてのチェックを外す
        boxes.forEach((box, index) => {
            box.checked = false;
            // ついでに個別の保存データも削除しておく
            localStorage.removeItem("todo_box_" + index);
        });

        // 新しい日付を保存する
        localStorage.setItem('aniimo_last_date', currentDate);
    }
}


// --- 既存のタスク機能関連 ---

// 0. タスクの数に合わせて分割バーを自動で生成する
function createSegments() {
    progressTrack.innerHTML = "";
    boxes.forEach(() => {
        const segment = document.createElement("div");
        segment.classList.add("progress-segment");
        progressTrack.appendChild(segment);
    });
}

// 1. 保存されていたチェック状態を復元する
function loadState() {
    boxes.forEach((box, index) => {
        const savedState = localStorage.getItem("todo_box_" + index);
        if (savedState === "true") {
            box.checked = true;
        }
    });
}

// 2. チェック状態をブラウザに保存する
function saveState() {
    boxes.forEach((box, index) => {
        localStorage.setItem("todo_box_" + index, box.checked);
    });
}

// 3. 進捗状況に合わせて、左から順にバーを埋める
function updateProgress() {
    let count = 0;

    // ① まず、チェックが入っている合計の数を数える
    boxes.forEach((box) => {
        if (box.checked) {
            count++;
        }
    });

    // ② バーを左から順番に見ていき、「チェックされた総数」の分だけ光らせる
    const segments = document.querySelectorAll(".progress-segment");
    segments.forEach((segment, i) => {
        if (i < count) {
            segment.classList.add("active"); // 左から順に光らせる
        } else {
            segment.classList.remove("active"); // 残りは暗くする
        }
    });

    progress.textContent = `達成数：${count} / ${boxes.length}`;
}


// --- 初期化処理（実行順序に注意！） ---

// ★最初に「日付が変わっていないか（朝5時を跨いでいないか）」をチェック＆リセットする
checkDailyReset();

createSegments();
loadState();
updateProgress();


// --- イベント登録 ---
boxes.forEach((box) => {
    box.addEventListener("change", function () {
        saveState();
        updateProgress();
    });
});