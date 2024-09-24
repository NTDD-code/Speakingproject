const startBtn = document.getElementById('startBtn');
const pronounceBtn = document.getElementById('pronounceBtn');
const userInputField = document.getElementById('userInput');
const resultDisplay = document.getElementById('result');
const feedbackDisplay = document.getElementById('feedback');
const voiceSwitch = document.getElementById('voiceSwitch');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const shrinkBtn = document.getElementById('shrinkBtn');

let wordToRead = '';
let recognizing = false;

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.interimResults = false;
recognition.lang = 'en-US';

// Sự kiện khi bấm nút bắt đầu luyện tập
startBtn.addEventListener('click', () => {
    if (recognizing) {
        recognition.stop(); // Dừng ghi âm nếu đang ghi âm
        startBtn.textContent = 'Bắt đầu luyện tập'; // Đặt lại văn bản nút
    } else {
        wordToRead = userInputField.value.trim();
        if (!wordToRead) {
            resultDisplay.textContent = 'Vui lòng nhập từ hoặc đoạn văn trước khi bắt đầu luyện tập.';
            return;
        }
        recognition.start(); // Bắt đầu ghi âm
        resultDisplay.textContent = '';
        feedbackDisplay.textContent = '';
        startBtn.disabled = true;
        startBtn.textContent = 'Đang lắng nghe...'; // Cập nhật văn bản nút
    }
});

// Xử lý sự kiện khi ghi âm bắt đầu
recognition.onstart = function() {
    recognizing = true;
    startBtn.textContent = 'Dừng luyện tập'; // Cập nhật văn bản nút
};

// Xử lý sự kiện khi ghi âm kết thúc
recognition.onend = function() {
    recognizing = false;
    startBtn.disabled = false; // Kích hoạt lại nút
    startBtn.textContent = 'Bắt đầu luyện tập'; // Đặt lại văn bản nút
};

// Xử lý kết quả ghi âm
recognition.onresult = async function(event) {
    const transcript = event.results[0][0].transcript;
    resultDisplay.textContent = `Bạn đã nói: ${transcript}`; // Hiển thị kết quả

    // Loại bỏ các ký tự đặc biệt và so sánh
    const cleanedTranscript = cleanString(transcript);
    const cleanedWordToRead = cleanString(wordToRead);

    // So sánh kết quả đã nói với từ cần đọc
    if (cleanedTranscript === cleanedWordToRead) {
        resultDisplay.innerHTML = `Bạn đã nói đúng: "${cleanedTranscript}". Rất tốt!`;
    } else {
        // Phân tích lỗi phát âm
        const phonemeErrors = analyzePhonemeErrors(cleanedTranscript, cleanedWordToRead);
        console.log('Phoneme Errors:', phonemeErrors);

        // Tính điểm nâng cao cải thiện
        const score = calculateAdvancedScore(cleanedTranscript, cleanedWordToRead);
        resultDisplay.innerHTML = `Bạn đã nói: "${highlightPhonemeErrors(cleanedTranscript, phonemeErrors)}". Điểm: ${score}%`;

        // Phản hồi chi tiết từ ChatGPT
        const feedback = await getChatGPTDetailedFeedback(cleanedTranscript, cleanedWordToRead, phonemeErrors);
        feedbackDisplay.innerHTML = feedback;
        console.log('Feedback:', feedback);
    }

    startBtn.disabled = false;
    startBtn.textContent = 'Bắt đầu luyện tập';
};

// Hàm loại bỏ ký tự đặc biệt
function cleanString(str) {
    return str.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim();
}

// Xử lý lỗi khi không nhận diện được âm thanh hoặc các lỗi khác
recognition.onerror = (event) => {
    resultDisplay.textContent = `Có lỗi: ${event.error}`;
    startBtn.disabled = false;
    startBtn.textContent = 'Bắt đầu luyện tập';
};

