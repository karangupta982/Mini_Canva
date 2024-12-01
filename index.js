let selectedText = null;
let undoStack = [];
let redoStack = [];

function addText() {
    const text = document.createElement('div');
    text.className = 'draggable-text';
    text.innerHTML = 'Double click to edit';
    text.style.left = '40vw';
    text.style.top = '30vh';
    text.style.fontSize = '20px';
    text.contentEditable = false;
    
    
    text.addEventListener('click', function(e) {
        selectText(this);
    });
    
   
    text.addEventListener('dblclick', function(e) {
        if (!text.classList.contains('editing')) {
            text.contentEditable = true;
            text.classList.add('editing');
            text.focus();
            
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(text);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    });

   
    text.addEventListener('blur', function() {
        text.contentEditable = false;
        text.classList.remove('editing');
    });

    makeDraggable(text);
    document.getElementById('canvas').appendChild(text);
    saveState();
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
   
    const dragHandle = element.querySelector('::after');
    
    element.addEventListener('mousedown', function(e) {
       
        const rect = element.getBoundingClientRect();
        const isNearCorner = (e.clientX > rect.right - 20) && (e.clientY < rect.top + 20);
        
        if (isNearCorner) {
            e.preventDefault();
            selectedElement = element;
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.addEventListener('mousemove', elementDrag);
            document.addEventListener('mouseup', closeDragElement);
        }
    });

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', closeDragElement);
        saveState();
    }
}

function changeFont() {
    if (selectedElement) {
        const fontSelect = document.getElementById('fontFamily');
        const selectedFont = fontSelect.value;
        if (selectedFont) {
            selectedElement.style.fontFamily = selectedFont;
            
            fontSelect.style.fontFamily = selectedFont;
        }
    }
}

function updateTextSizeDisplay(size) {
    const textSizeDisplay = document.getElementById('textSizeDisplay');
    
    textSizeDisplay.textContent = size + 'px';
}

function increaseSize() {
    if (selectedElement) {
       
        let currentSize = parseInt(window.getComputedStyle(selectedElement).fontSize);
        if (isNaN(currentSize)) currentSize = 16; 
        
        
        const newSize = currentSize + 2;
        
        
        selectedElement.style.fontSize = newSize + 'px';
        
        
        updateTextSizeDisplay(newSize);
        saveState();
    }
}

function decreaseSize() {
    if (selectedElement) {
        
        let currentSize = parseInt(window.getComputedStyle(selectedElement).fontSize);
        if (isNaN(currentSize)) currentSize = 16; 
        
        const newSize = Math.max(currentSize - 2, 1);
        selectedElement.style.fontSize = newSize + 'px';
        updateTextSizeDisplay(newSize);
        saveState();
    }
}

function toggleBold() {
    if (selectedElement) {
        const currentWeight = window.getComputedStyle(selectedElement).fontWeight;
        if (currentWeight === '700' || currentWeight === 'bold') {
            selectedElement.style.fontWeight = 'normal';
        } else {
            selectedElement.style.fontWeight = 'bold';
        }
        saveState();
    }
}

function toggleItalic() {
    if (selectedElement) {
        const currentStyle = window.getComputedStyle(selectedElement).fontStyle;
        if (currentStyle === 'italic') {
            selectedElement.style.fontStyle = 'normal';
        } else {
            selectedElement.style.fontStyle = 'italic';
        }
        saveState();
    }
}

function alignText(alignment) {
    if (selectedElement) {
        selectedElement.style.textAlign = alignment;
        
        if (alignment === 'center') {
            selectedElement.style.left = '50%';
            selectedElement.style.transform = 'translateX(-50%)';
        } else if (alignment === 'left') {
            selectedElement.style.left = '50px'; 
            selectedElement.style.transform = 'none';
        } else if (alignment === 'right') {
            selectedElement.style.right = '50px'; 
            selectedElement.style.left = 'auto';
            selectedElement.style.transform = 'none';
        }
        saveState();
    }
}

function saveState() {
    undoStack.push(document.getElementById('canvas').innerHTML);
    redoStack = [];
}

function undo() {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        document.getElementById('canvas').innerHTML = undoStack[undoStack.length - 1];
        reattachEventListeners();
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push(redoStack[redoStack.length - 1]);
        document.getElementById('canvas').innerHTML = redoStack.pop();
        reattachEventListeners();
    }
}

function reattachEventListeners() {
    document.querySelectorAll('.draggable-text').forEach(element => {
        
        element.addEventListener('click', function(e) {
            selectText(this);
        });
        
        
        element.addEventListener('dblclick', function(e) {
            if (!element.classList.contains('editing')) {
                element.contentEditable = true;
                element.classList.add('editing');
                element.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(element);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        });

        
        element.addEventListener('blur', function() {
            element.contentEditable = false;
            element.classList.remove('editing');
        });

        makeDraggable(element);
    });
}


function updateFontControls(element) {
    if (element) {
        
        const currentSize = parseInt(window.getComputedStyle(element).fontSize);
        updateTextSizeDisplay(currentSize);
        
        
        const currentFont = window.getComputedStyle(element).fontFamily.split(',')[0].replace(/['"]/g, '');
        const fontSelect = document.getElementById('fontFamily');
        fontSelect.value = currentFont;
        fontSelect.style.fontFamily = currentFont;
    }
}


function updateFormatControls(element) {
    if (element) {
        
        updateFontControls(element);
        const isBold = window.getComputedStyle(element).fontWeight === 'bold' || 
                      parseInt(window.getComputedStyle(element).fontWeight) >= 700;
        document.querySelector('button[onclick="toggleBold()"]')
            .classList.toggle('active', isBold);
        
        
        const isItalic = window.getComputedStyle(element).fontStyle === 'italic';
        document.querySelector('button[onclick="toggleItalic()"]')
            .classList.toggle('active', isItalic);
        
        
        const alignment = window.getComputedStyle(element).textAlign;
        document.querySelectorAll('button[onclick^="alignText"]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`button[onclick="alignText('${alignment}')"]`)?.classList.add('active');
    }
}


function selectText(element) {
    selectedElement = element;
    updateFormatControls(element);
}
