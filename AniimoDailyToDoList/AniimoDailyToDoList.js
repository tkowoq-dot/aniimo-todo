// JavaScript source code
const progress = document.querySelector("#progress");
const boxes = document.querySelectorAll('input[type="checkbox"]');
const progressTrack = document.querySelector("#progress-track");

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

// --- 初期化処理 ---
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