// Sự kiện khi bấm nút phát âm
pronounceBtn.addEventListener('click', () => {
    wordToRead = userInputField.value.trim();
    if (!wordToRead) {
        resultDisplay.textContent = 'Vui lòng nhập từ hoặc đoạn văn trước khi nghe phát âm.';
        return;
    }
    playAudio(wordToRead);
});

// Phân tích lỗi phát âm chi tiết
function analyzePhonemeErrors(userInput, correctWord) {
    const userWords = userInput.split(' ');
    const correctWords = correctWord.split(' ');

    const phonemeErrors = [];
    correctWords.forEach((word, index) => {
        if (!userWords[index] || userWords[index] !== word) {
            phonemeErrors.push({ expected: word, got: userWords[index] || '[missing]' });
        }
    });

    return phonemeErrors;
}


// Xử lý lỗi khi không nhận diện được âm thanh hoặc các lỗi khác
recognition.onerror = (event) => {
    resultDisplay.textContent = `Có lỗi: ${event.error}`;
    startBtn.disabled = false;
    startBtn.textContent = 'Bắt đầu luyện tập';
};

// Sự kiện khi bấm nút phát âm
pronounceBtn.addEventListener('click', () => {
    wordToRead = userInputField.value.trim();
    if (!wordToRead) {
        resultDisplay.textContent = 'Vui lòng nhập từ hoặc đoạn văn trước khi nghe phát âm.';
        return;
    }
    playAudio(wordToRead);
});

// Hàm loại bỏ các dấu chấm, phẩy và ký tự đặc biệt
function cleanString(str) {
    return str.replace(/[^a-zA-Z\s]/g, '').trim().toLowerCase();
}

// Phân tích lỗi phát âm chi tiết
function analyzePhonemeErrors(userInput, correctWord) {
    const userWords = userInput.split(' ');
    const correctWords = correctWord.split(' ');

    const phonemeErrors = [];
    correctWords.forEach((word, index) => {
        if (!userWords[index] || userWords[index] !== word) {
            phonemeErrors.push({ expected: word, got: userWords[index] || '[missing]' });
        }
    });

    return phonemeErrors;
}

// Hàm tính điểm nâng cao cải thiện
function calculateAdvancedScore(transcript, correctWord) {
    const userWords = transcript.split(' ');
    const correctWords = correctWord.split(' ');

    let score = 0;
    let totalPoints = correctWords.length * 1.5; // Mỗi từ sẽ chiếm 1.5 điểm để linh hoạt hơn

    correctWords.forEach((word, index) => {
        if (!userWords[index]) {
            // Nếu người dùng thiếu từ, giảm nhẹ điểm
            score += 0.5; // Cộng 0.5 điểm cho từ thiếu để không bị âm
        } else if (userWords[index] === word) {
            score += 1.5; // Cộng 1.5 điểm cho mỗi từ hoàn toàn đúng
        } else if (levenshteinDistance(userWords[index], word) === 1) {
            // Nếu từ người dùng phát âm gần giống từ đúng, dùng khoảng cách Levenshtein
            score += 1; // Cộng 1 điểm nếu phát âm gần đúng (chỉ lệch 1 ký tự)
        } else if (levenshteinDistance(userWords[index], word) === 2) {
            // Nếu từ người dùng phát âm gần đúng, lệch 2 ký tự
            score += 0.7; // Cộng 0.7 điểm cho từ gần đúng
        } else if (word.startsWith(userWords[index])) {
            score += 0.5; // Cộng 0.5 điểm nếu phát âm gần đúng (chỉ đúng phần đầu)
        } else {
            score += 0.3; // Từ phát âm sai hoàn toàn nhưng không giảm hết
        }
    });

    // Xử lý trường hợp người dùng thiếu từ so với đoạn đúng
    if (userWords.length < correctWords.length) {
        let missingWords = correctWords.length - userWords.length;
        score -= missingWords * 0.3; // Mỗi từ thiếu giảm 0.3 điểm để không giảm quá nhiều
    }

    // Xử lý trường hợp người dùng nói thêm từ không có trong câu đúng
    if (userWords.length > correctWords.length) {
        let extraWords = userWords.length - correctWords.length;
        score -= extraWords * 0.5; // Mỗi từ dư sẽ trừ 0.5 điểm để không ảnh hưởng quá nhiều
    }

    // Tính điểm dựa trên tỷ lệ từ đúng so với tổng số từ trong câu
    const finalScore = (score / totalPoints) * 100;
    return Math.max(finalScore, 0).toFixed(2); // Đảm bảo điểm không âm và định dạng điểm số
}

