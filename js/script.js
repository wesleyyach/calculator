const display = document.getElementById('display');

// Adiciona animação ao pressionar botões
function animateButton(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 100);
}

// Adiciona evento de animação a todos os botões
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => animateButton(button));
});

function appendToDisplay(value) {
    // Evita múltiplos pontos decimais
    if (value === '.' && display.value.includes('.')) {
        return;
    }
    
    // Evita múltiplos operadores consecutivos
    if (['+', '-', '*', '/'].includes(value)) {
        const lastChar = display.value.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
            display.value = display.value.slice(0, -1) + value;
            return;
        }
    }

    if (display.value === '0' && value !== '.') {
        display.value = value;
    } else {
        display.value += value;
    }
}

function clearDisplay() {
    display.value = '0';
}

function deleteLastChar() {
    display.value = display.value.slice(0, -1);
    if (display.value === '') {
        display.value = '0';
    }
}

function calculate() {
    try {
        // Verifica se há algo para calcular
        if (!display.value || display.value === '0') {
            return;
        }

        // Substitui × por * e ÷ por /
        let expression = display.value.replace(/×/g, '*').replace(/÷/g, '/');
        
        // Verifica se a expressão é válida
        if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
            throw new Error('Expressão inválida');
        }

        const result = eval(expression);
        
        // Verifica se o resultado é um número válido
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Resultado inválido');
        }

        // Formata o resultado
        display.value = Number(result.toFixed(8)).toString();
    } catch (error) {
        display.value = 'Erro';
        setTimeout(clearDisplay, 1000);
    }
}

// Adiciona suporte para teclado
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    // Números e operadores
    if (/[\d+\-*/.()]/.test(key)) {
        event.preventDefault();
        appendToDisplay(key);
    }
    
    // Teclas especiais
    switch(key) {
        case 'Enter':
            event.preventDefault();
            calculate();
            break;
        case 'Escape':
            event.preventDefault();
            clearDisplay();
            break;
        case 'Backspace':
            event.preventDefault();
            deleteLastChar();
            break;
    }
});

// Efeito de digitação no display
display.addEventListener('input', () => {
    if (display.value === '') {
        display.value = '0';
    }
}); 