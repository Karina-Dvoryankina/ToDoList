import { pad, isSameDay, formatHuman } from '../utils/dates.js';

export const fp = window.flatpickr('#due', {
    locale: 'ru',
    static: true,
    minDate: 'today',
    enableTime: true,
    time_24hr: true,
    minuteIncrement: 5,
    defaultHour: 9,
    defaultMinute: 0,
    dateFormat: 'Y-m-d',
    appendTo: document.getElementById('task-modal'),

    onReady(_, __, inst){
        const inputEl = inst.input;
        const dueChip = document.querySelector('.deadline__button');

        inputEl.insertAdjacentElement('afterend', dueChip);
        inst._positionElement = dueChip;

        dueChip.addEventListener('click', (e) => {
        if (e.target.closest('.deadline__clear')) {
            inst.clear();         
            inst.close();
            syncDueChip(inst);
        } else {
            inst.open();           
        }
        });

        syncDueChip(inst);

        const footer = document.createElement('div');
        footer.className = 'fp-footer';

        const chip = document.createElement('div');
        chip.className = 'fp-chip';
        chip.innerHTML = `
            <span class="fp-chip__icon">🕒</span>
            <span class="fp-chip__label">Время</span>
            <span class="fp-chip__clear" aria-label="Очистить" title="Очистить">✕</span>
        `;

        footer.appendChild(chip);
        inst.calendarContainer.appendChild(footer);

        const timeEl = inst.calendarContainer.querySelector('.flatpickr-time');
        const pop = document.createElement('div');
        pop.className = 'fp-time-popover';
        pop.appendChild(timeEl);            
        footer.appendChild(pop);

        inst._timeChip = chip;
        inst._showTime = false;       

        chip.addEventListener('click', (e) => {
            if (e.target.closest('.fp-chip__clear')) {
                clearTime(inst);
            } else {
                toggleTime(inst);               
            }
        });

        syncChip(inst);
    },
    onOpen: updateMinTime,
    onChange(selectedDates, _str, inst){
        updateMinTime(selectedDates, _str, inst);
        syncChip(inst);
        syncDueChip(inst);
    },
    onValueUpdate(_sel, _str, inst){ 
        syncChip(inst);
        syncDueChip(inst);
    }
});


function toggleTime(inst){
    inst._showTime = !inst._showTime;
    inst.calendarContainer.classList.toggle('show-time', inst._showTime);

    inst.set('dateFormat', inst._showTime ? 'Y-m-d H:i' : 'Y-m-d');
    inst.set('altFormat',  inst._showTime ? 'd M, D H:i' : 'd M, D');

    let d = inst.selectedDates[0] ? new Date(inst.selectedDates[0]) : new Date();

    if (inst._showTime){
        const now = new Date();
        if (isSameDay(d, now)){
            const step = inst.config.minuteIncrement;
            const mins = Math.ceil(now.getMinutes()/step)*step;
            d.setHours(now.getHours(), mins, 0, 0);
        } else {
            d.setHours(inst.config.defaultHour, inst.config.defaultMinute, 0, 0);
        }
        inst.setDate(d, false);
        updateMinTime(inst.selectedDates, '', inst);
    } else {
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        inst.setDate(d, false);
        inst.set('minTime', null);
    }
    syncChip(inst);
    syncDueChip(inst);
}

function clearTime(inst){
    inst._showTime = false;
    inst.calendarContainer.classList.remove('show-time');
    inst.set('dateFormat', 'Y-m-d');
    inst.set('altFormat',  'd M, D');

    const d0 = inst.selectedDates[0] ? new Date(inst.selectedDates[0]) : new Date();
    const onlyDate = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate());
    inst.setDate(onlyDate, true);
    inst.set('minTime', null);

    syncChip(inst);
    syncDueChip(inst);
}

function syncChip(inst){
    const label = inst._timeChip.querySelector('.fp-chip__label');
    const clear = inst._timeChip.querySelector('.fp-chip__clear');

    const d = inst.selectedDates[0];
    if (inst._showTime && d){
        label.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        inst._timeChip.classList.add('has-time');
        clear.style.display = 'inline-flex';
    } else {
        label.textContent = 'Время';
        inst._timeChip.classList.remove('has-time');
        clear.style.display = 'none';
    }
}

function updateMinTime(selectedDates, _str, inst){
    if (!inst._showTime) return;

    const now = new Date();
    const sel = selectedDates[0] || inst.selectedDates[0];
    if (!sel) return;

    if (isSameDay(sel, now)){
        const step = inst.config.minuteIncrement;
        const mins = Math.ceil(now.getMinutes()/step)*step;
        if (sel < now) {
            const clamped = new Date(sel);
            clamped.setHours(now.getHours(), mins, 0, 0);
            inst.setDate(clamped, false);
        }
    } else {
        inst.set('minTime', '00:00');
    }
}

function syncDueChip(inst){
    const chip  = document.getElementById('deadline__button');
    const label = chip.querySelector('.deadline__label');
    const clear = chip.querySelector('.deadline__clear');
    const d = inst.selectedDates[0];

    if (d){
        label.textContent = formatHuman(d, inst._showTime);
        chip.classList.add('deadline__button--active');
        clear.style.display = 'inline-flex';
    } else {
        label.textContent = 'Срок';
        chip.classList.remove('deadline__button--active');
        clear.style.display = 'none';
    }
}