// Hàm tính khoảng cách Levenshtein giữa hai từ
function levenshteinDistance(a, b) {
    const matrix = [];

    // Tạo ma trận khoảng cách ban đầu
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Tính toán khoảng cách
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // Thay thế
                    matrix[i][j - 1] + 1, // Chèn
                    matrix[i - 1][j] + 1 // Xóa
                );
            }
        }
    }

    return matrix[b.length][a.length];
}


// Lấy phản hồi chi tiết từ ChatGPT
async function getChatGPTDetailedFeedback(transcript, correctWord, phonemeErrors) {
    const prompt = `
        The user said: "${transcript}" but the correct pronunciation was "${correctWord}". 
        The detected errors are as follows: ${JSON.stringify(phonemeErrors)}.
        Please give detailed feedback with specific suggestions for improving pronunciation, and provide examples of the correct pronunciation for each error.
    `;

    const response = await fakeChatGPTAPI(prompt);
    return formatFeedback(response, phonemeErrors);
}

// Giả lập API ChatGPT để đưa ra phản hồi
async function fakeChatGPTAPI(prompt) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (prompt.includes("missed")) {
                resolve("You made several pronunciation errors. Focus on practicing the correct sounds for better clarity.");
            } else {
                resolve("Great job! No significant errors detected.");
            }
        }, 1000);
    });
}

// Định dạng phản hồi
function formatFeedback(feedback, phonemeErrors) {
    let areasToImprove = '';
    if (phonemeErrors.length > 0) {
        areasToImprove = phonemeErrors.map(error => {
            const videoUrl = `https://www.youtube.com/results?search_query=how+to+pronounce+${encodeURIComponent(error.expected)}`;
            return error.got === '[missing]'
                ? `- Bạn đã bỏ lỡ từ '${error.expected}'.`
                : `- Cố gắng phát âm âm '${error.expected}' thay vì '${error.got}'. <a href="${videoUrl}" target="_blank">Xem video hướng dẫn</a>`;
        }).join('<br>');
    }
    
    return `
        <strong>Nhận xét:</strong> ${feedback}<br><br>
        <strong>Các điểm cần cải thiện:</strong><br>
        ${areasToImprove || "Không có lỗi đáng kể nào. Rất tốt!"}
    `;
}



// Tô màu các lỗi phát âm
function highlightPhonemeErrors(transcript, phonemeErrors) {
    let highlightedTranscript = transcript;
    phonemeErrors.forEach(error => {
        if (error.got !== '[missing]') {
            const regex = new RegExp(`(${error.got})`, 'gi');
            highlightedTranscript = highlightedTranscript.replace(regex, `<span style="background-color: yellow;">$1</span>`);
        }
    });
    return highlightedTranscript;
}

// Phát âm từ nhập vào


let currentLang = 'en-US'; // Mặc định là giọng Anh - Mỹ

pronounceBtn.addEventListener('click', () => {
    wordToRead = userInputField.value.trim();
    if (!wordToRead) {
        resultDisplay.textContent = 'Vui lòng nhập từ hoặc đoạn văn trước khi nghe phát âm.';
        return;
    }
    playAudio(wordToRead, currentLang);
});

function playAudio(text, lang) {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel(); // Dừng phát âm hiện tại nếu đang nói
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
}

