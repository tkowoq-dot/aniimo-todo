// --- 1. タスクのデータリスト ---
const TASKS_DATA = [
    { title: "デイリー活躍（500ポイント）" },
    { title: "エナジーの消費" },
    { title: "ホームキャンプのデイリー注文" },
    { title: "フレンドに2回メッセージを送る" },
    { title: "謎の商人から商品を購入" },
    { title: "綺羅星のお茶会", time: "(18:00〜翌2:00)" },
    { title: "ゲーム内メールの確認" }
];

// --- 2. HTMLの描画エリアと要素を取得 ---
const taskListContainer = document.querySelector("#task-list");
const progress = document.querySelector("#progress");
const progressTrack = document.querySelector("#progress-track");

// --- 3. JavaScriptからHTML（task-card）を動的に一括生成する ---
function generateTaskCards() {
    taskListContainer.innerHTML = ""; // 初期化

    TASKS_DATA.forEach((task, index) => {
        const card = document.createElement("div");
        card.classList.add("task-card");

        // 時間表記がある場合とない場合に対応
        const timeHtml = task.time ? `<span class="task-time">${task.time}</span>` : "";

        card.innerHTML = `
            <label>
                <input type="checkbox" id="task-${index}">
                <svg class="check-icon" viewBox="0 0 24 24">
                    <path d="M5 12l4 4L19 6" />
                </svg>
                ${task.title} ${timeHtml}
            </label>
        `;
        taskListContainer.appendChild(card);
    });
}

generateTaskCards();

// 生成されたチェックボックス要素を取得
const boxes = document.querySelectorAll('input[type="checkbox"]');

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

    // ① チェックが入っている合計の数を数える
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

    progress.textContent = `${count} / ${boxes.length}`;
}

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

function updateCountdown() {
    const now = new Date();
    
    // 次の「午前5:00」を目標時刻に設定
    let target = new Date();
    target.setHours(5, 0, 0, 0);

    // すでに今日のアサ5時を過ぎている場合は「明日のあさ5時」をターゲットにする
    if (now >= target) {
        target.setDate(target.getDate() + 1);
    }

    // 残り時間（ミリ秒）
    const diff = target - now;

    // 時間・分・秒に計算
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // 2桁揃え（例: 05時間09分12秒）
    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');

    // 画面に反映
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        countdownEl.textContent = `${hStr}時間${mStr}分${sStr}秒`;
    }
}

// 1秒ごとに実行
setInterval(updateCountdown, 1000);
// 初回実行
updateCountdown();

// --- 背景スライドショー設定 ---
const BG_IMAGES = [
    'Aniimobg1.webp', // 1枚目
    'Aniimobg2.webp', // 2枚目
    'Aniimobg3.webp', // 3枚目
    'Aniimobg4.webp', // 4枚目
    'Aniimobg5.webp'  // 5枚目
];

const CHANGE_INTERVAL = 10000; // 切り替え間隔（例: 10000 = 10秒ごと）

function initBackgroundSlideshow() {
    const slideshowContainer = document.querySelector("#bg-slideshow");
    if (!slideshowContainer || BG_IMAGES.length === 0) return;

    slideshowContainer.innerHTML = `
        <div class="bg-slide active" id="bg-slide-a"></div>
        <div class="bg-slide" id="bg-slide-b"></div>
        <div class="bg-overlay"></div>
    `;

    const slideA = document.querySelector("#bg-slide-a");
    const slideB = document.querySelector("#bg-slide-b");

let currentIndex = Math.floor(Math.random() * BG_IMAGES.length);
    let isSlideAActive = true;

    // ランダムに選ばれた最初の画像をセット
    slideA.style.backgroundImage = `url('${BG_IMAGES[currentIndex]}')`;

    // 画像が1枚以下の場合は切り替え処理をスキップ
    if (BG_IMAGES.length <= 1) return;

    // 定期的に次の画像へルーティン切り替え
    setInterval(() => {
        // 次の画像のインデックス（最後の画像まで行ったら0に戻る）
        currentIndex = (currentIndex + 1) % BG_IMAGES.length;
        const nextImage = BG_IMAGES[currentIndex];

        if (isSlideAActive) {
            slideB.style.backgroundImage = `url('${nextImage}')`;
            slideB.classList.add("active");
            slideA.classList.remove("active");
        } else {
            slideA.style.backgroundImage = `url('${nextImage}')`;
            slideA.classList.add("active");
            slideB.classList.remove("active");
        }

        isSlideAActive = !isSlideAActive;
    }, CHANGE_INTERVAL);
}

// スライドショー初期化呼び出し
initBackgroundSlideshow();