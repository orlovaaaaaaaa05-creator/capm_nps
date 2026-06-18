document.addEventListener('DOMContentLoaded', () => {
    const subtitle = document.getElementById('subtitle');
    const ratingButtonsContainer = document.getElementById('ratingButtons');
    const progressBar = document.getElementById('progressBar');
    const surveyForm = document.getElementById('surveyForm');
    const submitBtn = document.getElementById('submitBtn');
    const loader = document.getElementById('loader');
    const formCard = document.getElementById('formCard');
    const successCard = document.getElementById('successCard');
    const restartBtn = document.getElementById('restartBtn');
    const wantToLearnCheckbox = document.getElementById('wantToLearn');
    
    const badCommentGroup = document.getElementById('badCommentGroup');
    const commentBadInput = document.getElementById('commentBad');
    const commentGoodInput = document.getElementById('commentGood');

    let currentRating = 0;

    subtitle.textContent = 'Последний день смены';
    generateRatingButtons();

    function generateRatingButtons() {
        const container = document.getElementById('ratingButtons');
        container.innerHTML = '';
        document.getElementById('progressBar').style.width = '0%';
        currentRating = 0;
        
        const labels = [
            "100% нет",
            "Точно нет",
            "Нет",
            "Скорее нет",
            "Навряд ли",
            "Не думаю",
            "Скорее да",
            "Да",
            "Точно да!",
            "100% да!!"
        ];
        
        for (let i = 1; i <= 10; i++) {
            const label = document.createElement('label');
            label.className = 'rating-btn';
            
            let circleClass = '';
            if (i <= 6) circleClass = 'critic-circle';
            else if (i <= 8) circleClass = 'neutral-circle';
            else circleClass = 'promoter-circle';
            
            label.innerHTML = `
                <input type="radio" name="rating" value="${i}">
                <div class="circle ${circleClass}">${i}</div>
                <div class="label">${labels[i-1]}</div>
            `;
            
            container.appendChild(label);
        }

        const ratingInputs = document.querySelectorAll('input[name="rating"]');
        ratingInputs.forEach(input => {
            input.addEventListener('change', handleRatingChange);
        });
    }

    function handleRatingChange(e) {
        currentRating = parseInt(e.target.value);
        progressBar.style.width = `${currentRating * 10}%`;

        if (currentRating < 9) {
            badCommentGroup.style.display = 'flex';
            commentBadInput.setAttribute('required', 'required');
        } else {
            badCommentGroup.style.display = 'none';
            commentBadInput.removeAttribute('required');
            commentBadInput.value = '';
        }
    }

    surveyForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (currentRating === 0) {
            alert('Пожалуйста, сначала поставь оценку!');
            return;
        }

        if (currentRating < 9) {
            if (!commentBadInput.value.trim()) {
                alert('Пожалуйста, напиши, что можно улучшить!');
                commentBadInput.focus();
                commentBadInput.style.borderColor = 'var(--primary)';
                commentBadInput.style.boxShadow = '4px 4px 0 var(--primary)';
                setTimeout(() => {
                    commentBadInput.style.borderColor = '';
                    commentBadInput.style.boxShadow = '';
                }, 2000);
                return;
            }
        }

        startSubmission();
    });

    function startSubmission() {
        submitBtn.style.display = 'none';
        loader.style.display = 'block';

        const wantToLearn = wantToLearnCheckbox.checked ? 'Да' : 'Нет';

        const formData = new FormData();
        formData.append('type', 'nps');
        formData.append('name', document.getElementById('name').value);
        formData.append('city', document.getElementById('city').value);
        formData.append('rating', currentRating);
        formData.append('commentBad', currentRating < 9 ? commentBadInput.value.trim() : '');
        formData.append('commentGood', commentGoodInput.value.trim() || '');
        formData.append('wantToLearn', wantToLearn);

        console.log('NPS Отправка:', {
            type: 'nps',
            name: document.getElementById('name').value,
            city: document.getElementById('city').value,
            rating: currentRating,
            wantToLearn: wantToLearn
        });

        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwle_H_lYsZVxaerQogEdm8LtSWfgbCJQ2cJsZt5BTASkL289QYQifdq7hq-7SoXLYHhg/exec';

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Ответ:', data);
            
            loader.style.display = 'none';
            formCard.style.display = 'none';
            successCard.style.display = 'block';
            
            successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Что-то пошло не так. Попробуй ещё раз!');
            submitBtn.style.display = 'block';
            loader.style.display = 'none';
        });
    }
    
    restartBtn.addEventListener('click', function() {
        successCard.style.display = 'none';
        formCard.style.display = 'block';
        
        surveyForm.reset();
        badCommentGroup.style.display = 'none';
        commentBadInput.removeAttribute('required');
        wantToLearnCheckbox.checked = false;
        
        generateRatingButtons();
    });
});