voiceSwitch.addEventListener('click', () => {
    if (currentLang === 'en-US') {
        currentLang = 'en-GB';
        voiceSwitch.textContent = 'Giọng hiện tại: Anh - Anh';
    } else {
        currentLang = 'en-US';
        voiceSwitch.textContent = 'Giọng hiện tại: Anh - Mỹ';
    }
    recognition.lang = currentLang; // Cập nhật giọng của Speech Recognition
});




const userInput = document.getElementById('userInput');

// Khi nhấn nút phóng to
fullscreenBtn.addEventListener('click', () => {
    if (userInput.requestFullscreen) {
        userInput.requestFullscreen();
    } else if (userInput.mozRequestFullScreen) {
        userInput.mozRequestFullScreen();
    } else if (userInput.webkitRequestFullscreen) {
        userInput.webkitRequestFullscreen();
    } else if (userInput.msRequestFullscreen) {
        userInput.msRequestFullscreen();
    }
});

// Khi nhấn nút thu nhỏ
shrinkBtn.addEventListener('click', () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
});

// Tự động ẩn và hiện nút khi thay đổi chế độ toàn màn hình
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullscreenBtn.style.display = 'none'; // Ẩn nút phóng to
        shrinkBtn.style.display = 'block'; // Hiện nút thu nhỏ
    } else {
        fullscreenBtn.style.display = 'block'; // Hiện lại nút phóng to
        shrinkBtn.style.display = 'none'; // Ẩn nút thu nhỏ
    }
});


// Xử lý lỗi khi không nhận diện được âm thanh hoặc các lỗi khác
recognition.onerror = (event) => {
    let errorMessage = '';

    switch (event.error) {
        case 'no-speech':
            errorMessage = 'Không có âm thanh nào được nhận diện. Vui lòng đảm bảo micro của bạn đang hoạt động và thử lại.';
            break;
        case 'audio-capture':
            errorMessage = 'Không thể truy cập micro. Vui lòng kiểm tra cài đặt thiết bị và cấp quyền sử dụng micro.';
            break;
        case 'not-allowed':
            errorMessage = 'Quyền truy cập micro đã bị từ chối. Vui lòng cấp quyền truy cập micro trong cài đặt trình duyệt.';
            break;
        case 'aborted':
            errorMessage = 'Quá trình nhận diện đã bị hủy. Vui lòng thử lại.';
            break;
        default:
            errorMessage = `Có lỗi xảy ra: ${event.error}. Vui lòng thử lại sau.`;
    }

    resultDisplay.textContent = errorMessage;
    startBtn.disabled = false;
    startBtn.textContent = 'Bắt đầu luyện tập';
};
// Hàm hiển thị kết quả nâng cao
function displayAdvancedResults(score, transcript, correctWord) {
    const scorePercentage = parseFloat(score); // Chuyển đổi điểm thành số thực
    const messageContainer = document.getElementById('result-message');

    // Xóa nội dung cũ nếu có
    messageContainer.innerHTML = '';

    // Tạo phần tử hiển thị tổng điểm
    const totalScoreElement = document.createElement('div');
    totalScoreElement.className = 'total-score';
    totalScoreElement.innerHTML = `<h2>Điểm tổng: ${scorePercentage}%</h2>`;
    messageContainer.appendChild(totalScoreElement);

    // Hiển thị thông báo dựa trên điểm số
    const feedbackMessage = document.createElement('p');
    if (scorePercentage >= 90) {
        feedbackMessage.textContent = 'Tuyệt vời! Bạn đã phát âm rất chính xác. Hãy duy trì phong độ này!';
        feedbackMessage.style.color = 'green';
    } else if (scorePercentage >= 75) {
        feedbackMessage.textContent = 'Rất tốt! Bạn đã phát âm tốt, nhưng hãy chú ý cải thiện thêm một số chi tiết nhỏ.';
        feedbackMessage.style.color = 'orange';
    } else if (scorePercentage >= 50) {
        feedbackMessage.textContent = 'Khá ổn! Bạn cần luyện tập thêm để nâng cao khả năng phát âm của mình.';
        feedbackMessage.style.color = 'darkorange';
    } else {
        feedbackMessage.textContent = 'Bạn cần luyện tập nhiều hơn nữa. Hãy chú ý đến các từ và âm mà bạn phát âm sai.';
        feedbackMessage.style.color = 'red';
    }
    messageContainer.appendChild(feedbackMessage);

    // Chia nhỏ điểm số thành các phần và hiển thị từng phần
    const detailedFeedback = calculateDetailedFeedback(transcript, correctWord);
    detailedFeedback.forEach((item) => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        feedbackItem.innerHTML = `<strong>${item.word}</strong>: ${item.feedback} (${item.score} điểm)`;
        feedbackItem.style.color = item.color; // Thay đổi màu sắc dựa trên độ chính xác của từng từ
        messageContainer.appendChild(feedbackItem);
    });

    // Gợi ý các điểm cần cải thiện
    const suggestion = document.createElement('p');
    suggestion.innerHTML = `<em>Gợi ý:</em> Hãy thử phát âm lại đoạn văn và chú ý đến những từ bạn thường phát âm sai. Sử dụng ứng dụng từ điển hoặc luyện nghe nhiều hơn để cải thiện phát âm.`;
    messageContainer.appendChild(suggestion);

    // Biểu đồ trực quan (Tùy chọn)
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    chartContainer.innerHTML = `<canvas id="scoreChart"></canvas>`;
    messageContainer.appendChild(chartContainer);
    drawScoreChart(detailedFeedback);
}

