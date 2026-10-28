// =====================================================
// 設定（ここだけ変えれば動きを変えられる）
// =====================================================

// 1日の区切りの時刻（朝5時）。ゲーム側の更新時刻が変わったらここを直す
const RESET_HOUR = 5;

// 背景スライドショーの画像と切り替え間隔
const BG_IMAGES = [
    'Aniimobg1.webp',
    'Aniimobg2.webp',
    'Aniimobg3.webp',
    'Aniimobg4.webp',
    'Aniimobg5.webp'
];
const CHANGE_INTERVAL = 10000; // 10000 = 10秒ごと

// タスクのデータ
// ★変更：各タスクに id をつけた。途中に足したり消したりしても、
//   チェックの保存がずれない（id は一度決めたら変えないこと）
const TASKS_DATA = [
    { id: "daily-activity", title: "デイリー活躍（500ポイント）" },
    { id: "energy",         title: "エナジーの消費" },
    { id: "home-camp",      title: "ホームキャンプのデイリー注文" },
    { id: "friend-message", title: "フレンドに2回メッセージを送る" },
    { id: "merchant",       title: "謎の商人から商品を購入" },
    { id: "tea-party",      title: "綺羅星のお茶会", time: "(18:00〜翌2:00)" },
    { id: "mail",           title: "ゲーム内メールの確認" }
];


// =====================================================
// HTMLの要素を取得
// =====================================================

const taskListContainer = document.querySelector("#task-list");
const progress = document.querySelector("#progress");
const progressTrack = document.querySelector("#progress-track");
const countdownEl = document.querySelector("#countdown");


// =====================================================
// タスクカードの生成
// =====================================================

function generateTaskCards() {
    taskListContainer.innerHTML = "";

    TASKS_DATA.forEach((task) => {
        const card = document.createElement("div");
        card.classList.add("task-card");

        // 時間表記がある場合だけ表示する
        const timeHtml = task.time ? `<span class="task-time">${task.time}</span>` : "";

        card.innerHTML = `
            <label>
                <input type="checkbox" data-id="${task.id}">
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

// 生成されたチェックボックスをまとめて取得
const boxes = document.querySelectorAll('input[type="checkbox"]');


// =====================================================
// 保存と復元（localStorage）
// =====================================================

// 保存に使う名前。例: "todo_energy"
function storageKey(box) {
    return "todo_" + box.dataset.id;
}

// ★追加：旧バージョン（番号で保存していた）のチェックを引き継ぐ
function migrateOldKeys() {
    TASKS_DATA.forEach((task, index) => {
        const oldKey = "todo_box_" + index;
        const oldValue = localStorage.getItem(oldKey);
        if (oldValue === null) return;

        if (oldValue === "true") {
            localStorage.setItem("todo_" + task.id, "true");
        }
        localStorage.removeItem(oldKey);
    });
}

function loadState() {
    boxes.forEach((box) => {
        if (localStorage.getItem(storageKey(box)) === "true") {
            box.checked = true;
        }
    });
}

function saveState() {
    boxes.forEach((box) => {
        localStorage.setItem(storageKey(box), box.checked);
    });
}


// =====================================================
// 朝5時のリセット
// =====================================================

// 「朝5時区切りの日付」を YYYY-MM-DD の文字列で返す
// （現在時刻から5時間引くと、朝5時が日付の境目になる）
function getResetDateString() {
    const now = new Date();
    now.setHours(now.getHours() - RESET_HOUR);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${date}`;
}

// 朝5時をまたいでいたら、チェックを全部外す
function checkDailyReset() {
    const lastSavedDate = localStorage.getItem('aniimo_last_date');
    const currentDate = getResetDateString();

    if (lastSavedDate !== currentDate) {
        boxes.forEach((box) => {
            box.checked = false;
            localStorage.removeItem(storageKey(box));
        });
        localStorage.setItem('aniimo_last_date', currentDate);
    }
}


// =====================================================
// 進捗バー
// =====================================================

// タスクの数だけ分割バーを作る
function createSegments() {
    progressTrack.innerHTML = "";
    boxes.forEach(() => {
        const segment = document.createElement("div");
        segment.classList.add("progress-segment");
        progressTrack.appendChild(segment);
    });
}

// チェックの数だけ、左から順にバーを光らせる
function updateProgress() {
    let count = 0;
    boxes.forEach((box) => {
        if (box.checked) count++;
    });

    const segments = document.querySelectorAll(".progress-segment");
    segments.forEach((segment, i) => {
        segment.classList.toggle("active", i < count);
    });

    progress.textContent = `${count} / ${boxes.length}`;
}


// =====================================================
// カウントダウン
// =====================================================

function updateCountdown() {
    // ★追加：開きっぱなしで朝5時をまたいだときも、ここで自動リセットされる
    checkDailyReset();
    updateProgress();

    const now = new Date();

    // 次の朝5:00を目標時刻にする
    const target = new Date();
    target.setHours(RESET_HOUR, 0, 0, 0);

    // 今日の5時をすでに過ぎていたら、明日の5時が目標
    if (now >= target) {
        target.setDate(target.getDate() + 1);
    }

    const diff = target - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');

    if (countdownEl) {
        countdownEl.textContent = `${hStr}時間${mStr}分${sStr}秒`;
    }
}


// =====================================================
// 背景スライドショー
// =====================================================

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

    // 最初の1枚はランダム
    let currentIndex = Math.floor(Math.random() * BG_IMAGES.length);
    let isSlideAActive = true;

    slideA.style.backgroundImage = `url('${BG_IMAGES[currentIndex]}')`;

    // 画像が1枚だけなら切り替えは不要
    if (BG_IMAGES.length <= 1) return;

    setInterval(() => {
        // 次の画像へ（最後まで行ったら0に戻る）
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


// =====================================================
// 起動
// =====================================================

migrateOldKeys();   // 旧データの引き継ぎ
checkDailyReset();  // 朝5時をまたいでいたらリセット
createSegments();   // 進捗バーを作る
loadState();        // 保存済みのチェックを復元
updateProgress();   // 表示を更新

// チェックを変えたら保存して、進捗を更新
boxes.forEach((box) => {
    box.addEventListener("change", () => {
        saveState();
        updateProgress();
    });
});

// カウントダウンは1秒ごと（5時またぎのリセット判定も兼ねる）
setInterval(updateCountdown, 1000);
updateCountdown();

initBackgroundSlideshow();
