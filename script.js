let currentQ = 0;
const paper = allPapers[localStorage.getItem('paperId')];
let userAnswers = new Array(paper.questions.length).fill(null);
let isFinished = false;

// පිළිතුරු අහඹු ලෙස සැකසීම
let shuffledOptions = paper.questions.map(q => {
    let opts = [...q.options];
    let correct = opts[0];
    let others = opts.slice(1).sort(() => Math.random() - 0.5);
    return [correct, ...others].sort(() => Math.random() - 0.5);
});

let inputTime = localStorage.getItem('time');
let timeLeft = (inputTime && inputTime > 0) ? parseInt(inputTime) * 60 : 1200;

const timerInterval = setInterval(() => {
    if (isFinished) return;
    timeLeft--;
    let m = Math.floor(timeLeft/60);
    let s = timeLeft % 60;
    document.getElementById('timer').innerText = m + ":" + (s < 10 ? '0' + s : s);
    if(timeLeft <= 0) { clearInterval(timerInterval); showResults(); }
}, 1000);

function render() {
    const q = paper.questions[currentQ];
    let imgHTML = q.img ? `<img src="${q.img}" style="width:100%; border-radius:12px; margin-bottom:15px;">` : '';
    
    // ප්‍රශ්න සහ උත්තර Render කිරීම
    let optionsHTML = shuffledOptions[currentQ].map(o => {
        let className = 'option-btn';
        if(userAnswers[currentQ] === o) className += ' selected';
        
        if(isFinished) {
            if(o === paper.questions[currentQ].options[0]) className += ' correct';
            else if(userAnswers[currentQ] === o && o !== paper.questions[currentQ].options[0]) className += ' wrong';
        }
        
        return `<button class="${className}" onclick="${isFinished ? '' : "select('"+o+"')"}">${o}</button>`;
    }).join('');

    // explanation කොටස එකතු කිරීම
    let explanationHTML = '';
    if (isFinished && q.explanation) {
        explanationHTML = `<div class="explanation-text" style="color: yellow; margin-top: 15px; padding: 10px; border: 1px solid yellow; border-radius: 8px;">
            <strong>විස්තරය:</strong> ${q.explanation}
        </div>`;
    }
    
    document.getElementById('question-box').innerHTML = `<h3>${q.q}</h3>` + imgHTML + optionsHTML + explanationHTML;
    
    // ප්‍රශ්න අංක දර්ශකය (Indicators) Render කිරීම
    document.getElementById('indicator').innerHTML = paper.questions.map((_,i) => {
        let indClass = 'ind-box';
        if(isFinished) {
            if(userAnswers[i] === paper.questions[i].options[0]) indClass += ' correct-ind';
            else indClass += ' wrong-ind';
        } else if(userAnswers[i]) {
            indClass += ' answered';
        }
        return `<div class="${indClass}">${i+1}</div>`;
    }).join('');
}

function select(opt) { userAnswers[currentQ] = opt; render(); }
function changeQ(d) { currentQ = Math.max(0, Math.min(paper.questions.length-1, currentQ+d)); render(); }

function showModal(title, body, actions = `<button onclick="document.getElementById('result-modal').style.display='none'">Close</button>`) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal-actions-container').innerHTML = actions;
    document.getElementById('result-modal').style.display = 'flex';
}

function goHome() {
    showModal("අවවාදයයි!", "විභාගය අවලංගු කර හෝම් පිටුවට යාමට අවශ්‍යද?", 
    `<div class="modal-actions"><button class="btn-red" onclick="window.location.href='index.html'">ඔව්</button><button class="btn-green" onclick="document.getElementById('result-modal').style.display='none'">නැහැ</button></div>`);
}

function checkSubmit() {
    let un = userAnswers.map((a,i) => a ? null : i+1).filter(v => v);
    if(un.length) showModal("මගහැරුණු ප්‍රශ්න", "ඔබ තවමත් ප්‍රශ්න අංක: " + un.join(", ") + " වලට පිළිතුරු සපයා නැත.");
    else showModal("අවසානය", "විභාගය අවසන් කිරීමට සූදානම්ද?", 
    `<div class="modal-actions"><button class="btn-green" onclick="showResults()">ඔව්</button><button class="btn-red" onclick="document.getElementById('result-modal').style.display='none'">නැහැ</button></div>`);
}

function showResults() {
    isFinished = true;
    clearInterval(timerInterval);
    let score = userAnswers.filter((a,i) => a === paper.questions[i].options[0]).length;
    let res = (score / paper.questions.length) * 100;
    
    render();
    
    let status = res >= 65 ? '<span class="pass">PASS!</span>' : '<span class="fail">FAIL!</span>';
    showModal("ප්‍රතිඵලය", `ලකුණු: ${score}<br>ප්‍රතිශතය: ${res}%<br><h3>${status}</h3>`);
}

render();