// Hàm tính toán điểm chi tiết cho từng từ
function calculateDetailedFeedback(transcript, correctWord) {
    const userWords = transcript.split(' ');
    const correctWords = correctWord.split(' ');
    const feedbackArray = [];

    correctWords.forEach((word, index) => {
        let feedback = '';
        let score = 0;
        let color = 'red';

        if (!userWords[index]) {
            feedback = 'Thiếu từ';
            score = 0.5; // Cộng điểm nhẹ cho từ thiếu
        } else if (userWords[index] === word) {
            feedback = 'Phát âm đúng';
            score = 1.5; // Cộng điểm hoàn toàn
            color = 'green';
        } else if (levenshteinDistance(userWords[index], word) === 1) {
            feedback = 'Phát âm gần đúng';
            score = 1; // Điểm gần đúng
            color = 'orange';
        } else if (levenshteinDistance(userWords[index], word) === 2) {
            feedback = 'Phát âm tương đối';
            score = 0.7;
            color = 'darkorange';
        } else if (word.startsWith(userWords[index])) {
            feedback = 'Phát âm phần đầu đúng';
            score = 0.5;
            color = 'yellow';
        } else {
            feedback = 'Phát âm sai';
            score = 0.3;
            color = 'red';
        }

        feedbackArray.push({
            word: word,
            feedback: feedback,
            score: score.toFixed(1), // Điểm chi tiết cho từng từ
            color: color
        });
    });

    return feedbackArray;
}

// Hàm vẽ biểu đồ kết quả
function drawScoreChart(feedbackArray) {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    const labels = feedbackArray.map(item => item.word);
    const data = feedbackArray.map(item => parseFloat(item.score));
    const colors = feedbackArray.map(item => item.color);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Điểm từ chi tiết',
                data: data,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1.5 // Điểm tối đa là 1.5 cho mỗi từ
                }
            }
        }
    });
}
recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log('Transcript:', transcript);

    const cleanedTranscript = cleanString(transcript);
    const cleanedWordToRead = cleanString(wordToRead);

    const phonemeErrors = analyzePhonemeErrors(cleanedTranscript, cleanedWordToRead);
    console.log('Phoneme Errors:', phonemeErrors);

    const score = calculateAdvancedScore(cleanedTranscript, cleanedWordToRead);
    
    // Hiển thị kết quả nâng cao
    displayAdvancedResults(score, cleanedTranscript, cleanedWordToRead);

    resultDisplay.innerHTML = `Bạn đã nói: "${highlightPhonemeErrors(cleanedTranscript, phonemeErrors)}". Điểm: ${score}%`;

    const feedback = await getChatGPTDetailedFeedback(cleanedTranscript, cleanedWordToRead, phonemeErrors);
    feedbackDisplay.innerHTML = feedback;
    console.log('Feedback:', feedback);

    startBtn.disabled = false;
    startBtn.textContent = 'Bắt đầu luyện tập';
};


let isSpeaking = false;

// Function to start/stop waves based on user speaking
function toggleWaves() {
    isSpeaking = !isSpeaking;
    const waves = document.querySelectorAll('.wave');

    if (isSpeaking) {
        waves.forEach(wave => wave.style.display = 'block'); // Show waves
    } else {
        waves.forEach(wave => wave.style.display = 'none'); // Hide waves
    }
}

// Simulate speaking status toggle
startBtn.addEventListener('click', toggleWaves);
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const scriptProcessor = audioContext.createScriptProcessor(256, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        scriptProcessor.onaudioprocess = function() {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);

            let volume = array.reduce((a, b) => a + b) / array.length;

            // Adjust wave sizes based on volume
            document.querySelectorAll('.wave').forEach((wave, index) => {
                wave.style.width = wave.style.height = (100 + volume * index) + 'px';
                wave.style.borderRadius = '50%';
            });
        };
    })
    .catch(error => console.error('Audio capture error:', error));


// Hàm hiển thị kết quả nâng cao
function displayAdvancedResults(score, transcript, correctWord) {
    const scorePercentage = parseFloat(score); // Chuyển đổi điểm thành số thực
    const messageContainer = document.getElementById('result-message');

    // Xóa nội dung cũ nếu có
    messageContainer.innerHTML = '';

    // Tạo phần tử hiển thị tổng điểm
    const totalScoreElement = document.createElement('div');
    totalScoreElement.className = 'total-score';
    totalScoreElement.innerHTML = `<h2>Điểm tổng: ${scorePercentage}%</h2>`;
    messageContainer.appendChild(totalScoreElement);

    // Hiển thị thông báo dựa trên điểm số
    const feedbackMessage = document.createElement('p');
    if (scorePercentage >= 90) {
        feedbackMessage.textContent = 'Rất tốt! Bạn đã phát âm rất chính xác.';
    } else if (scorePercentage >= 70) {
        feedbackMessage.textContent = 'Khá tốt! Tuy nhiên, cần cải thiện một số âm để đạt độ chính xác cao hơn.';
    } else {
        feedbackMessage.textContent = 'Cần cải thiện! Hãy tập trung luyện phát âm các âm mà bạn chưa nói đúng.';
    }
    messageContainer.appendChild(feedbackMessage);

    // Thêm ví dụ cụ thể nếu có từ nào sai
    const phonemeErrors = analyzePhonemeErrors(transcript, correctWord);
    if (phonemeErrors.length > 0) {
        const errorList = document.createElement('ul');
        phonemeErrors.forEach(error => {
            const listItem = document.createElement('li');
            listItem.textContent = `Bạn đã phát âm từ "${error.got}" thay vì "${error.expected}".`;
            errorList.appendChild(listItem);
        });
        messageContainer.appendChild(errorList);
    }
}
let silenceTimer;

const MAX_SILENCE_DURATION = 5000; // 5 seconds

// Sự kiện khi nhận được kết quả từ Speech Recognition
recognition.onresult = async (event) => {
    clearTimeout(silenceTimer); // Reset the timer on receiving speech
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log('Transcript:', transcript);
    console.log('Expected word:', wordToRead);

    // Loại bỏ các ký tự đặc biệt trước khi phân tích
    const cleanedTranscript = cleanString(transcript);
    const cleanedWordToRead = cleanString(wordToRead);

    // So sánh trực tiếp trước khi phân tích lỗi phát âm
    if (cleanedTranscript === cleanedWordToRead) {
        resultDisplay.innerHTML = `Bạn đã nói đúng: "${cleanedTranscript}". Rất tốt!`;
    } else {
        // Phân tích lỗi phát âm
        const phonemeErrors = analyzePhonemeErrors(cleanedTranscript, cleanedWordToRead);
        console.log('Phoneme Errors:', phonemeErrors);

        // Tính điểm nâng cao cải thiện
        const score = calculateAdvancedScore(cleanedTranscript, cleanedWordToRead);
        resultDisplay.innerHTML = `Bạn đã nói: "${highlightPhonemeErrors(cleanedTranscript, phonemeErrors)}". Điểm: ${score}%`;

        // Phản hồi chi tiết từ ChatGPT
        const feedback = await getChatGPTDetailedFeedback(cleanedTranscript, cleanedWordToRead, phonemeErrors);
        feedbackDisplay.innerHTML = feedback;
        console.log('Feedback:', feedback);
    }

    startBtn.disabled = false;
    startBtn.textContent = 'Bắt đầu luyện tập';

    // Start the silence timer
    silenceTimer = setTimeout(() => {
        recognition.stop();
        resultDisplay.textContent = "Đã dừng nhận diện do không có âm thanh trong 5 giây.";
        startBtn.disabled = false;
        startBtn.textContent = 'Bắt đầu luyện tập';
    }, MAX_SILENCE_DURATION);
};

// Khởi động nhận diện
recognition.onstart = () => {
    startBtn.textContent = 'Đang lắng nghe...';
    // Reset the silence timer when recognition starts
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
        recognition.stop();
        resultDisplay.textContent = "Đã dừng nhận diện do không có âm thanh trong 5 giây.";
        startBtn.disabled = false;
        startBtn.textContent = 'Bắt đầu luyện tập';
    }, MAX_SILENCE_DURATION);
};

// Dừng nhận diện khi có lỗi
recognition.onerror = (event) => {
    clearTimeout(silenceTimer); // Clear timer on error
    resultDisplay.textContent = `Có lỗi: ${event.error}`;
    startBtn.disabled = false;
    startBtn.textContent = 'Bắt đầu luyện tập';
};

const cancelButton = document.getElementById('cancelButton');

cancelButton.addEventListener('click', () => {
    speechRecognition.stop(); // Dừng nhận diện giọng nói
});

const suggestionsBox = document.getElementById('suggestionsBox');

// Sample word list for suggestions (Replace this with an API call for more complex suggestions)
const wordSuggestions = ["hello", "help", "happy", "habit", "happiness", "harmony", "hazard", "hero", "heritage"];

// Function to suggest words based on user input
userInputField.addEventListener('input', function() {
    const userInput = userInputField.value.trim().toLowerCase();
    suggestionsBox.innerHTML = ''; // Clear previous suggestions
    
    if (userInput.length > 0) {
        const suggestions = wordSuggestions.filter(word => word.startsWith(userInput));
        
        if (suggestions.length > 0) {
            suggestionsBox.style.display = 'block';
            suggestions.forEach(suggestion => {
                const suggestionElement = document.createElement('div');
                suggestionElement.textContent = suggestion;
                suggestionElement.style.padding = '5px';
                suggestionElement.style.cursor = 'pointer';
                suggestionElement.style.backgroundColor = '#f0f0f0';
                suggestionElement.addEventListener('click', () => {
                    userInputField.value = suggestion; // Set the clicked suggestion as input
                    suggestionsBox.style.display = 'none'; // Hide suggestions after selection
                });
                suggestionsBox.appendChild(suggestionElement);
            });
        } else {
            suggestionsBox.style.display = 'none';
        }
    } else {
        suggestionsBox.style.display = 'none';
    }
});

// Hide suggestion box when clicking outside
document.addEventListener('click', function(e) {
    if (e.target !== userInputField && e.target.parentNode !== suggestionsBox) {
        suggestionsBox.style.display = 'none';
    }
});
